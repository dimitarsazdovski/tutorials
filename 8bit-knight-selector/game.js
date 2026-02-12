/**
 * 8-Bit Knight Selector - Game Logic
 */

let playerChoice = null;
let fightInterval = null;
let fightAnimFrame = null;
let fightStartTime = null;
const FIGHT_DURATION = 20000; // 20 seconds

// Fight state
let redHealth = 100;
let blueHealth = 100;
let redState = 'idle';   // idle, attack, hit
let blueState = 'idle';
let redStateTimer = 0;
let blueStateTimer = 0;
let fightFrame = 0;
let winner = null;
let sparkEffects = [];

// Knight positions on fight canvas
const FIGHT_PIXEL = 5;
const RED_BASE_X = 60;
const BLUE_BASE_X = 512 - 60 - 16 * FIGHT_PIXEL;
const KNIGHT_Y = 100;

function selectKnight(color) {
    playerChoice = color;
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('fight-screen').classList.remove('hidden');
    startFight();
}

function startFight() {
    redHealth = 100;
    blueHealth = 100;
    redState = 'idle';
    blueState = 'idle';
    redStateTimer = 0;
    blueStateTimer = 0;
    fightFrame = 0;
    winner = null;
    sparkEffects = [];

    document.getElementById('health-red').style.width = '100%';
    document.getElementById('health-blue').style.width = '100%';
    document.getElementById('timer-bar').style.width = '100%';

    fightStartTime = Date.now();

    // Predetermine winner randomly
    winner = Math.random() < 0.5 ? 'red' : 'blue';

    // Schedule damage events to make it dramatic
    scheduleFightEvents();

    // Start render loop
    fightAnimFrame = requestAnimationFrame(fightLoop);
}

function scheduleFightEvents() {
    // Create a series of attack events over 20 seconds
    // The loser takes more total damage
    const loser = winner === 'red' ? 'blue' : 'red';

    // Generate attack timings
    const events = [];
    let time = 500;
    while (time < FIGHT_DURATION - 1000) {
        const attacker = Math.random() < 0.5 ? 'red' : 'blue';
        const damage = 3 + Math.floor(Math.random() * 8);
        events.push({ time, attacker, damage });
        time += 400 + Math.floor(Math.random() * 600);
    }

    // Adjust damage so loser ends up at 0 and winner keeps some health
    let totalRedDamage = 0;
    let totalBlueDamage = 0;
    events.forEach(e => {
        if (e.attacker === 'red') totalBlueDamage += e.damage;
        else totalRedDamage += e.damage;
    });

    // Scale damage: winner should end at 15-40 health, loser at 0
    const winnerFinalHealth = 15 + Math.floor(Math.random() * 25);

    if (winner === 'red') {
        const redScale = totalRedDamage > 0 ? (100 - winnerFinalHealth) / totalRedDamage : 1;
        const blueScale = totalBlueDamage > 0 ? 100 / totalBlueDamage : 1;
        events.forEach(e => {
            if (e.attacker === 'blue') e.damage = Math.max(1, Math.round(e.damage * redScale));
            else e.damage = Math.max(1, Math.round(e.damage * blueScale));
        });
    } else {
        const blueScale = totalBlueDamage > 0 ? (100 - winnerFinalHealth) / totalBlueDamage : 1;
        const redScale = totalRedDamage > 0 ? 100 / totalRedDamage : 1;
        events.forEach(e => {
            if (e.attacker === 'red') e.damage = Math.max(1, Math.round(e.damage * blueScale));
            else e.damage = Math.max(1, Math.round(e.damage * redScale));
        });
    }

    // Schedule timeouts for each event
    events.forEach(e => {
        setTimeout(() => {
            if (!fightStartTime) return; // fight was reset
            applyAttack(e.attacker, e.damage);
        }, e.time);
    });
}

function applyAttack(attacker, damage) {
    if (attacker === 'red') {
        redState = 'attack';
        redStateTimer = 12;
        setTimeout(() => {
            blueHealth = Math.max(0, blueHealth - damage);
            blueState = 'hit';
            blueStateTimer = 8;
            document.getElementById('health-blue').style.width = blueHealth + '%';
            sparkEffects.push({ x: BLUE_BASE_X + 20, y: KNIGHT_Y + 40, frame: 0, maxFrame: 12 });
        }, 200);
    } else {
        blueState = 'attack';
        blueStateTimer = 12;
        setTimeout(() => {
            redHealth = Math.max(0, redHealth - damage);
            redState = 'hit';
            redStateTimer = 8;
            document.getElementById('health-red').style.width = redHealth + '%';
            sparkEffects.push({ x: RED_BASE_X + 60, y: KNIGHT_Y + 40, frame: 0, maxFrame: 12 });
        }, 200);
    }
}

function getSpriteForState(state) {
    switch (state) {
        case 'attack': return KNIGHT_ATTACK;
        case 'hit': return KNIGHT_HIT;
        default: return KNIGHT_IDLE;
    }
}

