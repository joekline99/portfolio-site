export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = request.body || {};

  if (!name || !email || !message) {
    return response.status(400).json({ error: "Missing required fields" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";

  if (!apiKey || !toEmail) {
    return response.status(500).json({ error: "Contact form is not configured" });
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: toEmail,
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        message,
      ].join("\n"),
    }),
  });

  if (!emailResponse.ok) {
    return response.status(500).json({ error: "Email could not be sent" });
  }

  return response.status(200).json({ ok: true });
}
