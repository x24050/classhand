// public/seatmap.js

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const studentIdFull = urlParams.get('studentId');
    const question = urlParams.get('question');

    if (!studentIdFull || !question) {
        console.log("学籍番号または質問内容がURLに含まれていません。");
        return;
    }

    const targetSeat = document.querySelector(`.seat[data-studentid="${studentIdFull}"]`);

    if (targetSeat) {
        highlightSeat(targetSeat, studentIdFull, question);
    } else {
        console.log(`学籍番号 ${studentIdFull} に対応する座席がHTMLに見つかりませんでした。`);
    }

    /**
     * 座席のハイライトとイベントリスナーを設定するヘルパー関数
     * @param {Element} seatElement - 対象の座席DOM要素
     * @param {string} fullId - 完全な学籍番号
     * @param {string} qText - 質問内容
     */
    function highlightSeat(seatElement, fullId, qText) {
        // ハイライトクラスを追加し、赤く光らせる
        seatElement.classList.add('highlighted');
        
        // ★ 修正点: 既存のテキストコンテンツを取得し、新しい構造で上書きする
        // 既存の表示（学籍番号）を取得
        const existingContent = seatElement.textContent.trim(); 
        
        // 既存のコンテンツと、新しいラベルを組み合わせたHTMLでinnerHTMLを上書きする
        // これにより、既存のコンテンツを保持しつつ、.seat-labelを上に追加します。
        // NOTE: HTML構造をシンプルにするため、textContentで上書きせず、
        // 既存のtextContentをそのままに、ラベルのスタイルを調整する方が良い場合もあります。
        // ここでは、ハイライト時に「挙手中」を明確にするため、textContentを中央に、ラベルを左上に配置する前回と同じ構造を保持します。

        // 既存のtextContentを保持
        // 🚨 以下の行は、前回のご要望で「挙手中」ラベルを既存のtextContentに追加しようとして重複の原因となっていた部分です。
        // seatElement.insertAdjacentHTML('beforeend', `<div class="seat-label">🚨 挙手中</div>`);

        // ★ 修正: テキストが二重にならないよう、座席内の表示内容を既存の学籍番号と、新しく追加するラベルのみに設定します。
        // ただし、前回提出いただいたHTMLの構造上、textContentには「x24070」などの学籍番号が入っています。
        // ここでは、その**既存の学籍番号を中央に維持しつつ、左上にラベルを追加**する構造に変更します。
        
        // 既存の学籍番号(x24070など)を中央に維持
        seatElement.innerHTML = `${existingContent}<div class="seat-label">🚨 挙手中</div>`; 

        // クリックイベントリスナーを追加 (クリックで質問内容をポップアップ表示)
        seatElement.addEventListener('click', () => {
            document.getElementById('modal-student-id').textContent = fullId;
            document.getElementById('modal-question-text').textContent = qText;
            document.getElementById('questionModal').style.display = 'flex';
        });

        // 挙手した席に自動でスクロール
        seatElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // モーダルを閉じるための処理 (背景クリックで閉じる)
    document.getElementById('questionModal').addEventListener('click', (e) => {
        if (e.target.id === 'questionModal') {
            e.target.style.display = 'none';
        }
    });
});
