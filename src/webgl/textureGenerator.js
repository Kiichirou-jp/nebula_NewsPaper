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

    // Image: Silk Rock Salt (Loaded Async)
    const img = new Image();
    img.src = '/media/powder.png';

    img.onload = () => {
        // Draw Image background (Solid) to prevent transparency
        ctx.fillStyle = "#e3e3e3"; // Paper color
        ctx.fillRect(50, 420, 500, 350);

        // Draw Image
        ctx.globalAlpha = 1.0; // Ensure opacity
        // Aspect ratio preserver or custom fit
        ctx.drawImage(img, 50, 420, 500, 350);

        // Slightly multiply/overlay to blend with paper texture if desired, 
        // but user asked to fix transparency, so normal blend is safest.

        // Image Text / Caption (Over or under image)
        ctx.font = 'bold 18px "Shippori Mincho", serif';
        ctx.fillStyle = "#333";
        ctx.fillText("▲ ヒマラヤの秘境で採掘された原石", 300, 790);

        // Update Texture
        texture.needsUpdate = true;
    };

    // Placeholder removed
    // ctx.fillStyle = "#ccc";
    // ctx.fillRect(50, 420, 500, 350);

    // Real Text Columns (Vertical Japanese Text)
    ctx.fillStyle = "#111";
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
        // Skip area overlapping with image (approx x: 50-550, y: 420-770)
        // Image is at x=50, width=500 -> x range [50, 550]

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
            // Check collision with Image area matches previous logic
            if (x < 580 && y > 400 && y < 800) {
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

    const texture = new THREE.CanvasTexture(canvas);
    return texture;


}
