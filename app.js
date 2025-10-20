document.getElementById("handForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const classId = document.getElementById("classId").value;
  const studentId = document.getElementById("studentId").value.trim();
  const question = document.getElementById("question").value;

  // 座席表画像生成（CSVから）
  const imgBase64 = await generateSeatImage(studentId);

  const res = await fetch("/api/raise-hand", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classId, studentId, question, imgBase64 }),
  });

  if (res.ok) {
    alert("挙手が送信されました！");
    document.getElementById("question").value = "";
  } else {
    alert("送信に失敗しました");
  }
});

async function generateSeatImage(studentId) {
  // CSVファイルのパス（public/seat-data.csv）
  const response = await fetch("/seat-data.csv");
  const text = await response.text();

  // CSVを配列に変換
  const rows = text.trim().split("\n").map(r => r.split(","));
  const upperId = studentId.toUpperCase();

  // Canvasで描画
  const cellW = 70, cellH = 35;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const cols = Math.max(...rows.map(r => r.length));
  canvas.width = cols * cellW;
  canvas.height = rows.length * cellH;

  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  rows.forEach((r, i) => {
    r.forEach((val, j) => {
      const x = j * cellW;
      const y = i * cellH;
      const id = val.trim();

      // 学籍番号が一致した席を赤く
      ctx.fillStyle = id && id.toUpperCase() === upperId ? "#ffb3b3" : "#ffffff";
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeRect(x, y, cellW, cellH);

      if (id) {
        ctx.fillStyle = "#000";
        ctx.fillText(id, x + cellW / 2, y + cellH / 2);
      }
    });
  });

  // PNG画像をBase64化
  return canvas.toDataURL("image/png");
}
