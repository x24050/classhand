// api/raise-hand.js

export default async function handler(req, res) {
  // メソッドチェック
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  // ボディ取得
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

  // Teamsに送信
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🙋‍♀️ 学籍番号: ${studentId}, 質問: ${question}`
      }),
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
