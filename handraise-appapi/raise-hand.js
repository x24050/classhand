import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { name, id, question } = req.body;

  try {
    const response = await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🙋‍♀️ ${name} (${id}) が挙手しました！\n質問内容: ${question}`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Teams webhook error:", text);
      return res.status(500).send("Teams webhook failed");
    }

    res.status(200).json({ message: "OK" });
  } catch (err) {
    console.error("Webhook send error:", err);
    res.status(500).send("Webhook send error");
  }
}
