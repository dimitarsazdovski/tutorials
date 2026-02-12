/**
 * 8-bit Knight Pixel Art Renderer
 * Draws knights as pixel art on canvas elements.
 */

const PIXEL_SIZE = 8;

// Knight sprite data: 16x16 grid
// 0 = transparent, 1 = outline, 2 = primary color, 3 = secondary/highlight,
// 4 = skin, 5 = dark accent, 6 = metallic/armor, 7 = weapon
const KNIGHT_IDLE = [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,6,6,3,3,6,6,1,0,0,0,0],
    [0,0,0,1,6,6,2,2,2,2,6,6,1,0,0,0],
    [0,0,0,1,6,2,2,3,3,2,2,6,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,5,5,1,4,4,4,1,5,5,1,0,0,0],
    [0,0,1,5,5,1,4,4,4,1,5,5,1,0,0,0],
    [0,0,0,1,1,1,4,4,4,1,1,1,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,1,2,2,2,3,3,2,2,2,1,0,0,0],
    [0,0,1,7,1,2,2,2,2,2,2,1,7,1,0,0],
    [0,0,1,7,1,2,2,2,2,2,2,1,7,1,0,0],
    [0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],
    [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,0,0,0,1,5,5,1,1,5,5,1,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
];

const KNIGHT_ATTACK = [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,6,6,3,3,6,6,1,0,0,0,0],
    [0,0,0,1,6,6,2,2,2,2,6,6,1,0,0,0],
    [0,0,0,1,6,2,2,3,3,2,2,6,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,5,5,1,4,4,4,1,5,5,1,0,0,0],
    [0,0,1,5,5,1,4,4,4,1,5,5,1,0,0,0],
    [0,0,0,1,1,1,4,4,4,1,1,1,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,1,7,1,2,2,2,3,3,2,2,2,1,7,7,1],
    [0,1,7,1,2,2,2,2,2,2,2,2,1,7,7,1],
    [0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,0,0,0,1,5,5,1,1,5,5,1,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
];

const KNIGHT_HIT = [
    [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,6,3,3,6,6,1,0,0,0,0],
    [0,0,0,0,1,6,2,2,2,2,6,6,1,0,0,0],
    [0,0,0,0,1,2,2,3,3,2,2,6,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,5,1,4,4,4,1,5,5,1,0,0,0],
    [0,0,0,1,5,1,4,4,4,1,5,5,1,0,0,0],
    [0,0,0,0,1,1,4,4,4,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,3,3,2,2,1,0,0,0,0],
    [0,0,0,1,7,1,2,2,2,2,1,7,1,0,0,0],
    [0,0,0,1,7,1,2,2,2,2,1,7,1,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,5,5,1,1,5,5,1,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
];

const KNIGHT_VICTORY = [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,6,6,3,3,6,6,1,0,0,0,0],
    [0,0,0,1,6,6,2,2,2,2,6,6,1,0,0,0],
    [0,0,0,1,6,2,2,3,3,2,2,6,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,5,5,1,4,4,4,1,5,5,1,0,0,0],
    [0,0,1,5,5,1,4,4,4,1,5,5,1,0,0,0],
    [0,0,0,1,1,1,4,4,4,1,1,1,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,7,0,0],
    [0,1,7,1,2,2,2,3,3,2,2,2,1,7,0,0],
    [0,0,1,1,2,2,2,2,2,2,2,2,1,7,0,0],
    [0,0,0,1,1,2,2,2,2,2,2,1,1,7,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,7,0,0],
    [0,0,0,0,1,1,2,2,2,2,1,1,0,7,0,0],
    [0,0,0,1,5,5,1,1,1,5,5,1,0,0,0,0],
    [0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0],
];

const KNIGHT_DEFEAT = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,6,6,3,1,5,5,1,2,2,2,2,2,1,0],
    [0,1,6,2,3,1,5,5,1,2,3,3,2,2,1,7],
    [0,1,1,1,1,1,4,4,1,2,2,2,2,1,7,0],
    [0,0,0,0,1,5,5,1,1,5,5,1,1,1,0,0],
    [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
];

// Color palettes
const RED_PALETTE = {
    1: '#1a1a1a', // outline
    2: '#cc2222', // primary
    3: '#ff5555', // highlight
    4: '#ffcc99', // skin
    5: '#222222', // dark accent (eyes/visor)
    6: '#888888', // metallic
    7: '#aaaaaa', // weapon
};

const BLUE_PALETTE = {
    1: '#1a1a1a',
    2: '#2244aa',
    3: '#5588ff',
    4: '#ffcc99',
    5: '#222222',
    6: '#888888',
    7: '#aaaaaa',
};

/**
 * Draw a knight sprite on a canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} sprite - 16x16 grid
 * @param {Object} palette - color mapping
 * @param {number} offsetX - pixel offset
 * @param {number} offsetY - pixel offset
 * @param {number} pixelSize - size of each "pixel"
 * @param {boolean} flipX - mirror horizontally
 * @param {number} opacity - 0 to 1
 */
function drawKnight(ctx, sprite, palette, offsetX, offsetY, pixelSize, flipX, opacity) {
    ctx.save();
    if (opacity !== undefined && opacity < 1) {
        ctx.globalAlpha = opacity;
    }
    for (let row = 0; row < sprite.length; row++) {
        for (let col = 0; col < sprite[row].length; col++) {
            const val = sprite[row][col];
            if (val === 0) continue;
            const color = palette[val];
            if (!color) continue;
            ctx.fillStyle = color;
            const drawCol = flipX ? (15 - col) : col;
            ctx.fillRect(
                offsetX + drawCol * pixelSize,
                offsetY + row * pixelSize,
                pixelSize,
                pixelSize
            );
        }
    }
    ctx.restore();
}

/**
 * Draw a knight on a preview canvas (128x128).
 */
function drawKnightPreview(canvasId, palette) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawKnight(ctx, KNIGHT_IDLE, palette, 0, 0, PIXEL_SIZE, false, 1);
}

/**
 * Draw hit sparks (pixel explosion effect).
 */
function drawSparks(ctx, x, y, frame) {
    const sparkColors = ['#ffff00', '#ff8800', '#ffffff', '#ff4444'];
    const count = 6;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + frame * 0.3;
        const dist = (frame % 8) * 4 + 4;
        const sx = x + Math.cos(angle) * dist;
        const sy = y + Math.sin(angle) * dist;
        ctx.fillStyle = sparkColors[i % sparkColors.length];
        ctx.fillRect(Math.floor(sx), Math.floor(sy), 4, 4);
    }
}

// Initialize preview canvases
function initPreviews() {
    drawKnightPreview('red-knight-preview', RED_PALETTE);
    drawKnightPreview('blue-knight-preview', BLUE_PALETTE);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreviews);
} else {
    initPreviews();
}
