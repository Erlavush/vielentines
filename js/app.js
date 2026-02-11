/* ============================================================
   VIELENTINES — Valentine Proposal Website Logic
   ============================================================ */

// ==================== CONFIGURATION ====================
const EMAILJS_PUBLIC_KEY = '0pFx3Nxbph5tM-IT7';
const EMAILJS_SERVICE_ID = 'service_0d74fjg';
const EMAILJS_TEMPLATE_ID = 'template_wrvd2yh';

// Valentine's Day target: Feb 14, 2026, 00:00:00 PHT (UTC+8)
const VALENTINES_DAY = new Date('2026-02-14T00:00:00+08:00');

// ==================== STATE ====================
let currentPage = 0; // index of current visible page
let touchStartX = 0;
let touchEndX = 0;
let isAnimating = false;
let emailSent = false;

// Pages that support swipe-right navigation
// page indexes: 0=P1, 1=P2, 2=P3, 3=P4, 4-8=P5.1-5.5, 9=P6, 10=P7
const SWIPEABLE_PAGES = [0, 1]; // only pages 1 and 2 support swipe
const TOTAL_PAGES = 11;

// ==================== NARRATION DATA (Page 1) ====================
const narrationLines = [
    {
        text: 'Hi vieeee sweetiee ;>',
        sticker: 'GIFs/sticker-1.gif'
    },
    {
        text: "I'm sorry it takes me so long to ask you thisss...",
        sticker: 'GIFs/sticker-2.gif'
    },
    {
        text: "I just want you to know that I've been spending a lot of time figuring out how to really ask you :<",
        sticker: 'GIFs/sticker-3.gif'
    },
    {
        text: 'Which is why I made this for you ><',
        sticker: 'GIFs/sticker-4.gif'
    },
    {
        text: "All I wanted to say is that... You are the most prettiest, most elegant, most lovely, sweetest, most beautiful, most gorgeous, most wonderful, most charming, most dazzling, most radiant girl in the entire universe 💖",
        sticker: 'GIFs/sticker-5.gif' 
    },
    {
        text: 'Also I have a present for you, vieee...',
        sticker: 'GIFs/sticker-6.gif'
    }
];

// ==================== TERMINAL DATA (Page 6) ====================
const terminalLines = [
    { text: '> Initializing vie protocol...', delay: 600 },
    { text: '> Loading feelings.dll... ████████████ 100%', delay: 1800 },
    { text: '> Scanning for soulmate... FOUND ✓', delay: 800 },
    { text: '> Establishing connection... ██████████ 100%', delay: 1800 },
    { text: '', delay: 300 },
    { text: '✅ SUCCESS: Connection established.', delay: 800 },
    { text: '', delay: 300 },
    { text: '❤️ Heart_Rate: ████████████████████ RISING ↑↑↑', delay: 800, heartRate: true },
    { text: '', delay: 300 },
    { text: '📊 Status: earli is now the luckiest, happiest', delay: 600 },
    { text: '          guy in the world ;>', delay: 400 },
    { text: '', delay: 300 },
    { text: '> NYAHAHAHUAHUAHAUHAUHAUAH < 3', delay: 600 }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
    setupSwipe();
    startNarration();
    startCountdown();
});

// ==================== FLOATING HEARTS ====================
function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const hearts = ['♥', '♡', '💕', '💗', '❤'];
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (12 + Math.random() * 20) + 'px';
        heart.style.animationDuration = (8 + Math.random() * 12) + 's';
        heart.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(heart);
    }
}

// ==================== SWIPE NAVIGATION ====================
function setupSwipe() {
    const wrapper = document.getElementById('pagesWrapper');

    // Touch events disabled per user request
    /*
    wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    */

    // Desktop: arrow key support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' && SWIPEABLE_PAGES.includes(currentPage)) {
            navigateToPage(currentPage + 1);
        }
    });
}

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) < 50) return; // too small

    if (diff > 0 && SWIPEABLE_PAGES.includes(currentPage)) {
        // Swiped left → go right
        navigateToPage(currentPage + 1);
    }
}

function navigateToPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= TOTAL_PAGES || isAnimating) return;
    if (pageIndex === currentPage) return;
    isAnimating = true;

    const pages = document.querySelectorAll('.page');
    const oldPage = pages[currentPage];
    const newPage = pages[pageIndex];

    // Hide floating hearts on flower page (black bg), show on others
    const heartsEl = document.getElementById('floatingHearts');
    if (pageIndex === 1) {
        heartsEl.style.opacity = '0';
        heartsEl.style.transition = 'opacity 0.8s ease';
    } else {
        heartsEl.style.opacity = '1';
        heartsEl.style.transition = 'opacity 0.8s ease';
    }

    // Fade out old, fade in new
    if (oldPage) oldPage.classList.remove('active');
    if (newPage) newPage.classList.add('active');

    currentPage = pageIndex;

    // Wait for CSS transition to finish (0.8s)
    setTimeout(() => {
        isAnimating = false;
        onPageEnter(pageIndex);
    }, 850);
}

