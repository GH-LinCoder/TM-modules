
// sql/functions/payment-webhook.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// 🔔 LOG: Module load
console.log('💳 payment-webhook module loaded');

// Normalize provider-specific statuses
// Normalize provider-specific statuses
function mapStatus(raw: string, provider: string): string {
  const maps: Record<string, Record<string, string>> = {
    lemon: {
      paid: 'active', 
      active: 'active', 
      cancelled: 'cancelled', 
      expired: 'expired',
      unsubscribed: 'cancelled', 
      failed: 'past_due', 
      unpaid: 'past_due', 
      refunded: 'cancelled'
    },
    whop: { 
      active: 'active', 
      completed: 'active',      // membership.activated
      paid: 'active',           // payment.succeeded
      canceled: 'cancelled',    // American spelling → British
      cancelled: 'cancelled',   // British spelling (defensive)
      expired: 'expired', 
      refunded: 'cancelled',
      past_due: 'past_due'
    }
  };
  
  // Trim whitespace and look up mapping
  const trimmed = raw?.trim() || '';
  const result = maps[provider]?.[trimmed] || trimmed || 'active';
  
  // 🔔 DEBUG LOG (remove after testing)
  console.log(`🗺️ mapStatus DEBUG: provider="${provider}", raw="${raw}", trimmed="${trimmed}", result="${result}", matched=${!!maps[provider]?.[trimmed]}`);
  
  return result;
}

// Safe string conversion helper
function safeString(value: any): string | null {
  return value != null ? String(value) : null;
}


function getMVPStatus(eventType: string, rawStatus: string): string {// 20:43 April 18
  // Recovery flow: payment success after failure → restore to active
  if (eventType === 'invoice_paid' && ['past_due', 'unpaid'].includes(rawStatus)) {
    return 'active';
  }
  
  const statusMap: Record<string, string> = {
    'paid': 'active', 'active': 'active', 'completed': 'active',
    'cancelled': 'canceled', 'canceled': 'canceled', 'unsubscribed': 'canceled',
    'expired': 'expired', 'refunded': 'refunded',
    'past_due': 'past_due', 'unpaid': 'unpaid',
    'one_time': 'one_time'
  };
  
  return statusMap[rawStatus] || 'active';
}


// Hex to bytes helper (for Lemon signature verification)
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Helper: Remove undefined values before storing
function sanitizeForJsonb(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForJsonb);
  
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v !== undefined)  // Remove undefined
      .map(([k, v]) => [k, sanitizeForJsonb(v)])
  );
}


// Extract webhook data
function extractWebhookData(body: string, provider: string) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch (e) {
    console.error('❌ Failed to parse webhook JSON:', e);
    return null;
  }

// In extractWebhookData():

