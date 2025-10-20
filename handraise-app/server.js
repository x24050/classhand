const express = require("express");
const fetch = require("node-fetch"); // Vercelではfetch未定義な場合があるので明示的に
require("dotenv").config();

const app = express();
app.use(express.json());

const webhookMap = {
  webp: process.env.WEBP_WEBHOOK
};

// 挙手API
app.post("/api/raise-hand", async (req, res) => {
  const { classId, studentId, question } = req.body;
  const webhookUrl = webhookMap[classId];

  if (!webhookUrl) return res.status(400).send("無効な授業です");

  const baseURL = process.env.BASE_URL; 
  if (!baseURL) {
    console.error("BASE_URL環境変数が設定されていません。");
    return res.status(500).send("サーバー設定エラー: BASE_URLが未設定です。");
  }

  const encodedQuestion = encodeURIComponent(question);
  const seatmapLink = `${baseURL}/seatmap.html?studentId=${studentId}&question=${encodedQuestion}`;

  const message = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    "summary": "新しい挙手",
    "themeColor": "DC143C",
    "title": `🔴 挙手通知: ${studentId}`,
    "text": `**学籍番号:** ${studentId}\n**質問:** ${question}`,
    "potentialAction": [
      {
        "@type": "OpenUri",
        "name": "座席表で確認する",
        "targets": [{ "os": "default", "uri": seatmapLink }]
      }
    ]
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Teamsへの通知に失敗しました");
  }
});

// 🔽 Vercelでは app.listen() は不要、代わりにエクスポート
module.exports = app;
