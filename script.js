const canvas = document.getElementById('forestCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const mouse = {
    x: -1000,
    y: -1000,
    radius: 140
};

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
}, { passive: true });

window.addEventListener('touchend', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

function drawForestLayer(baseY, maxTreeHeight, color, treeStep, noiseOffset) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, baseY);

    for (let x = 0; x <= canvas.width + treeStep; x += treeStep) {
        const seed = Math.sin(x * 0.008 + noiseOffset);
        const distFromCenter = Math.abs(x - canvas.width * 0.5) / (canvas.width * 0.5);
        const edgeBoost = 1 + Math.pow(distFromCenter, 1.4) * 0.55;
        
        const treeH = maxTreeHeight * edgeBoost * (0.7 + 0.3 * Math.sin(x * 0.025 + seed));
        const peakX = x + treeStep * 0.5;
        const peakY = baseY - treeH;

        ctx.lineTo(x + treeStep * 0.15, baseY - treeH * 0.28);
        ctx.lineTo(x + treeStep * 0.05, baseY - treeH * 0.23);
        ctx.lineTo(x + treeStep * 0.25, baseY - treeH * 0.58);
        ctx.lineTo(x + treeStep * 0.15, baseY - treeH * 0.52);
        ctx.lineTo(peakX, peakY);
        ctx.lineTo(x + treeStep * 0.85, baseY - treeH * 0.52);
        ctx.lineTo(x + treeStep * 0.75, baseY - treeH * 0.58);
        ctx.lineTo(x + treeStep * 0.95, baseY - treeH * 0.23);
        ctx.lineTo(x + treeStep * 0.85, baseY - treeH * 0.28);
        ctx.lineTo(x + treeStep, baseY);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}

class TealWisp {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial 
            ? Math.random() * canvas.height 
            : canvas.height * 0.2 + Math.random() * (canvas.height * 0.8);
        this.baseRadius = Math.random() * 2 + 1.2;
        this.glowRadius = this.baseRadius * (Math.random() * 5 + 5);
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = - (Math.random() * 0.35 + 0.15);
        this.pulseSpeed = Math.random() * 0.03 + 0.015;
        this.pulse = Math.random() * Math.PI * 2;
        this.alpha = Math.random() * 0.6 + 0.35;
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * force * 3.5;
            this.vy += Math.sin(angle) * force * 3.5;
        }

        this.vx *= 0.92;
        this.vy *= 0.92;

        this.x += this.speedX + Math.sin(this.pulse) * 0.25 + this.vx;
        this.y += this.speedY + this.vy;
        this.pulse += this.pulseSpeed;

        if (this.y < -30 || this.x < -30 || this.x > canvas.width + 30) {
            this.reset(false);
            this.y = canvas.height + 10;
        }
    }

    draw() {
        const currentAlpha = Math.max(0.12, (Math.sin(this.pulse) + 1) * 0.5 * this.alpha);
        
        const grad = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.glowRadius
        );
        grad.addColorStop(0, `rgba(45, 212, 191, ${currentAlpha * 0.95})`);
        grad.addColorStop(0.35, `rgba(45, 212, 191, ${currentAlpha * 0.45})`);
        grad.addColorStop(1, 'rgba(45, 212, 191, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(235, 255, 252, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.baseRadius * 0.85, 0, Math.PI * 2);
        ctx.fill();
    }
}

const isMobile = window.innerWidth <= 768;
const wispCount = isMobile ? 32 : 65;
const wisps = [];
for (let i = 0; i < wispCount; i++) {
    wisps.push(new TealWisp());
}

function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#04070d');
    skyGrad.addColorStop(0.4, '#091220');
    skyGrad.addColorStop(1, '#0e192e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawForestLayer(canvas.height - 180, 420, '#0c182c', 38, 1.2);
    drawForestLayer(canvas.height - 100, 480, '#08111f', 48, 2.5);
    drawForestLayer(canvas.height, 540, '#040812', 60, 4.0);

    wisps.forEach(w => {
        w.update();
        w.draw();
    });

    requestAnimationFrame(renderScene);
}
renderScene();

function switchTab(sectionId, event) {
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (event) {
        event.currentTarget.classList.add('active');
    }

    const sections = document.querySelectorAll('.portfolio-section');
    sections.forEach(sec => {
        sec.classList.remove('active-section');
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active-section');
    }

    const contentArea = document.getElementById('contentArea');
    contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openFolder(folderId) {
    const modal = document.getElementById('modal-' + folderId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeFolderModal(e, folderId) {
    if (e.target.classList.contains('folder-modal')) {
        closeFolderModalDirect(folderId);
    }
}

function closeFolderModalDirect(folderId) {
    const modal = document.getElementById('modal-' + folderId);
    if (modal) {
        modal.classList.remove('active');
        if (!lightbox.classList.contains('active')) {
            document.body.style.overflow = 'auto';
        }
    }
}

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        lightbox.classList.remove('active');
        const activeFolder = document.querySelector('.folder-modal.active');
        if (!activeFolder) {
            document.body.style.overflow = 'auto';
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            const activeFolder = document.querySelector('.folder-modal.active');
            if (!activeFolder) document.body.style.overflow = 'auto';
        } else {
            const activeFolder = document.querySelector('.folder-modal.active');
            if (activeFolder) {
                activeFolder.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    }
});
