/*export default async function handler(req, res) {
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
    // 画像をVercel Blobに保存（例）
    const uploadRes = await fetch("https://api.vercel.com/v2/blobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`, // VercelのPersonal Tokenを環境変数に設定
        "Content-Type": "image/png",
      },
      body: Buffer.from(imgBase64.split(",")[1], "base64"),
    });

    const uploadData = await uploadRes.json();
    const imageUrl = uploadData?.url;

    // Teamsに送信
    const payload = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      summary: `${studentId}が挙手しました`,
      sections: [
        {
          activityTitle: `🙋‍♀️ 学籍番号: ${studentId}`,
          text: `💬 質問: ${question}`,
          images: imageUrl ? [{ image: imageUrl }] : [],
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

    return res.status(200).json({ message: "Sent to Teams!", imageUrl });
  } catch (err) {
    console.error("Exception:", err);
    return res.status(500).send("Server error");
  }
}*/