if (provider === 'lemon') {
  const attrs = payload.data?.attributes || {};
  const dataType = payload.data?.type;  // 'orders' or 'subscriptions'
  const firstItem = attrs?.first_order_item || attrs?.order_items?.[0] || {};

  return {
    appro_id: payload.meta?.custom_data?.appro_id || null,
    customerEmail: attrs?.user_email || attrs?.customer_email || null,
    
    // subscriptionId: order id for orders, subscription id for subscriptions
    subscriptionId: 
      safeString(payload.data?.id) ?? 
      safeString(attrs?.order_number) ?? 
      null,
    
    // processorCustomerId: Lemon's customer ID
    processorCustomerId: 
      safeString(attrs?.customer_id) ?? 
      safeString(payload.data?.relationships?.customer?.data?.id) ?? 
      null,
    
    status: attrs?.status || payload.meta?.event_name,
    
    endDate: attrs?.renews_at 
      ? new Date(attrs.renews_at).toISOString() 
      : attrs?.ends_at 
        ? new Date(attrs.ends_at).toISOString() 
        : null,
    
    // ✅ itemBoughtId: variant_id from correct location
    itemBoughtId: 
      safeString(attrs?.variant_id) ?? 
      safeString(firstItem?.variant_id) ?? 
      null,
    
    // ✅ processorProductId: product_id from correct location
    processorProductId: 
      safeString(attrs?.product_id) ?? 
      safeString(firstItem?.product_id) ?? 
      null,
    
    // ✅ processorPriceId: price_id from correct location (FIXED)
    processorPriceId: 
      safeString(firstItem?.price_id) ??    // Orders: nested in first_order_item
      safeString(attrs?.price_id) ??        // Subscriptions: at root
      null,
    
    // ✅ amount: use ?? to preserve 0 values
    amount: 
      attrs?.total ?? 
      attrs?.subtotal ?? 
      attrs?.price ?? 
      null,
    
    currency: (attrs?.currency || 'USD').toUpperCase(),
    processorEventType: payload.meta?.event_name,
    
    rawPayload: sanitizeForJsonb({
      event: payload.meta?.event_name,
      type: dataType,
      subscription_id: safeString(payload.data?.id),
      customer_email: attrs?.user_email,
      status: attrs?.status,
      amount: attrs?.total ?? attrs?.subtotal ?? attrs?.price,
      currency: attrs?.currency,
      variant_id: safeString(attrs?.variant_id) ?? safeString(firstItem?.variant_id),
      price_id: safeString(firstItem?.price_id) ?? safeString(attrs?.price_id),
      received_at: new Date().toISOString()
    })
  };
}

if (provider === 'whop') {
  const data = payload.data || payload;
  const user = data?.user || {};
  
  // ✅ Check multiple locations for UTM params
  const utmContent = 
    data?.meta?.utm_content ?? 
    data?.utm_content ?? 
    payload?.meta?.utm_content ?? 
    null;
  
  console.log('🛒 Whop UTM debug:', {
    utm_content: utmContent,
    data_meta: data?.meta,
    user_email: user?.email
  });

  return {
    // ✅ appro_id from utm_content (UTM workaround)
    appro_id: utmContent || null,
    
    customerEmail: user?.email || null,
    subscriptionId: safeString(data?.id),
    processorCustomerId: safeString(user?.id),
    status: data?.status,
    
    endDate: data?.expires_at 
      ? new Date(data.expires_at * 1000).toISOString()
      : data?.renewal_period_end 
        ? new Date(data.renewal_period_end * 1000).toISOString()
        : null,
    
    itemBoughtId: safeString(data?.plan_id) ?? safeString(data?.plan?.id) ?? null,
    processorProductId: safeString(data?.product_id) ?? safeString(data?.product?.id) ?? null,
    processorPriceId: safeString(data?.price_id) ?? safeString(data?.price?.id) ?? null,
    
    amount: data?.price?.amount ?? data?.amount ?? data?.total ?? null,
    currency: (data?.price?.currency ?? data?.currency ?? 'USD').toUpperCase(),
    processorEventType: payload?.event || payload?.type,
    
    rawPayload: sanitizeForJsonb({
      event: payload?.event,
      membership_id: safeString(data?.id),
      user_email: user?.email,
      plan_id: safeString(data?.plan_id),
      utm_content: utmContent,  // ← Store for audit
      received_at: new Date().toISOString()
    })
  };
}
  console.warn(`⚠️ Unsupported provider '${provider}'`);
  return null;
}

