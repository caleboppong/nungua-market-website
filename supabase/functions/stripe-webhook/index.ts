import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const body = await req.text();

  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
      undefined,
      cryptoProvider
    );
  } catch (error) {
    return new Response(`Webhook signature verification failed: ${error.message}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const items = JSON.parse(session.metadata?.items || "[]");

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: session.metadata?.customer_name || "Stripe Customer",
        customer_phone: session.metadata?.customer_phone || "",
        customer_email: session.metadata?.customer_email || session.customer_details?.email || "",
        customer_address: session.metadata?.customer_address || "",
        total_price: Number(session.amount_total || 0) / 100,
        status: "new",
        payment_status: "paid",
      })
      .select()
      .single();

    if (orderError) {
      return new Response(orderError.message, { status: 400 });
    }

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    if (orderItems.length > 0) {
      const { error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        return new Response(itemsError.message, { status: 400 });
      }

      for (const item of items) {
        const { data: product } = await supabaseAdmin
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (product) {
          const newStock = Math.max(0, Number(product.stock) - Number(item.quantity));

          await supabaseAdmin
            .from("products")
            .update({
              stock: newStock,
              available: newStock > 0,
            })
            .eq("id", item.id);
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});