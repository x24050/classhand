import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

// 授業ごとのWebhookマッピング
const webhookMap = {
  webp: process.env.WEBP_WEBHOOK,
  // 他の授業IDを追加したい場合はここに追加
};

// 挙手API
app.post("/api/raise-hand", async (req, res) => {
  const { classId, studentId, question } = req.body;

  // 授業IDチェック
  const webhookUrl = webhookMap[classId];
  if (!webhookUrl) return res.status(400).send("無効な授業です");

  // BASE_URL確認（座席表ページのリンク用）
  const baseURL = process.env.BASE_URL;
  if (!baseURL) {
    console.error("BASE_URL環境変数が設定されていません。");
    return res.status(500).send("サーバー設定エラー: BASE_URLが未設定です。");
  }

  // URLエンコードした質問内容
  const encodedQuestion = encodeURIComponent(question);
  // seatmap.html へのリンク生成
  const seatmapLink = `${baseURL}/seatmap.html?studentId=${studentId}&question=${encodedQuestion}`;

  // Teams メッセージカード作成
  const message = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: `挙手通知: ${studentId}`,
    themeColor: "DC143C", // 赤系統で目立たせる
    title: `🔴 挙手通知: ${studentId}`,
    text: `**学籍番号:** ${studentId}\n**質問:** ${question}`,
    potentialAction: [
      {
        "@type": "OpenUri",
        name: "座席表で確認する",
        targets: [
          {
            os: "default",
            uri: seatmapLink
          }
        ]
      }
    ]
  };

  try {
    // Teamsに送信
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Teams webhook error:", text);
      return res.status(500).send("Teamsへの通知に失敗しました");
    }

    res.status(200).json({ message: "挙手通知送信成功", seatmapLink });
  } catch (err) {
    console.error("Exception:", err);
    res.status(500).send("Teamsへの通知に失敗しました");
  }
});

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
