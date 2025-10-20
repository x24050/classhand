
const webhookMap = {
  webp: process.env.WEBP_WEBHOOK
};

// 挙手API
app.post("/api/raise-hand", async (req, res) => {
  const { classId, studentId, question } = req.body;
  const webhookUrl = webhookMap[classId];

  if (!webhookUrl) return res.status(400).send("無効な授業です");
  
  // 1. 座席表ページのリンクを生成
  // BASE_URL環境変数を使用し、クエリパラメータに学籍番号と質問内容を含めます
  const baseURL = process.env.BASE_URL; 
  if (!baseURL) {
      console.error("BASE_URL環境変数が設定されていません。");
      return res.status(500).send("サーバー設定エラー: BASE_URLが未設定です。");
  }

  // 質問内容をURLエンコードします
  const encodedQuestion = encodeURIComponent(question);
  // 新しく作成する座席表ページ (seatmap.html) へのリンク
  const seatmapLink = `${baseURL}/seatmap.html?studentId=${studentId}&question=${encodedQuestion}`;

  // 2. Teamsのメッセージカードを更新
  const message = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    "summary": "新しい挙手",
    "themeColor": "DC143C", // ハイライトに合わせて赤系統に変更
    "title": `🔴 挙手通知: ${studentId}`,
    "text": `**学籍番号:** ${studentId}\n**質問:** ${question}`,
    "potentialAction": [ // リンクをボタンとして追加
      {
        "@type": "OpenUri",
        "name": "座席表で確認する",
        "targets": [
          {
            "os": "default",
            "uri": seatmapLink // 生成したリンクを埋め込む
          }
        ]
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

app.listen(3000, "0.0.0.0", () =>
  console.log("Server running on http://localhost:3000")
);
