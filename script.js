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


/* ── PHOTO LOADING STATE: shimmer until the image is ready ── */
const photoWrap = document.querySelector('.hero-image-wrap');
const photo     = photoWrap && photoWrap.querySelector('img');

if (photo) {
  const markLoaded = () => photoWrap.classList.add('is-loaded');
  if (photo.complete && photo.naturalWidth) markLoaded();
  else {
    photo.addEventListener('load', markLoaded, { once: true });
    photo.addEventListener('error', markLoaded, { once: true });   // never leave it shimmering
  }
}


/* ── EMAIL: also copy the address, and say so ── */
const copyStatus = document.querySelector('.copy-status');

document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;   // clipboard blocked: the mailto link still opens as normal
    }
    const label = btn.querySelector('.contact-btn-label');
    const original = label ? label.textContent : '';
    if (label) label.textContent = 'Copied ✓';
    btn.classList.add('is-copied');
    if (copyStatus) {
      copyStatus.textContent = `${text} copied to your clipboard`;
      copyStatus.classList.add('is-visible');
    }
    clearTimeout(btn._copyTimer);
    btn._copyTimer = setTimeout(() => {
      if (label) label.textContent = original;
      btn.classList.remove('is-copied');
      if (copyStatus) copyStatus.classList.remove('is-visible');
    }, 2200);
  });
});


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

let navClickLock = null;
document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach((l) => l.classList.toggle('active', l === link));
    moveNavIndicator();
    // ignore section changes while the smooth scroll passes other sections
    clearTimeout(navClickLock);
    navClickLock = setTimeout(() => { navClickLock = null; }, 900);
  });
});


/* ── ACTIVE NAV LINK ON SCROLL ── */
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !navClickLock) {
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


/* ── DETAILS: smooth open, auto-open in view, auto-close once scrolled past ── */
const detailsEls = document.querySelectorAll('.timeline-details');

detailsEls.forEach((details) => {
  details.querySelectorAll('li').forEach((li, i) => li.style.setProperty('--i', i));

  // once a visitor opens/closes a list themselves, stop managing it
  const summary = details.querySelector('summary');
  if (summary) {
    summary.addEventListener('click', () => {
      details.dataset.manual = 'true';
      clearTimeout(details._autoTimer);
    });
  }

  details.addEventListener('toggle', () => {
    updateTimelines();
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

// close a list without the page jumping: if it sits above the screen,
// shift the scroll position by exactly the height it loses
function autoClose(details) {
  if (!details.open) return;
  const above  = details.getBoundingClientRect().bottom < 0;
  const before = details.offsetHeight;
  details.open = false;
  if (above) {
    const lost = before - details.offsetHeight;
    window.scrollTo({ top: window.scrollY - lost, behavior: 'instant' });
  }
}

// opens when the list reaches the upper ~70% of the screen
const detailsOpenObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const details = entry.target;
      if (details.dataset.manual) return;

      clearTimeout(details._autoTimer);
      if (entry.isIntersecting && !details.open) {
        // first time: wait for the card's own entrance animation
        const wait = reduceMotion ? 0 : (details.dataset.seen ? 150 : 650);
        details.dataset.seen = 'true';
        details._autoTimer = setTimeout(() => { details.open = true; }, wait);
      }
    });
  },
  { rootMargin: '0px 0px -30% 0px', threshold: 0 }
);

// closes once the list has left the screen completely
const detailsCloseObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const details = entry.target;
      if (details.dataset.manual || entry.isIntersecting) return;
      clearTimeout(details._autoTimer);
      autoClose(details);
    });
  },
  { threshold: 0 }
);

detailsEls.forEach((details) => {
  detailsOpenObserver.observe(details);
  detailsCloseObserver.observe(details);
});


/* ── TIMELINE: a diamond travels down the line as you scroll ── */
const DOT_CENTER = 23;   // .timeline-dot top (16px) + half its size (7px)
const timelines = [...document.querySelectorAll('.timeline')].map((timeline) => {
  const fill = document.createElement('span');
  fill.className = 'timeline-fill';
  const runner = document.createElement('span');
  runner.className = 'timeline-runner';
  fill.setAttribute('aria-hidden', 'true');
  runner.setAttribute('aria-hidden', 'true');
  timeline.prepend(fill, runner);
  return { timeline, fill, runner, dots: [...timeline.querySelectorAll('.timeline-dot')] };
});

function updateTimelines() {
  const anchor = window.innerHeight * 0.5;   // the runner follows the middle of the screen

  timelines.forEach(({ timeline, fill, runner, dots }) => {
    const rect  = timeline.getBoundingClientRect();
    const start = DOT_CENTER;
    const end   = Math.max(start, timeline.offsetHeight - 8);
    const y     = Math.min(Math.max(anchor - rect.top, start), end);

    runner.style.transform = `translateY(${y - 7}px) rotate(45deg)`;
    fill.style.height = `${y - start}px`;

    dots.forEach((dot) => {
      const dotY = dot.parentElement.offsetTop + DOT_CENTER;
      dot.classList.toggle('passed', y >= dotY - 1);
    });
  });
}

let timelineTicking = false;
function requestTimelineUpdate() {
  if (timelineTicking) return;
  timelineTicking = true;
  requestAnimationFrame(() => {
    timelineTicking = false;
    updateTimelines();
  });
}

window.addEventListener('scroll', requestTimelineUpdate, { passive: true });
window.addEventListener('resize', requestTimelineUpdate);
updateTimelines();


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
