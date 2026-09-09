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

    const apiKey = process.env.X_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: "Vercel cannot find your X_API_KEY environment variable! Remember: you MUST trigger a new deployment in Vercel after adding environment variables." });
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'api-key': apiKey,
      'x-make-apikey': apiKey
    };

    // Extract Geolocation headers provided automatically by Vercel in production
    const country = req.headers['x-vercel-ip-country'] || "Unknown";
    const city = req.headers['x-vercel-ip-city'] || "Unknown";

    const payload = {
      ...req.body,
      submittedAt: new Date().toISOString(),
      country,
      city
    };

    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
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
