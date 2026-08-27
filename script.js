/* Ambient Canvas Particles Animation */
const canvas = document.getElementById('ambientCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function setDimensions() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', setDimensions);
setDimensions();

const mouse = {
    x: -2000,
    y: -2000,
    radius: 120
};

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
    mouse.x = -2000;
    mouse.y = -2000;
});

class Particle {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 10;
        this.radius = Math.random() * 1.6 + 0.6;
        this.baseGlow = this.radius * (Math.random() * 4 + 3);
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.4 + 0.15);
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.025 + 0.01;
        this.alpha = Math.random() * 0.45 + 0.2;
    }

    update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 2.5;
            this.y += Math.sin(angle) * force * 2.5;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.pulse += this.pulseSpeed;

        if (this.y < -20 || this.x < -20 || this.x > width + 20) {
            this.reset(false);
        }
    }

    draw() {
        const currentAlpha = (Math.sin(this.pulse) + 1) * 0.5 * this.alpha + 0.1;

        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.baseGlow);
        grad.addColorStop(0, `rgba(163, 184, 153, ${currentAlpha * 0.9})`);
        grad.addColorStop(0.5, `rgba(163, 184, 153, ${currentAlpha * 0.3})`);
        grad.addColorStop(1, 'rgba(163, 184, 153, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.baseGlow, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(240, 247, 240, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

const particleCount = window.innerWidth <= 768 ? 25 : 55;
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

/* Gallery Filtering System */
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

/* Lightbox Logic */
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
