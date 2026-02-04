# Configuración de Push Notifications para Supabase Externo

## 1. Generar VAPID Keys

Ejecuta este comando en tu terminal para generar las claves VAPID:

```bash
npx web-push generate-vapid-keys
```

Esto te dará algo como:
```
Public Key: BEl62iUYgUivxIkv69yV...
Private Key: UUxI4O8r...
```

---

## 2. Crear la tabla en tu Supabase

Ejecuta este SQL en el SQL Editor de tu proyecto Supabase:

```sql
-- Crear tabla para almacenar suscripciones push
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (cualquiera puede suscribirse)
CREATE POLICY "Anyone can create push subscription" 
ON public.push_subscriptions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read push subscriptions" 
ON public.push_subscriptions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can delete push subscriptions" 
ON public.push_subscriptions 
FOR DELETE 
USING (true);
```

---

## 3. Agregar Secrets en Supabase

En tu dashboard de Supabase:
1. Ve a **Settings** → **Edge Functions** → **Secrets**
2. Agrega estos secrets:
   - `VAPID_PUBLIC_KEY` = tu clave pública generada
   - `VAPID_PRIVATE_KEY` = tu clave privada generada
   - `VAPID_SUBJECT` = `mailto:tu-email@ejemplo.com`

---

## 4. Crear la Edge Function

Crea un archivo en `supabase/functions/send-push-notification/index.ts`:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Web Push implementation for Deno
async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidKeys: { publicKey: string; privateKey: string; subject: string }
) {
  const encoder = new TextEncoder();
  
  // Import VAPID private key
  const privateKeyData = base64UrlDecode(vapidKeys.privateKey);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyData,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  // Create JWT for VAPID
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    aud: new URL(subscription.endpoint).origin,
    exp: now + 12 * 60 * 60,
    sub: vapidKeys.subject,
  };

  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(jwtPayload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    encoder.encode(unsignedToken)
  );

  const jwt = `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;

  // Send push notification
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
      Authorization: `vapid t=${jwt}, k=${vapidKeys.publicKey}`,
    },
    body: payload,
  });

  return response;
}

function base64UrlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@example.com";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all subscriptions
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (error) throw error;

    const vapidKeys = {
      publicKey: vapidPublicKey,
      privateKey: vapidPrivateKey,
      subject: vapidSubject,
    };

    let successCount = 0;
    let failCount = 0;
    const failedEndpoints: string[] = [];

    // Send to all subscriptions
    for (const sub of subscriptions || []) {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth,
          },
        };

        const response = await sendWebPush(subscription, message, vapidKeys);

        if (response.ok) {
          successCount++;
        } else if (response.status === 410 || response.status === 404) {
          // Subscription expired, remove it
          failedEndpoints.push(sub.endpoint);
          failCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error("Error sending to subscription:", err);
        failCount++;
      }
    }

    // Clean up expired subscriptions
    if (failedEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", failedEndpoints);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        total: subscriptions?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

---

## 5. Desplegar la Edge Function

Desde tu terminal, en la carpeta del proyecto:

```bash
supabase functions deploy send-push-notification
```

---

## 6. Configurar Variable de Entorno en tu Proyecto

En tu archivo `.env` (o en Vercel Environment Variables):

```
VITE_VAPID_PUBLIC_KEY=tu_clave_publica_vapid
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_anon_key
```

---

## 7. Uso

El código del frontend ya está configurado. Solo necesitas:

1. Generar las claves VAPID
2. Crear la tabla en Supabase
3. Agregar los secrets
4. Desplegar la Edge Function
5. Agregar `VITE_VAPID_PUBLIC_KEY` a tus variables de entorno

¡Listo! Los usuarios que activen notificaciones serán registrados y cuando presiones "Recordatorio" en el admin, se enviará a todos.
