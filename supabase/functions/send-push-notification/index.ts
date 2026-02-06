import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const message = body.message || '¡Recordatorio: Envía tu informe mensual de servicio!';
    const targetMonth = typeof body.targetMonth === 'string' ? body.targetMonth.trim().toLowerCase() : null;
    const targetYear = Number.isFinite(Number(body.targetYear)) ? Number(body.targetYear) : null;

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    webpush.setVapidDetails(
      'mailto:admin@congregacion.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    // Get all subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, total: 0, failed: 0, skipped: 0, message: 'No subscriptions found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Filtrar: no enviar si el dispositivo ya marcó reporte enviado para ese periodo
    const eligibleSubscriptions = subscriptions.filter((sub: any) => {
      if (!targetMonth || !targetYear) return true;

      const lastMonth = typeof sub.last_report_month === 'string'
        ? sub.last_report_month.trim().toLowerCase()
        : null;
      const lastYear = Number.isFinite(Number(sub.last_report_year))
        ? Number(sub.last_report_year)
        : null;

      return !(lastMonth === targetMonth && lastYear === targetYear);
    });

    let sent = 0;
    let failed = 0;

    const payload = JSON.stringify({
      title: 'Recordatorio de Informe',
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      url: '/'
    });

    for (const subscription of eligibleSubscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys_p256dh,
              auth: subscription.keys_auth,
            },
          },
          payload
        );
        sent++;
      } catch (error: any) {
        failed++;
        console.error(`Failed to send notification to ${subscription.endpoint}:`, error.message);

        // Remove invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
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
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error sending push notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
