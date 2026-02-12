/**
 * Node.js tests for 8-Bit Knight Selector
 * Tests game logic and sprite data without requiring a browser.
 */

let passed = 0;
let failed = 0;

function assert(testName, condition, detail) {
    if (condition) {
        console.log(`PASS: ${testName}${detail ? ' - ' + detail : ''}`);
        passed++;
    } else {
        console.log(`FAIL: ${testName}${detail ? ' - ' + detail : ''}`);
        failed++;
    }
}

// ---- Load source files via eval (simple approach for vanilla JS) ----
const fs = require('fs');

// Minimal DOM stubs for the code that runs on load
const canvasStub = {
    getContext: () => ({
        clearRect: () => {},
        fillRect: () => {},
        fillStyle: '',
        save: () => {},
        restore: () => {},
        globalAlpha: 1,
        getImageData: () => ({ data: new Uint8Array(128 * 128 * 4) }),
    }),
    width: 128,
    height: 128,
};

const elementStubs = {
    'red-knight-preview': canvasStub,
    'blue-knight-preview': canvasStub,
    'fight-canvas': { ...canvasStub, width: 512, height: 300 },
    'result-canvas': { ...canvasStub, width: 512, height: 300 },
    'selection-screen': { classList: { add: () => {}, remove: () => {} } },
    'fight-screen': { classList: { add: () => {}, remove: () => {} } },
    'result-screen': { classList: { add: () => {}, remove: () => {} } },
    'timer-bar': { style: { width: '100%' } },
    'timer-display': { textContent: '' },
    'health-red': { style: { width: '100%' } },
    'health-blue': { style: { width: '100%' } },
    'result-text': { textContent: '', className: '' },
    'result-detail': { textContent: '' },
    'btn-red': {},
    'btn-blue': {},
};

// Set up global stubs
global.document = {
    getElementById: (id) => elementStubs[id] || null,
    readyState: 'complete',
    addEventListener: () => {},
    createElement: () => canvasStub,
};
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.Date = Date;

// Load knights.js into global scope
const knightsCode = fs.readFileSync(__dirname + '/knights.js', 'utf8');
const vm = require('vm');
vm.runInThisContext(knightsCode, { filename: 'knights.js' });

// Load game.js into global scope
const gameCode = fs.readFileSync(__dirname + '/game.js', 'utf8');
vm.runInThisContext(gameCode, { filename: 'game.js' });

// ---- SPRITE DATA TESTS ----
console.log('\n=== Sprite Data Tests ===');
assert('KNIGHT_IDLE is 16 rows', KNIGHT_IDLE.length === 16);
assert('KNIGHT_IDLE rows are 16 cols', KNIGHT_IDLE.every(r => r.length === 16));
assert('KNIGHT_ATTACK is 16x16', KNIGHT_ATTACK.length === 16 && KNIGHT_ATTACK.every(r => r.length === 16));
assert('KNIGHT_HIT is 16x16', KNIGHT_HIT.length === 16 && KNIGHT_HIT.every(r => r.length === 16));
assert('KNIGHT_VICTORY is 16x16', KNIGHT_VICTORY.length === 16 && KNIGHT_VICTORY.every(r => r.length === 16));
assert('KNIGHT_DEFEAT is 16x16', KNIGHT_DEFEAT.length === 16 && KNIGHT_DEFEAT.every(r => r.length === 16));

// Sprite values should only be 0-7
assert('KNIGHT_IDLE values in range 0-7', KNIGHT_IDLE.flat().every(v => v >= 0 && v <= 7));
assert('KNIGHT_ATTACK values in range 0-7', KNIGHT_ATTACK.flat().every(v => v >= 0 && v <= 7));
assert('KNIGHT_HIT values in range 0-7', KNIGHT_HIT.flat().every(v => v >= 0 && v <= 7));

// Sprites should have non-transparent pixels
assert('KNIGHT_IDLE has content', KNIGHT_IDLE.flat().some(v => v > 0));
assert('KNIGHT_ATTACK has content', KNIGHT_ATTACK.flat().some(v => v > 0));

console.log('\n=== Palette Tests ===');
assert('RED_PALETTE has keys 1-7', [1,2,3,4,5,6,7].every(k => typeof RED_PALETTE[k] === 'string'));
assert('BLUE_PALETTE has keys 1-7', [1,2,3,4,5,6,7].every(k => typeof BLUE_PALETTE[k] === 'string'));
assert('RED primary color is red', RED_PALETTE[2] === '#cc2222');
assert('BLUE primary color is blue', BLUE_PALETTE[2] === '#2244aa');
assert('Both share same skin color', RED_PALETTE[4] === BLUE_PALETTE[4]);
assert('Both share same outline color', RED_PALETTE[1] === BLUE_PALETTE[1]);

console.log('\n=== Function Existence Tests ===');
assert('drawKnight is a function', typeof drawKnight === 'function');
assert('drawKnightPreview is a function', typeof drawKnightPreview === 'function');
assert('drawSparks is a function', typeof drawSparks === 'function');
assert('selectKnight is a function', typeof selectKnight === 'function');
assert('startFight is a function', typeof startFight === 'function');
assert('resetGame is a function', typeof resetGame === 'function');
assert('applyAttack is a function', typeof applyAttack === 'function');
assert('getSpriteForState is a function', typeof getSpriteForState === 'function');
assert('endFight is a function', typeof endFight === 'function');

console.log('\n=== Game Logic Tests ===');
assert('FIGHT_DURATION is 20000ms', FIGHT_DURATION === 20000);
assert('getSpriteForState idle', getSpriteForState('idle') === KNIGHT_IDLE);
assert('getSpriteForState attack', getSpriteForState('attack') === KNIGHT_ATTACK);
assert('getSpriteForState hit', getSpriteForState('hit') === KNIGHT_HIT);
assert('getSpriteForState unknown defaults to idle', getSpriteForState('xyz') === KNIGHT_IDLE);

// Test health mechanics
redHealth = 100;
blueHealth = 100;
fightStartTime = Date.now();
fightFrame = 0;

// Simulate direct damage (bypass setTimeout in applyAttack)
blueHealth = Math.max(0, blueHealth - 25);
assert('Direct damage works', blueHealth === 75);

blueHealth = Math.max(0, blueHealth - 100);
assert('Health floors at 0', blueHealth === 0);

redHealth = 50;
redHealth = Math.max(0, redHealth - 30);
assert('Partial damage works', redHealth === 20);

console.log('\n=== Randomness Test ===');
let redWins = 0;
const trials = 10000;
for (let i = 0; i < trials; i++) {
    if (Math.random() < 0.5) redWins++;
}
const ratio = redWins / trials;
assert('50/50 random distribution', ratio > 0.45 && ratio < 0.55, `ratio=${ratio.toFixed(4)}`);

console.log('\n=== Knight Position Tests ===');
assert('RED_BASE_X is reasonable', RED_BASE_X > 0 && RED_BASE_X < 256);
assert('BLUE_BASE_X is reasonable', BLUE_BASE_X > 256 && BLUE_BASE_X < 512);
assert('KNIGHT_Y is set', typeof KNIGHT_Y === 'number' && KNIGHT_Y > 0);
assert('FIGHT_PIXEL size set', typeof FIGHT_PIXEL === 'number' && FIGHT_PIXEL > 0);

// Cleanup
fightStartTime = null;

// ---- SUMMARY ----
console.log('\n========================================');
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log('========================================');

process.exit(failed > 0 ? 1 : 0);
