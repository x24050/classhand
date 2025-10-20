export default async function handler(req, res) {
  // POSTメソッド以外は拒否
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  // リクエストボディの取得
  const { studentId, question } = req.body || {};
  if (!studentId || !question) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // 環境変数チェック
  const webhookUrl = process.env.WEBP_WEBHOOK;
  if (!webhookUrl) {
    console.error("WEBHOOK_URL is missing!");
    return res.status(500).send("Server configuration error");
  }

  try {
    // Teamsに送信するメッセージ内容
    const payload = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      summary: `${studentId}が挙手しました`,
      themeColor: "0076D7",
      title: "🙋‍♀️ 挙手通知",
      sections: [
        {
          activityTitle: `学籍番号: **${studentId.toUpperCase()}**`,
          text: `💬 **質問内容:** ${question}`,
        },
      ],
    };

    // Teams WebhookにPOST
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