function onPageEnter(pageIndex) {
    switch (pageIndex) {
        case 1: // Flower animation
            triggerFlowerAnimation();
            break;
        case 3: // Letter
            showLetter();
            break;
        case 9: // Celebration
            startTerminalAnimation();
            break;
    }
}

// ==================== PAGE 1: TYPEWRITER ====================
let narrationIndex = 0;
let charIndex = 0;
let narrationTimer = null;

function startNarration() {
    narrationIndex = 0;
    charIndex = 0;
    typeNextLine();
}

function typeNextLine() {
    if (narrationIndex >= narrationLines.length) {
        // All lines done — show swipe prompt
        document.getElementById('swipePrompt1').classList.remove('hidden');
        return;
    }

    const line = narrationLines[narrationIndex];
    charIndex = 0;

    // Clear previous text for fresh line
    const textEl = document.getElementById('narrationText');
    textEl.innerHTML = '';

    // Show sticker immediately alongside the text
    showNarrationSticker(line.sticker);

    // If this is the LAST line (index 5), show the prompt immediately
    if (narrationIndex === narrationLines.length - 1) {
        document.getElementById('swipePrompt1').classList.remove('hidden');
    } else {
        document.getElementById('swipePrompt1').classList.add('hidden');
    }

    // Dynamic font size based on text length
    const len = line.text.length;
    if (len > 180) {
        textEl.style.fontSize = 'clamp(0.9rem, 3vw, 1.3rem)';
    } else if (len > 120) {
        textEl.style.fontSize = 'clamp(1rem, 3.5vw, 1.5rem)';
    } else if (len > 70) {
        textEl.style.fontSize = 'clamp(1.2rem, 4vw, 1.8rem)';
    } else {
        textEl.style.fontSize = '';
    }

    // Start typing
    typeChar(line);
}

function typeChar(line) {
    const textEl = document.getElementById('narrationText');

    if (charIndex < line.text.length) {
        // Remove old cursor
        const oldCursor = textEl.querySelector('.cursor');
        if (oldCursor) oldCursor.remove();

        // Add character
        textEl.innerHTML += line.text[charIndex];

        // Add cursor
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        textEl.appendChild(cursor);

        charIndex++;
        narrationTimer = setTimeout(() => typeChar(line), 60);
    } else {
        // Line done — remove cursor
        const oldCursor = textEl.querySelector('.cursor');
        if (oldCursor) oldCursor.remove();

        // After pause, move to next line
        narrationIndex++;
        setTimeout(() => {
            typeNextLine();
        }, 2500);
    }
}

function showNarrationSticker(src) {
    const stickerContainer = document.getElementById('narrationSticker');
    const stickerImg = document.getElementById('narrationStickerImg');
    stickerImg.src = src;
    stickerContainer.classList.add('visible');
}

// ==================== PAGE 2: FLOWER ANIMATION ====================
let flowerTriggered = false;

function triggerFlowerAnimation() {
    if (flowerTriggered) return;
    flowerTriggered = true;

    const container = document.getElementById('flowerContainer');
    setTimeout(() => {
        container.classList.remove('not-loaded');
    }, 500);

    // Show prompt after flower animation finishes
    setTimeout(() => {
        document.getElementById('swipePrompt2').classList.remove('hidden');
    }, 8000);
}

// ==================== PAGE 3: ENVELOPE ====================
document.addEventListener('DOMContentLoaded', () => {
    const envelope = document.getElementById('envelope');
    envelope.addEventListener('click', () => {
        envelope.classList.add('opened');
        setTimeout(() => {
            navigateToPage(3);
        }, 900);
    });
});

// ==================== PAGE 4: LETTER ====================
function showLetter() {
    const paper = document.getElementById('letterPaper');
    setTimeout(() => {
        paper.classList.add('visible');
    }, 200);
}

// ==================== NAVIGATION HELPERS ====================
function goToYes() {
    navigateToPage(9); // Page 6 = index 9
}

function goToNo(nextSubPage) {
    // nextSubPage: 1-5 → page indexes 4-8
    const pageIndex = 3 + nextSubPage; // 5.1=4, 5.2=5, 5.3=6, 5.4=7, 5.5=8
    navigateToPage(pageIndex);
}

