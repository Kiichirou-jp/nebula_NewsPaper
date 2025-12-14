import * as THREE from 'three';

// 外部画像を使わず、Canvasで号外テクスチャを動的に生成します
export function createNewspaperTexture() {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Background (Old Paper -> Japanese Newspaper Gray)
    ctx.fillStyle = "#e3e3e3";
    ctx.fillRect(0, 0, size, size);

    // Add Noise/Grain to texture
    for (let i = 0; i < 50000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "#d3d3d3" : "#eeeeee";
        ctx.fillRect(
            Math.random() * size,
            Math.random() * size,
            2,
            2,
        );
    }

    // --- Layout: Classic Japanese Newspaper ---

    // Header Bar
    ctx.fillStyle = "#111";
    ctx.fillRect(50, 50, size - 100, 10);
    ctx.fillRect(50, 180, size - 100, 5);

    // Title (Large Kanji)
    ctx.font = '900 130px "Shippori Mincho", "Times New Roman", serif';
    ctx.fillStyle = "#111";
    ctx.textAlign = "center";
    ctx.fillText("シルク岩塩", size / 2, 150);

    // Subtitles & Columns
    ctx.font = 'bold 36px "Shippori Mincho", serif';
    ctx.fillText("氷のように舌で溶け、最高の旨味を解き放つ", size / 2, 240);

    // "Gogai" Red Stamp (Impact) - Keep as is
    // ... (Stamp code unchanged) ...

    // Images: Silk Rock Salt (Loaded Async)
    const img1 = new Image();
    img1.src = '/media/powder.png';

    const img2 = new Image();
    img2.src = '/media/rock_salt_2.png';

    const texture = new THREE.CanvasTexture(canvas);

    Promise.all([
        new Promise(resolve => img1.onload = resolve),
        new Promise(resolve => img2.onload = resolve)
    ]).then(() => {
        // 1. Draw Main Image (Left)
        ctx.fillStyle = "#e3e3e3"; // Paper color background
        ctx.fillRect(50, 420, 500, 350);
        ctx.globalAlpha = 1.0;
        ctx.drawImage(img1, 50, 420, 500, 350);

        // 2. Draw Secondary Image (Right)
        // Smaller, supporting image
        ctx.fillStyle = "#e3e3e3";
        ctx.fillRect(600, 480, 350, 250);
        ctx.drawImage(img2, 600, 480, 350, 250);

        // Image Text / Caption
        ctx.font = 'bold 18px "Shippori Mincho", serif';
        ctx.fillStyle = "#333";
        ctx.textAlign = "left";
        ctx.fillText("▲ ヒマラヤの秘境で採掘された原石", 50, 795); // Under main image
        ctx.fillText("▲ 結晶構造の美しさ", 600, 755); // Under secondary image


        // --- Redraw Text Columns to wrap around images ---
        // We need to redraw text AFTER images to ensure flow is correct if we were doing complex flow,
        // but here we just need to ensure the columns respect boundaries.
        // Actually, in Canvas, order implies z-index.
        // Since we are not overlapping text on images, we can draw text now.

        // Real Text Columns (Vertical Japanese Text)
        ctx.fillStyle = "#111";
        ctx.textAlign = "start"; // Reset alignment
        ctx.font = '14px "Shippori Mincho", serif';
        const startY = 300;
        const endY = size - 50;

        // Meaningful Article Text
        const sentences = [
            "ヒマラヤ山脈の奥深く、数億年の時を経て形成された奇跡の岩塩がついに発見された。",
            "この「シルク岩塩」は、従来の岩塩とは一線を画す、絹のような滑らかな舌触りが特徴だ。",
            "口に含んだ瞬間、氷のように儚く溶け出し、濃厚な旨味が口いっぱいに広がる。",
            "成分分析の結果、人体に必須のミネラルが絶妙なバランスで含まれていることが判明した。",
            "現地の採掘者たちは「神々からの贈り物」として、古くからこの塩を大切に守ってきた。",
            "世界各国の有名シェフたちが、この新たな食材に熱い視線を注いでいる。",
            "「料理の概念が変わる」と語る三つ星シェフもおり、美食界に革命が起きようとしている。",
            "一般販売の開始に伴い、都内の百貨店では早朝から長蛇の列ができ、即日完売となった。",
            "家庭の食卓にも新たな彩りを添えるこの岩塩は、健康志向の人々からも高い支持を得ている。",
            "開発チームは「この感動を世界中の人々に届けたい」と、さらなる増産体制の整備を急ぐ。",
            "自然の恵みと、それを守り抜いてきた人々の想いが結晶化した、まさに至高の逸品である。"
        ];

        let sentenceIndex = 0;
        let charIndex = 0;

        // Columns
        for (let x = size - 50; x > 50; x -= 35) {

            // Divider lines (every ~5 columns)
            if ((size - 50 - x) % 175 === 0) {
                ctx.fillStyle = "#ccc";
                ctx.fillRect(x - 18, startY, 1, endY - startY);
                ctx.fillStyle = "#111";
            }

            // Draw vertical text
            let y = startY;

            // Get current sentence
            let currentSentence = sentences[sentenceIndex % sentences.length];

            while (y < endY) {
                // Check Collision
                // Image 1: x[50, 550], y[420, 770]
                // Image 2: x[600, 950], y[480, 730]

                // Reverse X logic because we iterate Right to Left? No, x is absolute coordinate.
                // Canvas X goes 0 -> 1024 (Left to Right)
                // Columns loop: 974 -> 50.

                // Collision 1 (Main Image)
                if (x < 580 && y > 400 && y < 800) {
                    y += 20;
                    continue;
                }

                // Collision 2 (Secondary Image)
                if (x > 580 && x < 970 && y > 460 && y < 760) {
                    y += 20;
                    continue;
                }

                // Paragraph spacing (random chance or end of sentence)
                if (charIndex >= currentSentence.length) {
                    charIndex = 0;
                    sentenceIndex++;
                    currentSentence = sentences[sentenceIndex % sentences.length];
                    y += 20; // Paragraph gap
                    if (y >= endY) break;
                }

                const char = currentSentence[charIndex];

                // Draw char
                ctx.fillText(char, x, y);

                // Move down
                y += 18;
                charIndex++;
            }
        }

        texture.needsUpdate = true;
    });

    return texture;


}
