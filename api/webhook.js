export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!makeWebhookUrl) {
      console.error("MAKE_WEBHOOK_URL environment variable is not defined");
      return res.status(500).json({ message: "MAKE_WEBHOOK_URL environment variable is missing. Please add it to your Vercel project settings." });
    }

    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (response.ok) {
      return res.status(200).json({ message: "Success" });
    } else {
      const errorText = await response.text();
      return res.status(response.status).json({ message: `Make Webhook returned ${response.status}: ${errorText}` });
    }
  } catch (error) {
    console.error("Webhook forwarding error:", error);
    return res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
}
