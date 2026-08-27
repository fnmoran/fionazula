/* Анимация геометрических звезд-искр на фоне */
const canvas = document.getElementById('ambientCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function setDimensions() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', setDimensions);
setDimensions();

const mouse = { x: -2000, y: -2000, radius: 140 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
    mouse.x = -2000;
    mouse.y = -2000;
});

function drawSparkle(x, y, radius, alpha, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    
    // Четырехконечная звезда в стиле постера
    ctx.moveTo(0, -radius * 2);
    ctx.quadraticCurveTo(0, 0, radius * 2, 0);
    ctx.quadraticCurveTo(0, 0, 0, radius * 2);
    ctx.quadraticCurveTo(0, 0, -radius * 2, 0);
    ctx.quadraticCurveTo(0, 0, 0, -radius * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

class Particle {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 20;
        this.radius = Math.random() * 4 + 2;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.35 + 0.15);
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.alpha = Math.random() * 0.35 + 0.1;
        this.isRed = Math.random() > 0.65; // Часть звезд терракотовые, часть белые
    }

    update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 2;
            this.y += Math.sin(angle) * force * 2;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.pulse += this.pulseSpeed;

        if (this.y < -30 || this.x < -30 || this.x > width + 30) {
            this.reset(false);
        }
    }

    draw() {
        const currentAlpha = (Math.sin(this.pulse) + 1) * 0.5 * this.alpha + 0.05;
        const color = this.isRed ? '#B52E27' : '#FFFFFF';
        drawSparkle(this.x, this.y, this.radius, currentAlpha, color);
    }
}

const particleCount = window.innerWidth <= 768 ? 20 : 45;
const particles = Array.from({ length: particleCount }, () => new Particle());

function animateAmbient() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateAmbient);
}
animateAmbient();

/* Фильтрация категорий */
function filterGallery(category, event) {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (event) {
        event.currentTarget.classList.add('active');
    }

    const cards = document.querySelectorAll('.gallery-card');
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

/* Модальное окно лайтбокса */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxTag = document.getElementById('lightboxTag');

function openLightbox(src, title, tag) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxTitle.textContent = title;
    lightboxTag.textContent = tag;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
    if (e.target === lightbox) {
        forceCloseLightbox();
    }
}

function forceCloseLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
        forceCloseLightbox();
    }
});
