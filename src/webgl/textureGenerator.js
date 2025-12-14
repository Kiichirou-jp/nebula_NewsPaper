import * as THREE from 'three';

// 外部画像を使わず、Canvasで号外テクスチャを動的に生成します
export function createNewspaperTexture() {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Background (Old Paper)
    ctx.fillStyle = "#f4f1ea";
    ctx.fillRect(0, 0, size, size);

    // Add Noise/Grain to texture
    for (let i = 0; i < 50000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "#e0dac8" : "#ffffff";
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
    ctx.fillText("日本完全復活", size / 2, 150);

    // Subtitles & Columns
    ctx.font = 'bold 40px "Shippori Mincho", serif';
    ctx.fillText("経済・文化・技術の三位一体", size / 2, 240);

    // "Gogai" Red Stamp (Impact)
    ctx.save();
    ctx.translate(size - 180, 120);
    ctx.rotate(-0.2);
    ctx.fillStyle = "#9d00ff"; // Purple
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4f1ea";
    ctx.font = "bold 60px serif";
    ctx.fillText("号外", 0, 20);
    ctx.restore();

    // Fake Text Columns (Vertical Lines)
    ctx.fillStyle = "#222";
    const startY = 300;
    const endY = size - 50;

    for (let x = size - 80; x > 80; x -= 60) {
        // Draw vertical lines representing text
        let y = startY;
        while (y < endY) {
            const charHeight = Math.random() * 30 + 10;
            if (Math.random() > 0.1) {
                ctx.fillRect(x, y, 6, charHeight);
            }
            y += charHeight + 8;
        }
        // Divider lines
        if ((size - 80 - x) % 240 === 0) {
            ctx.fillStyle = "#ccc";
            ctx.fillRect(x - 30, startY, 1, endY - startY);
            ctx.fillStyle = "#222";
        }
    }

    // Image Placeholder (Abstract photo)
    ctx.fillStyle = "#333";
    ctx.globalAlpha = 0.8;
    ctx.fillRect(100, 450, 400, 300);
    ctx.globalAlpha = 1.0;

    // Caption
    ctx.font = "20px serif";
    ctx.fillText("歓喜に沸く人々 (資料映像)", 300, 780);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}
