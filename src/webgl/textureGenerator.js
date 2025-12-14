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

    // Fake Text Columns (Vertical Lines) - Keep as is

    // ... (Text columns code unchanged) ...

    // Caption
    ctx.font = "20px serif";
    ctx.fillText("奇跡の結晶 (イメージ)", 300, 780);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}
