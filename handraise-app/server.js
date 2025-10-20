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
  type: "message",
  attachments: [
    {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: {
        type: "AdaptiveCard",
        version: "1.5",
        body: [
          {
            type: "TextBlock",
            text: `🔴 挙手通知: ${studentId}`,
            weight: "Bolder",
            size: "Large",
            color: "Attention"
          },
          {
            type: "TextBlock",
            text: `**学籍番号:** ${studentId}`,
            wrap: true
          },
          {
            type: "TextBlock",
            text: `**質問:** ${question}`,
            wrap: true
          }
        ],
        actions: [
          {
            type: "Action.OpenUrl",
            title: "座席表で確認する",
            url: seatmapLink
          }
        ]
      }
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
