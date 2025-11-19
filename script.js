// Script for interactivity, typing effect, reveal on scroll, smooth nav toggle, active nav tracking, profile details, and contact form submission.

// ---------- Small helpers ----------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Mobile nav toggle ----------
const burger = document.querySelector('.burger');
const navList = document.querySelector('.nav-list');

if (burger) {
  burger.addEventListener('click', () => {
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!expanded));
    if (!expanded) {
      navList.style.display = 'flex';
    } else {
      navList.style.display = '';
    }
  });
  // close nav when clicking link (mobile)
  $$('.nav-list a').forEach(a => a.addEventListener('click', () => {
    if (window.innerWidth <= 740) {
      navList.style.display = '';
      burger.setAttribute('aria-expanded', 'false');
    }
  }));
}

// ---------- Typing effect ----------
(function typingEffect(){
  const el = document.getElementById('typed');
  if (!el) return;
  const phrases = [
    "ILHAM MAULANA",
    "Mahasiswa Sistem Informasi • Universitas Komputama (2024)"
  ];
  let pIndex = 0, charIndex = 0, isDeleting = false;

  function tick(){
    const current = phrases[pIndex];
    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }
    el.textContent = current.slice(0, charIndex);

    let delay = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === current.length) {
      delay = 1200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      pIndex = (pIndex + 1) % phrases.length;
      delay = 300;
    }

    setTimeout(tick, delay);
  }
  tick();
})();

// ---------- Intersection Observer for reveal and animated progress bars ----------
(function setupRevealAndProgress(){
  const reveals = $$('.reveal');
  const options = {
    root: null,
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.05
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');

        // If contains progress bars, animate them
        const bars = entry.target.querySelectorAll('.progress-bar');
        bars.forEach(bar => {
          const target = parseInt(bar.getAttribute('data-target') || '0', 10);
          // animate width with a slight stagger
          setTimeout(() => {
            bar.style.width = target + '%';
          }, 120);
        });

        // For standalone skill items (not nested), if the element has data-percent
        if (entry.target.classList.contains('skill')) {
          const target = entry.target.getAttribute('data-percent');
          const bar = entry.target.querySelector('.progress-bar');
          if (bar && target) {
            setTimeout(() => bar.style.width = target + '%', 120);
          }
        }

        obs.unobserve(entry.target);
      }
    });
  }, options);

  reveals.forEach(r => io.observe(r));
})();

// ---------- Smooth scroll enhancement ----------
(function smoothScrollLinks(){
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
        history.pushState(null, '', href);
      }
    });
  });
})();

// ---------- Active nav tracking (highlight current section) ----------
(function trackActiveNav(){
  const sections = ['#home','#about','#skills','#experience','#projects','#contact']
    .map(id => document.querySelector(id))
    .filter(Boolean);
  const navLinks = $$('.nav-list a');

  if (!sections.length) return;

  const opts = { root: null, threshold: 0.45 };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          const href = a.getAttribute('href').replace('#','');
          if (href === id) a.classList.add('active');
          else a.classList.remove('active');
        });
      }
    });
  }, opts);

  sections.forEach(s => obs.observe(s));
})();

// ---------- Profile details: calculate age from data-dob and format DOB ----------
(function profileDetails(){
  const container = document.getElementById('profileDetails');
  if (!container) return;

  const dobAttr = container.getAttribute('data-dob'); // expected YYYY-MM-DD
  if (!dobAttr) return;

  function calculateAge(dob) {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  function formatDateLocal(dob) {
    const dt = new Date(dob);
    if (isNaN(dt)) return dob;
    // format: 15 April 2003 (Indonesian)
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
  }

  const ageEl = document.getElementById('age');
  const dobEl = document.getElementById('dob');

  if (ageEl) ageEl.textContent = calculateAge(dobAttr);
  if (dobEl) dobEl.textContent = formatDateLocal(dobAttr);
})();

// ---------- Contact form handling ----------
(function handleContactForm(){
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');

  if (!form) return;

  // Replace this URL with your Formspree endpoint or another form endpoint.
  // Example Formspree endpoint: https://formspree.io/f/yourFormID
  const endpoint = 'https://formspree.io/f/yourFormID'; // <-- REPLACE with real endpoint

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Mengirim...';
    const formData = new FormData(form);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      if (res.ok) {
        statusEl.textContent = 'Terima kasih — pesan Anda telah terkirim.';
        form.reset();
      } else {
        const data = await res.json();
        if (data && data.errors) {
          statusEl.textContent = data.errors.map(err => err.message).join(', ');
        } else {
          statusEl.textContent = 'Terjadi kesalahan saat mengirim. Silakan coba lagi.';
        }
      }
    } catch (err) {
      console.error(err);
      statusEl.textContent = 'Gagal mengirim. Periksa koneksi Anda atau konfigurasi endpoint.';
    }

    setTimeout(() => { statusEl.textContent = ''; }, 6000);
  });
})();

// ---------- Tiny accessibility improvement: focus outline for keyboard users ----------
(function keyboardOutlineToggle(){
  function handleFirstTab(e){
    if (e.key === 'Tab') {
      document.documentElement.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);
})();