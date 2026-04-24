'use strict';

/* ================================================================
   PARTICLE NETWORK BACKGROUND
   ================================================================ */
class ParticleNetwork {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.count = 65;
    this.maxDist = 125;
    this.resize();
    this.init();
    window.addEventListener('resize', () => { this.resize(); this.init(); });
    this.animate();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        size: Math.random() * 1.6 + 0.5,
        opacity: Math.random() * 0.25 + 0.08
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > this.canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height)  p.vy *= -1;

      // Draw dot
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(79, 70, 229, ${p.opacity})`;
      this.ctx.fill();

      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const q = this.particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxDist) {
          const alpha = (1 - dist / this.maxDist) * 0.28;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(q.x, q.y);
          this.ctx.strokeStyle = `rgba(79, 70, 229, ${alpha})`;
          this.ctx.lineWidth = 0.6;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}


/* ================================================================
   TYPING ANIMATION
   ================================================================ */
class TypeWriter {
  constructor(el, texts, speed, pause) {
    this.el       = el;
    this.texts    = texts;
    this.speed    = speed  || 80;
    this.pause    = pause  || 2200;
    this.textIdx  = 0;
    this.charIdx  = 0;
    this.deleting = false;
    if (this.el) this.type();
  }

  type() {
    const current = this.texts[this.textIdx];

    if (this.deleting) {
      this.el.textContent = current.substring(0, this.charIdx - 1);
      this.charIdx--;
    } else {
      this.el.textContent = current.substring(0, this.charIdx + 1);
      this.charIdx++;
    }

    if (!this.deleting && this.charIdx === current.length) {
      setTimeout(() => { this.deleting = true; this.type(); }, this.pause);
      return;
    }

    if (this.deleting && this.charIdx === 0) {
      this.deleting = false;
      this.textIdx  = (this.textIdx + 1) % this.texts.length;
    }

    setTimeout(() => this.type(), this.deleting ? this.speed * 0.5 : this.speed);
  }
}


/* ================================================================
   SKILL BAR ANIMATION ON SCROLL
   ================================================================ */
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-progress-fill');
  const saved  = new Map();

  fills.forEach(fill => {
    saved.set(fill, fill.style.width);
    fill.style.width      = '0%';
    fill.style.transition = 'none';
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        requestAnimationFrame(() => {
          fill.style.transition = 'width 1.3s cubic-bezier(0.4, 0, 0.2, 1)';
          fill.style.width = saved.get(fill);
        });
        obs.unobserve(fill);
      }
    });
  }, { threshold: 0.25 });

  fills.forEach(fill => obs.observe(fill));
}


/* ================================================================
   SCROLL FADE-IN FOR SECTION CARDS
   ================================================================ */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.timeline-item, .service-item, .testimonials-item, .clients-item, .about-text, .skills-list'
  );

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  targets.forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(22px)';
    el.style.transition = `opacity 0.52s ease ${i * 0.04}s, transform 0.52s ease ${i * 0.04}s`;
    obs.observe(el);
  });
}


/* ================================================================
   NAV — SMOOTH SCROLL + ACTIVE HIGHLIGHT ON SCROLL
   ================================================================ */
function initNav() {
  const links    = document.querySelectorAll('.nav-bar a');
  const sections = document.querySelectorAll('section[id]');

  // Smooth scroll
  links.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActive(link);
        }
      }
    });
  });

  // Highlight on scroll — active when section enters the top 25% of the viewport
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const match = document.querySelector(`.nav-bar a[href="#${id}"]`);
        if (match) setActive(match);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -75% 0px' });

  sections.forEach(sec => obs.observe(sec));

  function setActive(activeLink) {
    links.forEach(l => l.classList.remove('active', 'nav-active'));
    activeLink.classList.add('active');
  }
}


/* ================================================================
   SIDEBAR TOGGLE
   ================================================================ */
const sidebar    = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');

if (sidebarBtn) {
  sidebarBtn.addEventListener('click', () => {
    if (sidebar) sidebar.classList.toggle('active');
  });
}


/* ================================================================
   ACHIEVEMENTS MODAL
   ================================================================ */
const testimonialsItem = document.querySelectorAll('[data-testimonials-item]');
const modalContainer   = document.querySelector('[data-modal-container]');
const modalCloseBtn    = document.querySelector('[data-modal-close-btn]');
const overlay          = document.querySelector('[data-overlay]');
const modalImg         = document.querySelector('[data-modal-img]');
const modalTitle       = document.querySelector('[data-modal-title]');
const modalText        = document.querySelector('[data-modal-text]');

const toggleModal = () => {
  if (modalContainer) modalContainer.classList.toggle('active');
  if (overlay)         overlay.classList.toggle('active');
};

testimonialsItem.forEach(item => {
  item.addEventListener('click', () => {
    const avatar = item.querySelector('[data-testimonials-avatar]');
    const title  = item.querySelector('[data-testimonials-title]');
    const text   = item.querySelector('[data-testimonials-text]');
    if (modalImg   && avatar) { modalImg.src = avatar.src; modalImg.alt = avatar.alt; }
    if (modalTitle && title)    modalTitle.innerHTML = title.innerHTML;
    if (modalText  && text)     modalText.innerHTML  = text.innerHTML;
    toggleModal();
  });
});

if (modalCloseBtn) modalCloseBtn.addEventListener('click', toggleModal);
if (overlay)       overlay.addEventListener('click', toggleModal);


/* ================================================================
   INIT ALL ON DOM READY
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Particle network background
  new ParticleNetwork();

  // Typing animation for sidebar title
  const typingEl = document.querySelector('[data-typing]');
  if (typingEl) {
    new TypeWriter(typingEl, [
      'Full Stack Developer',
      'Cloud Engineer',
      'AI Enthusiast',
      'Kubernetes Operator Dev'
    ]);
  }

  initSkillBars();
  initScrollReveal();
  initNav();
});