function fightLoop(timestamp) {
    const elapsed = Date.now() - fightStartTime;
    const remaining = Math.max(0, FIGHT_DURATION - elapsed);
    const seconds = Math.ceil(remaining / 1000);

    // Update timer
    document.getElementById('timer-display').textContent = seconds;
    document.getElementById('timer-bar').style.width = (remaining / FIGHT_DURATION * 100) + '%';

    // Update state timers
    fightFrame++;
    if (redStateTimer > 0) {
        redStateTimer--;
        if (redStateTimer === 0) redState = 'idle';
    }
    if (blueStateTimer > 0) {
        blueStateTimer--;
        if (blueStateTimer === 0) blueState = 'idle';
    }

    // Update spark effects
    sparkEffects.forEach(s => s.frame++);
    sparkEffects = sparkEffects.filter(s => s.frame < s.maxFrame);

    // Draw fight scene
    const canvas = document.getElementById('fight-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#1a1a0a';
    ctx.fillRect(0, 220, 512, 80);
    for (let i = 0; i < 512; i += 8) {
        ctx.fillStyle = (Math.floor(i / 8) % 2 === 0) ? '#2a2a1a' : '#222210';
        ctx.fillRect(i, 220, 8, 4);
    }

    // Breathing/bob animation
    const redBob = Math.sin(fightFrame * 0.1) * 2;
    const blueBob = Math.sin(fightFrame * 0.1 + Math.PI) * 2;

    // Position offsets for attacks
    let redOffX = 0, blueOffX = 0;
    if (redState === 'attack') redOffX = 15;
    if (blueState === 'attack') blueOffX = -15;
    if (redState === 'hit') redOffX = -8;
    if (blueState === 'hit') blueOffX = 8;

    // Opacity for hits (flash)
    const redOpacity = (redState === 'hit' && fightFrame % 4 < 2) ? 0.5 : 1;
    const blueOpacity = (blueState === 'hit' && fightFrame % 4 < 2) ? 0.5 : 1;

    // Draw knights
    drawKnight(
        ctx, getSpriteForState(redState), RED_PALETTE,
        RED_BASE_X + redOffX, KNIGHT_Y + redBob,
        FIGHT_PIXEL, false, redOpacity
    );
    drawKnight(
        ctx, getSpriteForState(blueState), BLUE_PALETTE,
        BLUE_BASE_X + blueOffX, KNIGHT_Y + blueBob,
        FIGHT_PIXEL, true, blueOpacity
    );

    // Draw sparks
    sparkEffects.forEach(s => {
        drawSparks(ctx, s.x, s.y, s.frame);
    });

    // Check if fight is over
    if (remaining <= 0) {
        endFight();
        return;
    }

    fightAnimFrame = requestAnimationFrame(fightLoop);
}

function endFight() {
    fightStartTime = null;
    if (fightAnimFrame) {
        cancelAnimationFrame(fightAnimFrame);
        fightAnimFrame = null;
    }

    // Show result
    document.getElementById('fight-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');

    const playerWon = playerChoice === winner;
    const resultText = document.getElementById('result-text');
    const resultDetail = document.getElementById('result-detail');

    if (playerWon) {
        resultText.textContent = 'YOU WIN!';
        resultText.className = 'result-text win';
        resultDetail.textContent = `Your ${playerChoice} knight is victorious!`;
    } else {
        resultText.textContent = 'YOU LOSE!';
        resultText.className = 'result-text lose';
        resultDetail.textContent = `The ${winner} knight defeated your champion...`;
    }

    // Draw result scene
    drawResultScene(playerWon);
}

function drawResultScene(playerWon) {
    const canvas = document.getElementById('result-canvas');
    const ctx = canvas.getContext('2d');

    let frame = 0;
    const winnerPalette = winner === 'red' ? RED_PALETTE : BLUE_PALETTE;
    const loserPalette = winner === 'red' ? BLUE_PALETTE : RED_PALETTE;
    const winnerX = 180;
    const loserX = 260;

    function animateResult() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Ground
        ctx.fillStyle = '#1a1a0a';
        ctx.fillRect(0, 220, 512, 80);
        for (let i = 0; i < 512; i += 8) {
            ctx.fillStyle = (Math.floor(i / 8) % 2 === 0) ? '#2a2a1a' : '#222210';
            ctx.fillRect(i, 220, 8, 4);
        }

        // Winner bouncing
        const winBob = Math.abs(Math.sin(frame * 0.08)) * -15;
        drawKnight(ctx, KNIGHT_VICTORY, winnerPalette, winnerX, 100 + winBob, FIGHT_PIXEL, winner === 'blue', 1);

        // Loser fallen
        drawKnight(ctx, KNIGHT_DEFEAT, loserPalette, loserX, 130, FIGHT_PIXEL, winner === 'red', 0.7);

        // Confetti for winner
        if (playerWon) {
            const confettiColors = ['#ff4444', '#44ff44', '#4488ff', '#ffcc00', '#ff88ff'];
            for (let i = 0; i < 15; i++) {
                const cx = (Math.sin(frame * 0.05 + i * 1.7) * 200) + 256;
                const cy = ((frame * 2 + i * 40) % 320);
                ctx.fillStyle = confettiColors[i % confettiColors.length];
                ctx.fillRect(Math.floor(cx), Math.floor(cy), 4, 4);
            }
        }

        frame++;
        requestAnimationFrame(animateResult);
    }

    animateResult();
}

function resetGame() {
    // Reset state
    playerChoice = null;
    fightStartTime = null;
    if (fightAnimFrame) {
        cancelAnimationFrame(fightAnimFrame);
        fightAnimFrame = null;
    }

    // Show selection screen
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('fight-screen').classList.add('hidden');
    document.getElementById('selection-screen').classList.remove('hidden');

    // Re-draw previews
    initPreviews();
}
