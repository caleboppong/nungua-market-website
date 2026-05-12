import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Nungua Market <onboarding@resend.dev>",
        to: ["maroppcal@hotmail.it"],
        subject: "New Restaurant Order",
        html: `
          <h2>New Restaurant Order</h2>

          <p><b>Customer:</b> ${body.customer_name}</p>
          <p><b>Phone:</b> ${body.customer_phone}</p>
          <p><b>Email:</b> ${body.customer_email}</p>
          <p><b>Total:</b> £${body.total_price}</p>

          <h3>Items Ordered</h3>

          <pre>${JSON.stringify(body.items, null, 2)}</pre>
        `,
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