// ==================== PAGE 5.5: SWAP TRICK ====================
function handleSwapNo() {
    const buttonsContainer = document.getElementById('swapButtons');
    const yesBtn = document.getElementById('swapYes');
    const noBtn = document.getElementById('swapNo');
    const page = document.getElementById('page5_5');

    // Step 1: Swap button positions instantly
    buttonsContainer.style.flexDirection = 'row-reverse';

    // Step 2: After a beat, hide NEVERR and start zooming into FINEE
    setTimeout(() => {
        noBtn.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        noBtn.style.opacity = '0';
        noBtn.style.transform = 'scale(0.5)';
        noBtn.style.pointerEvents = 'none';

        // Step 3: Zoom the entire page, centering FINEE on screen
        setTimeout(() => {
            const btnRect = yesBtn.getBoundingClientRect();
            const btnCenterX = btnRect.left + btnRect.width / 2;
            const btnCenterY = btnRect.top + btnRect.height / 2;
            const viewCenterX = window.innerWidth / 2;
            const viewCenterY = window.innerHeight / 2;
            const offsetX = viewCenterX - btnCenterX;
            const offsetY = viewCenterY - btnCenterY;

            page.style.transition = 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            page.style.transformOrigin = `${btnCenterX}px ${btnCenterY}px`;
            page.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(5)`;

            // Step 4: Press the FINEE button visually
            yesBtn.classList.add('btn-pressed');
            yesBtn.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            yesBtn.style.transform = 'scale(1.15)';
            yesBtn.style.boxShadow = '0 0 30px rgba(255,255,255,0.6)';

            // Step 5: Navigate to celebration after zoom completes
            setTimeout(() => {
                goToYes();
                // Reset the zoom after navigation
                setTimeout(() => {
                    page.style.transition = 'none';
                    page.style.transform = 'none';
                }, 900);
            }, 1400);
        }, 500);
    }, 300);
}

// ==================== PAGE 6: TERMINAL ANIMATION ====================
let terminalStarted = false;

function startTerminalAnimation() {
    if (terminalStarted) return;
    terminalStarted = true;

    const body = document.getElementById('terminalBody');
    body.innerHTML = '';

    let lineIndex = 0;
    let totalDelay = 0;

    terminalLines.forEach((line, i) => {
        totalDelay += line.delay;
        const delay = totalDelay;

        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'term-line';

            if (line.heartRate) {
                div.innerHTML = line.text.replace(
                    '████████████████████',
                    '<span class="heart-rate">████████████████████</span>'
                );
            } else {
                div.textContent = line.text;
            }

            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
        }, delay);
    });

    // After all lines, show stickers + confetti + send email
    const finalDelay = totalDelay + 1000;
    setTimeout(() => {
        document.getElementById('celebrationStickers').classList.remove('hidden');
        launchConfetti();
        sendEmails();

        // Show swipe prompt to go to page 7
        setTimeout(() => {
            document.getElementById('swipePrompt6').classList.remove('hidden');
            // Enable swiping on page 6 to page 7
            SWIPEABLE_PAGES.push(9);
        }, 2000);
    }, finalDelay);
}

// ==================== CONFETTI ====================
function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ff6b9d', '#e91e63', '#ff1744', '#ffd700', '#ff9800', '#f06292', '#ba68c8', '#fff'];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: 4 + Math.random() * 6,
            h: 8 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 4,
            vy: 2 + Math.random() * 4,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10,
            opacity: 1
        });
    }

    let frame = 0;
    const maxFrames = 300;

    function animate() {
        if (frame >= maxFrames) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fadeStart = maxFrames * 0.7;

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // gravity
            p.rotation += p.rotSpeed;

            if (frame > fadeStart) {
                p.opacity = Math.max(0, 1 - (frame - fadeStart) / (maxFrames - fadeStart));
            }

            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        frame++;
        requestAnimationFrame(animate);
    }

    animate();
}

// ==================== EMAIL ====================
function sendEmails() {
    if (emailSent) return;
    emailSent = true;

    try {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
        const timestamp = new Date().toLocaleString();

        // Email to Erlavush
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            email: 'ejbdelgado01322@usep.edu.ph',
            to_name: 'Earli',
            name: 'Earli',
            from_name: 'Earl',
            message: `BROO SHE SAID YES!! 🎉🎉 Vie clicked YES at ${timestamp}. ur literally the luckiest guy alive rn no cap. go celebrate or smth idk 😭💙`
        }).then(() => {
            console.log('Email sent to Earli ✓');
        }).catch(err => console.error('Email error (Earli):', err));

        // Email to Vie
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            email: 'empmara01202400407@usep.edu.ph',
            to_name: 'Viee',
            name: 'Viee',
            from_name: 'Earl',
            message: `sooo u just said YES hehe 😭💙 NAYAHAHHAHAHAHA anyway vavieeeee, happy valentines againnnn NAYDAWHDAUWHDXUAHWXDAWXDAWXDAWXD maulaw nq jk NAYAYYA mwaaaaa see u if ever u free sa 14 mwaaaa mwaa mwaa💙`
        }).then(() => {
            console.log('Email sent to Vie ✓');
        }).catch(err => console.error('Email error (Vie):', err));
    } catch (e) {
        console.error('EmailJS initialization error:', e);
    }
}

// ==================== COUNTDOWN (Page 7) ====================
function startCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const diff = VALENTINES_DAY - now;

    if (diff <= 0) {
        // Valentine's Day has arrived or passed!
        document.getElementById('countDays').textContent = '🎉';
        document.getElementById('countHours').textContent = '💖';
        document.getElementById('countMinutes').textContent = '🎉';
        document.getElementById('countSeconds').textContent = '💖';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countDays').textContent = String(days).padStart(2, '0');
    document.getElementById('countHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('countMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('countSeconds').textContent = String(seconds).padStart(2, '0');
}
