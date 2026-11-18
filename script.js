/* ── TYPED HERO SUBTITLE ── */
const phrases = [
  'Aspiring Data Analyst',
  'Aspiring Data Scientist',
  'Aspiring ML Engineer',
  'Computer & Data Science student',
  'Turning data into insight',
  'Python · SQL · Statistics',
];

let phraseIndex = 0;
let charIndex   = 0;
let isDeleting  = false;
const typedEl   = document.querySelector('.typed-text');

function type() {
  if (!typedEl) return;

  const current = phrases[phraseIndex];

  if (!isDeleting) {
    typedEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      isDeleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }

  setTimeout(type, isDeleting ? 45 : 65);
}

type();


/* ── BACK TO TOP ── */
const backToTopBtn = document.getElementById('back-to-top');

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ── SCROLL INDICATOR — hide after scrolling past hero ── */
const scrollIndicator = document.querySelector('.scroll-indicator');
const heroSection     = document.getElementById('welcome');

if (scrollIndicator && heroSection) {
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        scrollIndicator.classList.add('hidden');
      } else {
        scrollIndicator.classList.remove('hidden');
      }
    },
    { threshold: 0.1 }
  );
  heroObserver.observe(heroSection);
}


const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ── NAV: sliding pill that follows the active link ── */
const navWrap = document.querySelector('.nav-links');
let navIndicator = null;

if (navWrap) {
  navIndicator = document.createElement('span');
  navIndicator.className = 'nav-indicator';
  navIndicator.setAttribute('aria-hidden', 'true');
  navWrap.prepend(navIndicator);
  navWrap.classList.add('has-indicator');
}

function moveNavIndicator() {
  if (!navIndicator) return;
  const active = navWrap.querySelector('.nav-link.active');

  if (!active) {
    navIndicator.style.opacity = '0';
    return;
  }

  navIndicator.style.opacity = '1';
  navIndicator.style.width = `${active.offsetWidth}px`;
  navIndicator.style.transform = `translateX(${active.offsetLeft}px)`;

  // on phones the nav scrolls sideways — keep the active link in view
  if (navWrap.scrollWidth > navWrap.clientWidth) {
    navWrap.scrollTo({
      left: active.offsetLeft - navWrap.clientWidth / 2 + active.offsetWidth / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }
}

window.addEventListener('resize', moveNavIndicator);


/* ── ACTIVE NAV LINK ON SCROLL ── */
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle(
            'active',
            link.dataset.section === entry.target.id
          );
        });
        moveNavIndicator();
      }
    });
  },
  {
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0,
  }
);

sections.forEach((section) => sectionObserver.observe(section));


/* ── COUNT-UP NUMBERS (stats + CGPA) ── */
function countUp(el) {
  const raw      = el.dataset.count;
  const target   = parseFloat(raw);
  const decimals = (raw.split('.')[1] || '').length;
  const duration = 1400;
  const start    = performance.now();

  function tick(now) {
    const t     = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


/* ── STAGGER: give each child an index for its delay ── */
document.querySelectorAll('[data-stagger]').forEach((group) => {
  [...group.children].forEach((child, i) => child.style.setProperty('--i', i));
});


/* ── CASCADE: tags pop in one by one, after their card/row appears ── */
document.querySelectorAll('[data-cascade]').forEach((list) => {
  const item = list.closest('[data-stagger] > *');
  const base = item ? (parseInt(item.style.getPropertyValue('--i') || '0', 10) * 110 + 380) : 250;
  [...list.children].forEach((child, i) => {
    child.style.setProperty('--d', `${base + i * 45}ms`);
  });
});


/* ── DETAILS: smooth open + auto-open when scrolled into view ── */
const detailsEls = document.querySelectorAll('.timeline-details');

detailsEls.forEach((details) => {
  details.querySelectorAll('li').forEach((li, i) => li.style.setProperty('--i', i));

  details.addEventListener('toggle', () => {
    if (!details.open) return;
    const list = details.querySelector('ul');
    if (list) list.style.setProperty('--h', `${list.scrollHeight}px`);

    // restart the opening animation
    details.classList.remove('opening');
    void details.offsetWidth;
    details.classList.add('opening');
    clearTimeout(details._openTimer);
    details._openTimer = setTimeout(() => details.classList.remove('opening'), 1400);
  });
});

const detailsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const details = entry.target;
      detailsObserver.unobserve(details);   // only once: if closed later, it stays closed

      // wait for the card's own entrance before opening
      setTimeout(() => { details.open = true; }, reduceMotion ? 0 : 650);
    });
  },
  { rootMargin: '0px 0px -30% 0px', threshold: 0 }
);

detailsEls.forEach((details) => detailsObserver.observe(details));


/* ── SCROLL-TRIGGERED FADE-IN ── */
const fadeEls = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (!reduceMotion) {
          entry.target.querySelectorAll('[data-count]').forEach(countUp);
        }
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

fadeEls.forEach((el) => fadeObserver.observe(el));


/* ── SMOOTH SCROLL for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