Deno.serve(async (req) => {
  try {
    // 🔔 LOG: Request start
    console.log('🚀 Webhook handler started');

    // 1. Provider
    const url = new URL(req.url);
    const provider = url.searchParams.get('provider');

    if (!provider) {
      console.error('❌ Missing provider parameter');
      return new Response(JSON.stringify({ error: 'Missing provider' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 🔔 LOG: Provider identified
    console.log(`🔔 [${provider}] Provider identified from URL param`);

    // 2. Body
    const body = await req.text();
    
    // 🔔 LOG: Body received (truncated)
    console.log(`🔔 [${provider}] Body received (first 500 chars):`, body.substring(0, 500));

    // 3. Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 🔔 LOG: Supabase client initialized
    console.log(`🔗 [${provider}] Supabase client initialized`);

    // 4. Extract
    const extracted = extractWebhookData(body, provider);
    if (!extracted) {
      console.error(`❌ [${provider}] Failed to extract webhook data`);
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

const {
  appro_id, customerEmail, subscriptionId, status, endDate, itemBoughtId,
  processorCustomerId, processorProductId, processorPriceId,
  amount, currency, processorEventType, rawPayload
} = extracted;


    // 🔔 LOG: Extraction complete
    console.log(`🔍 [${provider}] Extracted:`, {
      appro_id, customerEmail, itemBoughtId, status, endDate, amount, currency
    });

    // Normalize status
    const normalizedStatus = mapStatus(status, provider);
console.log(`🗺️ [${provider}] Status mapping: "${status}" → "${normalizedStatus}"`);
    // Normalize amount (Lemon uses cents)
    const normalizedAmount = amount != null 
      ? (provider === 'lemon' ? Math.round(amount) / 100 : amount)
      : null;

    // 🔔 LOG: Normalization complete
    console.log(`⚙️ [${provider}] Normalized: status=${normalizedStatus}, amount=${normalizedAmount}`);

    // 5. Verify Lemon signature
    if (provider === 'lemon') {
      const signature = req.headers.get('X-Signature');
      const secret = Deno.env.get('LEMON_WEBHOOK_SECRET');

      if (signature && secret) {
        console.log(`🔐 [${provider}] Signature present, verifying...`);
        
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw', encoder.encode(secret),
          { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
        );

        const isValid = await crypto.subtle.verify(
          'HMAC', key, hexToBytes(signature), encoder.encode(body)
        );

        // 🔔 LOG: Signature verification result
        console.log(`✅ [${provider}] Signature ${isValid ? 'VALID' : 'INVALID'}`);

        if (!isValid) {
          console.error('❌ Invalid Lemon signature');
          return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
        }
      } else {
        console.warn(`⚠️ [${provider}] No signature or secret - skipping verification`);
      }
    }

    // 6. Resolve user
    let userId = null;

    if (appro_id) {
      console.log(`👤 [${provider}] Looking up user by appro_id: ${appro_id}`);
      
      const { data: user, error: userError } = await supabase
        .from('app_profiles')
        .select('id')
        .eq('id', appro_id)
        .maybeSingle();

      if (userError) {
        console.error(`❌ [${provider}] User query error:`, userError);
        return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
      }
      
      userId = user?.id;
      console.log(`👤 [${provider}] Found user by appro_id: ${userId || 'NOT FOUND'}`);
    }

    if (!userId && customerEmail) {
      console.log(`👤 [${provider}] Looking up user by email: ${customerEmail}`);
      
      const {  data: user, error: userError } = await supabase
        .from('app_profiles')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle();

      if (userError) {
        console.error(`❌ [${provider}] User query error:`, userError);
        return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
      }
      
      userId = user?.id;
      console.log(`👤 [${provider}] Found user by email: ${userId || 'NOT FOUND'}`);
    }

    if (!userId) {
      console.warn(`⚠️ [${provider}] No matching user (appro_id: ${appro_id}, email: ${customerEmail})`);
      return new Response(JSON.stringify({ ok: true, warning: 'User not found' }), { status: 200 });
    }

    // 🔔 LOG: User resolved
    console.log(`✅ [${provider}] User resolved: ${userId}`);

    // 7. Resolve plan
    console.log(`📦 [${provider}] Looking up plan by provider_plan_id: ${itemBoughtId}`);
    
    const {  data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('id, platform_id')
      .eq('provider_plan_id', itemBoughtId)
      .eq('is_active', true)
      .maybeSingle();

    if (planError) {
      console.error(`❌ [${provider}] Plan query error:`, planError);
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }

    if (!plan) {
      console.warn(`⚠️ [${provider}] No matching plan for provider_plan_id: ${itemBoughtId}`);
      return new Response(JSON.stringify({ ok: true, warning: 'Plan not found' }), { status: 200 });
    }

    // 🔔 LOG: Plan resolved
    console.log(`✅ [${provider}] Plan resolved: ${plan.id}, platform: ${plan.platform_id}`);

    // 8. Upsert payment relation
    console.log(`💾 [${provider}] Upserting payment_event_log:`);

const {data: existing, error: existingError } = await supabase
  .from('payment_event_log')
  .select('id, start_date')
  .eq('user_appro_id', userId)
  .eq('plan_id', plan.id)
  .eq('processor_subscription_id', subscriptionId)
  .maybeSingle();

if (existingError) {
  console.error(`❌ [${provider}] Existing row query failed:`, existingError);
  return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
}

// Preserve original start_date if row exists
const startDate = existing?.start_date || new Date().toISOString();

console.log(`💾 [${provider}] start_date: ${existing ? 'PRESERVED' : 'NEW'} = ${startDate}`);

const { data:eventLog, error: upsertError } = await supabase
  .from('payment_event_log')
  .upsert(
    {
      user_appro_id: userId,
      plan_id: plan.id,
      platform_id: plan.platform_id,
      processor_subscription_id: subscriptionId,
      processor_customer_id: processorCustomerId,
      processor_event_type: processorEventType,
      processor_product_id: processorProductId,
      processor_price_id: processorPriceId,
      status: normalizedStatus,
      start_date: startDate,  // ← Preserved from existing row
      end_date: endDate,
      amount: normalizedAmount,
      currency: (currency || 'USD').toUpperCase(),  // ← Normalize to uppercase
      last_webhook_event: new Date().toISOString(),
      raw_payload: rawPayload
      
    },
    { onConflict: 'user_appro_id,plan_id,processor_subscription_id' }
  )
  .select('id')
   .maybeSingle();

const eventLogId = eventLog?.id || null;

    if (upsertError) {
      console.error(`❌ [${provider}] Upsert failed:`, upsertError);
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }

    // 🔔 LOG: Upsert success
    console.log(`✅ [${provider}] Payment relation upserted successfully for user ${userId}`);

//21:00 April 18

// ============================================================================
// UPDATE payment_details TABLE (MVP state logic)
// ============================================================================
console.log(`💳 [${provider}] Updating payment_details state...`);

// Determine MVP status using helper function
const mvpStatus = getMVPStatus(processorEventType, normalizedStatus);

// Prepare payment_details upsert object
const paymentDetailsUpsert = {
  app_profile_id: userId,
  payment_plan_id: plan.id,
  platform_id: plan.platform_id,
  provider: provider,
  provider_subscription_id: subscriptionId,
  provider_customer_id: processorCustomerId,
  provider_price_id: processorPriceId,
  status: mvpStatus,
  started_at: startDate,
  trial_end: null,  // Add later if Lemon sends trial data
  current_period_start: startDate,
  current_period_end: endDate,  // NULL for one-time purchases
  cancel_at_period_end: false,
  currency: (currency || 'USD').toUpperCase(),
  amount: normalizedAmount,
  is_used: false,  // Future: one-time purchase claiming
  claimed_at: null,
  claimed_for_id: null,
  is_manual_override: false,
  last_event_id: eventLogId,  // ← Links to payment_event_log
};

// Upsert payment_details (one row per user per plan)
const { error: detailsError } = await supabase
  .from('payment_details')
  .upsert(paymentDetailsUpsert, {
    onConflict: 'app_profile_id,payment_plan_id'  // One row per user/plan
  });

if (detailsError) {
  console.error(`❌ [${provider}] payment_details upsert failed:`, detailsError);
  // Don't fail the webhook - event is still logged in payment_event_log
} else {
  console.log(`✅ [${provider}] payment_details updated: status=${mvpStatus}`);
}
// ============================================================================
// END payment_details UPDATE
// ============================================================================



    return new Response(JSON.stringify({ ok: true, user_id: userId }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    // 🔔 LOG: Unhandled error
    console.error('❌ Webhook handler unhandled error:', err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});