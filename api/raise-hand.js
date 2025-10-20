import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { studentId, question, imgBase64 } = req.body || {};
  if (!studentId || !question) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const webhookUrl = process.env.WEBP_WEBHOOK;
  if (!webhookUrl) {
    console.error("WEBHOOK_URL is missing!");
    return res.status(500).send("Server configuration error");
  }

  try {
    // Teamsに送信（画像をBase64で直接埋め込み）
    const payload = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      summary: `${studentId}が挙手しました`,
      sections: [
        {
          activityTitle: `🙋‍♀️ 学籍番号: ${studentId}`,
          text: `💬 質問: ${question}`,
          images: [{ image: imgBase64 }],
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Teams webhook error:", text);
      return res.status(500).send("Teams webhook failed");
    }

    return res.status(200).json({ message: "Sent to Teams!" });
  } catch (err) {
    console.error("Exception:", err);
    return res.status(500).send("Server error");
  }
}
