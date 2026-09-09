export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!makeWebhookUrl) {
      console.error("MAKE_WEBHOOK_URL environment variable is not defined");
      return res.status(500).json({ message: "Server configuration error" });
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
      return res.status(response.status).json({ message: "Failed to forward request to Make webhook" });
    }
  } catch (error) {
    console.error("Webhook forwarding error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
