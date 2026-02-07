import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const normalizeMonth = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  return v || null;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      },
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const testMode = Boolean(body?.testMode);
    const testEndpoint = typeof body?.endpoint === 'string' ? body.endpoint : null;

    const message = typeof body?.message === 'string' && body.message.trim().length > 0
      ? body.message.trim()
      : '¡Recordatorio: Envía tu informe mensual de servicio!';

    const targetMonth = normalizeMonth(body?.targetMonth);
    const targetYear = Number.isFinite(Number(body?.targetYear)) ? Number(body.targetYear) : null;

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    webpush.setVapidDetails(
      'mailto:admin@congregacion.com',
      vapidPublicKey,
      vapidPrivateKey,
    );

    // For broadcast mode, require auth header presence
    if (!testMode) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          },
        );
      }
    }

    // Get subscriptions
    let query = supabase.from('push_subscriptions').select('*');

    if (testMode && testEndpoint) {
      query = query.eq('endpoint', testEndpoint);
    }

    const { data: subscriptions, error: subscriptionsError } = await query;

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
          total: 0,
          failed: 0,
          skipped: 0,
          message: testMode ? 'Test subscription not found' : 'No subscriptions found',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    // Filter by report period only for broadcast reminders
    const eligibleSubscriptions = subscriptions.filter((sub: any) => {
      if (testMode) return true;
      if (!targetMonth || !targetYear) return true;

      const lastMonth = normalizeMonth(sub.last_report_month);
      const lastYear = Number.isFinite(Number(sub.last_report_year))
        ? Number(sub.last_report_year)
        : null;

      return !(lastMonth === targetMonth && lastYear === targetYear);
    });

    let sent = 0;
    let failed = 0;

    const payload = JSON.stringify({
      title: testMode ? 'Prueba de Notificación' : 'Recordatorio de Informe',
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      url: '/',
    });

    for (const subscription of eligibleSubscriptions) {
      const p256dh = subscription.keys_p256dh ?? subscription.p256dh;
      const auth = subscription.keys_auth ?? subscription.auth;

      if (!subscription.endpoint || !p256dh || !auth) {
        failed++;
        console.error('Invalid subscription payload (missing endpoint/keys):', subscription?.id);
        continue;
      }

      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh, auth },
          },
          payload,
        );
        sent++;
      } catch (error: any) {
        failed++;
        console.error(`Failed to send notification to ${subscription.endpoint}:`, error?.message || error);

        // Remove invalid subscriptions
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', subscription.id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        failed,
        total: subscriptions.length,
        skipped: subscriptions.length - eligibleSubscriptions.length,
        testMode,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error('Error sending push notifications:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
