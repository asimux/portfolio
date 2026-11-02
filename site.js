(function () {
  const nav = document.querySelector('nav.top');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));
})();

(function () {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); v.pause(); v.controls = true; });
})();

(function () {
  const hero = document.querySelector('.hx');
  const pop = document.getElementById('hx-pop');
  if (!hero || !pop) return;
  const img = pop.querySelector('img');
  const field = name => pop.querySelector(`[data-pop="${name}"]`);
  const cards = [...hero.querySelectorAll('.hx-card')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;
  let active = null, openTimer = null, closeTimer = null, anim = null;

  // FLIP: start the pop-up over the tray thumbnail, then fly it to the centre
  function offsetFrom(card) {
    const from = card.querySelector('.hx-media').getBoundingClientRect();
    const to = pop.getBoundingClientRect();
    return { dx: from.left - to.left, dy: from.top - to.top, s: from.width / to.width };
  }

  function open(card) {
    clearTimeout(closeTimer);
    if (active === card) return;
    if (active) active.classList.remove('is-active');
    active = card;
    card.classList.add('is-active');
    const thumb = card.querySelector('img');
    img.src = thumb.src;
    img.alt = thumb.alt;
    field('co').textContent = card.dataset.co;
    field('metric').textContent = card.dataset.metric;
    field('title').textContent = card.dataset.title;
    pop.href = card.getAttribute('href');
    pop.setAttribute('aria-hidden', 'false');
    pop.classList.remove('is-open'); void pop.offsetWidth; pop.classList.add('is-open');
    hero.classList.add('is-previewing');
    if (anim) anim.cancel();
    if (reduce) return;
    const { dx, dy, s } = offsetFrom(card);
    anim = pop.animate([
      { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0.4 },
      { transform: `translate(-50%, -50%) translate(${dx * 0.04}px, ${dy * 0.04 - 4}px) scale(1.006)`, opacity: 1, offset: 0.7 },
      { transform: 'translate(-50%, -50%)', opacity: 1 }
    ], { duration: 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
  }

  function close() {
    if (!active) return;
    const card = active;
    active = null;
    card.classList.remove('is-active');
    hero.classList.remove('is-previewing');
    pop.setAttribute('aria-hidden', 'true');
    if (anim) anim.cancel();
    if (reduce) { pop.classList.remove('is-open'); return; }
    const { dx, dy, s } = offsetFrom(card);
    anim = pop.animate([
      { transform: 'translate(-50%, -50%)', opacity: 1 },
      { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0 }
    ], { duration: 620, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
    anim.onfinish = () => { if (!active) pop.classList.remove('is-open'); };
  }

  const scheduleClose = () => { clearTimeout(openTimer); clearTimeout(closeTimer); closeTimer = setTimeout(close, 220); };

  cards.forEach(card => {
    if (canHover) {
      card.addEventListener('mouseenter', () => { clearTimeout(closeTimer); clearTimeout(openTimer); openTimer = setTimeout(() => open(card), active ? 60 : 160); });
      card.addEventListener('mouseleave', scheduleClose);
    } else {
      // touch: first tap previews, tapping the pop-up opens the case study
      card.addEventListener('click', e => { if (active !== card) { e.preventDefault(); open(card); } });
    }
    card.addEventListener('focus', () => open(card));
    card.addEventListener('blur', scheduleClose);
  });
  pop.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  pop.addEventListener('mouseleave', scheduleClose);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  if (!canHover) document.addEventListener('click', e => { if (!e.target.closest('.hx-card, .hx-pop')) close(); });
})();
