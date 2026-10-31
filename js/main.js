(() => {
  const { gsap, ScrollTrigger, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = gsap.utils.clamp;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover)').matches;

  // ================= data =================
  const IMG = 'https://www.arshconstruction.in/images/projects/';
  // Real ARSH projects animated from the client's own renders.
  const featured = [
    { name: 'Heavenly Retreat', label: 'Residence', still: 'images/retreat-5_6.jpg', film: 'videos/retreat.mp4' },
    { name: 'Corporate Tower', label: 'Commercial', still: 'images/tower-8_4.jpg', film: 'videos/tower.mp4' },
    { name: 'Kaffeeklatsch', label: 'Café interior', still: 'images/cafe-3_4.jpg', film: 'videos/cafe.mp4' },
    { name: 'Signature Villa', label: 'Luxury villa', still: 'images/sunset-8_6.jpg', film: 'videos/villa.mp4' },
  ];
  const portfolio = [
    ['Kaigan Villa', 'Villa', 'arsh-1.jpg'], ['Ichiban Villa', 'Villa', 'arsh-2.jpg'], ['Akiro Mall', 'Retail', 'arsh-23.jpg'],
    ['Game Arena', 'Interior', 'game-arena/1.jpg'], ['MED PRO', 'Healthcare', 'arsh-18.jpg'], ['Signature Lounge', 'Hospitality', 'arsh-5.jpg'],
    ['Earthy Eatery', 'Restaurant', 'arsh-3.jpg'], ['Shivkumar Residence', 'Residence', 'arsh-6.jpg'], ["Dr. Gowtham's", 'Interior', 'arsh-7.jpg'],
    // Devki Medicals (arsh-9.jpg) is left out: the source is 9921×5961 and too heavy to decode in a moving strip
    ['Asta AVM', 'Commercial', 'arsh-8.jpg'], ['Farm House', 'Residence', 'arsh-11.jpg'],
    ['Anantha Lakshmi', 'Residence', 'arsh-4.jpg'], ['MAVMM School', 'Education', 'arsh-22.jpg'],
  ];

  // ================= smooth scroll =================
  const lenis = new Lenis({ lerp: .1, smoothWheel: !reduced });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    e.preventDefault();
    document.body.classList.remove('menu-open');
    lenis.start();
    lenis.scrollTo(id === '#top' || id === '#' ? 0 : id, { duration: 1.6 });
  }));

  // ================= split headings =================
  // Wraps every character in a span inside a per-word wrapper; keeps <em> and <br>.
  function splitChars(el) {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.append(' '); return; }
          const word = document.createElement('span');
          word.className = 'sw';
          [...w].forEach((ch) => { const c = document.createElement('span'); c.className = 'sc'; c.textContent = ch; word.append(c); });
          frag.append(word);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el);
    return $$('.sc', el);
  }
  $$('.reel__title').forEach(splitChars);
  if (!reduced) {
    $$('.split').forEach((el) => {
      const chars = splitChars(el);
      gsap.from(chars, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .014, scrollTrigger: { trigger: el, start: 'top 86%' } });
    });
  }

  // ================= intro: the blueprint draws, then a scan line turns it into the real film =================
  const heroVideo = $('.hero__film video');
  function runIntro() {
    const count = $('.intro__count b'), o = { v: 0 };
    const pad = () => (count.textContent = String(Math.round(o.v)).padStart(3, '0'));
    const ready = new Promise((r) => {
      if (heroVideo.readyState >= 3) return r();
      heroVideo.addEventListener('canplay', r, { once: true });
      setTimeout(r, 3200);
    });
    // greeting for the visitor's time of day; returning visitors are welcomed back
    const h = new Date().getHours();
    const part = h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 17 ? 'Good afternoon' : 'Good evening';
    let returning = false;
    try { returning = localStorage.getItem('arsh-visited') === '1'; localStorage.setItem('arsh-visited', '1'); } catch (e) { /* storage blocked: treat as first visit */ }
    $('.intro__time').textContent = part + '.';
    $('.intro__hello').innerHTML = (returning ? 'Welcome back to ' : 'Welcome to ') + '<em>ARSH Construction.</em>';
    $('.hero__greet').textContent = part;

    const draw = gsap.timeline()
      .to('.intro__time', { opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' }, 0)
      .fromTo('.intro__hello', { y: 16 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }, .45)
      .to('.intro .bp path', { strokeDashoffset: 0, duration: 1.1, stagger: .09, ease: 'power2.inOut' }, .7)
      .to('.intro .bp-text text', { opacity: 1, duration: .8, stagger: .1 }, 1.45)
      .to(o, { v: 100, duration: 2.6, ease: 'power1.inOut', onUpdate: pad }, .2)
      .add(() => $('.intro').classList.add('is-lit'));

    Promise.all([ready, draw.then()]).then(() => {
      heroVideo.currentTime = 0;
      heroVideo.play().catch(() => {});
      const scan = { x: 0 };
      gsap.timeline({ onComplete: () => gsap.set('.intro, .intro__scan', { display: 'none' }) })
        .set('.intro__scan', { opacity: 1 })
        .to(scan, {
          x: 100, duration: 1.7, ease: 'power3.inOut',
          onUpdate: () => {
            $('.intro').style.clipPath = 'inset(0 0 0 ' + scan.x + '%)';
            $('.intro__scan').style.transform = 'translateX(' + (scan.x / 100) * innerWidth + 'px)';
          },
        })
        .to('.intro__scan', { opacity: 0, duration: .3 }, '-=.25')
        .add(() => { document.body.classList.remove('is-loading'); lenis.start(); }, '-=.6')
        .fromTo('.hero__film', { scale: 1.08 }, { scale: 1, duration: 2.6, ease: 'expo.out' }, 0)
        .from('.hero__title .line > span', { yPercent: 110, duration: 1.4, stagger: .12, ease: 'expo.out' }, .9)
        .from('.hero__eyebrow, .hero__foot', { y: 30, opacity: 0, duration: 1.2, stagger: .12, ease: 'expo.out' }, 1.2);
    });
  }

  // film bar: chapters of the hero film, follows playback and seeks on click
  const fbButtons = $$('.filmbar__labels button'), fbFill = $('.filmbar__track i');
  fbButtons.forEach((btn) => btn.addEventListener('click', () => { heroVideo.currentTime = +btn.dataset.t; heroVideo.play().catch(() => {}); }));
  heroVideo.addEventListener('timeupdate', () => {
    const t = heroVideo.currentTime;
    fbFill.style.transform = 'scaleX(' + (heroVideo.duration ? t / heroVideo.duration : 0) + ')';
    fbButtons.forEach((btn, i) => btn.classList.toggle('is-on', t >= +btn.dataset.t && (i === fbButtons.length - 1 || t < +fbButtons[i + 1].dataset.t)));
  });

  gsap.to('.hero__film', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__body', { yPercent: -12, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '10% top', end: '75% top', scrub: true } });

  // play background films only while on screen
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting) v.play().catch(() => {}); else v.pause();
  }), { rootMargin: '100px' });
  [heroVideo, $('.contact__film video')].forEach((v) => io.observe(v));

  // ================= nav =================
  const nav = $('.nav');
  let lastY = 0;
  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('is-solid', scroll > 40);
    document.body.classList.toggle('past-hero', scroll > innerHeight * .7);
    const down = scroll > lastY + 2, up = scroll < lastY - 2;
    if (down && scroll > innerHeight * .8 && !document.body.classList.contains('menu-open')) nav.classList.add('is-hidden');
    if (up) nav.classList.remove('is-hidden');
    lastY = scroll;
  });
  $('.nav__burger').addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    open ? lenis.stop() : lenis.start();
  });

  // ================= about =================
  $$('.words').forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    const words = $$('.w', el);
    ScrollTrigger.create({
      trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true,
      onUpdate: (s) => words.forEach((w, i) => (w.style.opacity = i / words.length < s.progress ? 1 : .18)),
    });
  });
  ScrollTrigger.batch('.pillar, .stat, .person, .award, .gallery__head', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: 1.1, stagger: .08, ease: 'expo.out' }),
  });

  // ================= story: scroll-scrubbed construction time-lapse =================
  // 180 native-resolution frames of one Madurai house, ground to dusk (watermark painted out at export).
  const N = 180;
  const FRAMES = Array.from({ length: N }, (_, i) => 'images/seq/a_' + String(i).padStart(3, '0') + '.webp');
  // scroll progress → frame, paced so each chapter holds on its stage of the build
  const KEYS = [[0, 0], [.24, 58], [.5, 118], [.76, 152], [1, N - 1]];
  const STAGES = [[0, 'Setting out'], [27, 'Excavation'], [58, 'Foundations'], [90, 'Structure'], [135, 'Envelope'], [158, 'Handover']];
  const STEP_AT = [0, .27, .55, .8];

  const canvas = $('.story__seq'), ctx = canvas.getContext('2d');
  const imgs = new Array(N);
  let target = 0, shown = 0, drawn = -1, loadingStarted = false;
  const load = (i) => new Promise((res) => {
    if (imgs[i] || i >= N) return res();
    const im = new Image();
    im.src = FRAMES[i];
    im.decode().then(() => { imgs[i] = im; res(); }).catch(res);
  });
  async function startSequenceLoading() {
    if (loadingStarted) return;
    loadingStarted = true;
    const order = [...Array(N).keys()];
    await Promise.all(order.filter((i) => i % 10 === 0 || i === N - 1).map(load)); // coarse pass: scrubbing works at once
    drawn = -1;
    for (let i = 0; i < N; i += 6) await Promise.all(order.slice(i, i + 6).map(load));
  }
  setTimeout(startSequenceLoading, 1500); // starts while the intro plays; the hero film gets a head start

  const nearest = (i) => { for (let d = 0; d < N; d++) { if (imgs[i - d]) return imgs[i - d]; if (imgs[i + d]) return imgs[i + d]; } return null; };
  function fit() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    ctx.imageSmoothingQuality = 'high';
    drawn = -1;
  }
  // draws whole frames only: no cross-blending, so moving machinery stays crisp
  function render() {
    shown += (target - shown) * .25;
    const i = Math.round(shown);
    if (i === drawn) return;
    const img = nearest(i);
    if (!img) return;
    drawn = imgs[i] ? i : -1; // keep redrawing until the exact frame has arrived
    const cw = canvas.width, ch = canvas.height, sc = Math.max(cw / img.width, ch / img.height);
    const w = img.width * sc, h = img.height * sc, fx = cw < ch ? .6 : .5;
    ctx.drawImage(img, (cw - w) * fx, (ch - h) / 2, w, h);
  }
  addEventListener('resize', fit);
  fit();
  gsap.ticker.add(render);

  const hudDay = $('.hud__day b'), hudStage = $('.hud__stage');
  const chapters = $$('.chapter'), steps = $$('.story__steps span');
  const mobile = () => innerWidth <= 820;
  ScrollTrigger.create({
    trigger: '.story', start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: ({ progress: p }) => {
      let g = 0;
      for (let k = 1; k < KEYS.length; k++) {
        const [p0, f0] = KEYS[k - 1], [p1, f1] = KEYS[k];
        if (p <= p1) { g = f0 + (f1 - f0) * clamp(0, 1, (p - p0) / (p1 - p0)); break; }
        g = f1;
      }
      target = g;
      hudDay.textContent = String(Math.round(1 + (g / (N - 1)) * 419)).padStart(3, '0');
      hudStage.textContent = STAGES.filter(([st]) => g >= st).pop()[1];
      gsap.set('.story__progress i', { scaleX: p });
      steps.forEach((st, i) => st.classList.toggle('is-on', p >= STEP_AT[i]));
      chapters.forEach((ch) => {
        const a0 = +ch.dataset.from, b0 = +ch.dataset.to, fade = .03;
        const o = clamp(0, 1, Math.min((p - a0) / fade + (a0 === 0 ? 1 : 0), (b0 - p) / fade));
        const y = (1 - o) * (p < (a0 + b0) / 2 ? 30 : -30);
        ch.style.opacity = o;
        ch.style.transform = mobile() ? 'translateY(' + y + 'px)' : 'translateY(calc(-50% + ' + y + 'px))';
      });
    },
  });
  // depth: chapter copy drifts gently against the pointer
  if (canHover) $('.story').addEventListener('pointermove', (e) => {
    $('.chapters').style.transform = 'translate3d(' + (e.clientX / innerWidth - .5) * -14 + 'px, ' + (e.clientY / innerHeight - .5) * -10 + 'px, 0)';
  });

  // ================= numbers =================
  $$('[data-count]').forEach((el) => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.count, duration: 2.2, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)), scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // ================= services: horizontal =================
  const track = $('.services__track');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '.services', pin: '.services__pin', start: 'top top', end: () => '+=' + dist(), scrub: .8, invalidateOnRefresh: true },
  });

  // ================= reel =================
  const scenes = $$('.reel__scene'), bars = $$('.reel__bars i'), now = $('.reel__now');
  let active = -1, reelVisible = false;
  const setScene = (i) => {
    if (i === active) return;
    active = i;
    now.textContent = String(i + 1).padStart(2, '0');
    scenes.forEach((s, k) => {
      s.classList.toggle('is-on', k === i);
      const v = $('video', s);
      if (k === i && reelVisible) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
      if (k === i + 1) v.preload = 'auto'; // warm up the next film
    });
  };
  ScrollTrigger.create({
    trigger: '.reel', start: 'top top', end: 'bottom bottom', scrub: true,
    onToggle: (s) => { reelVisible = s.isActive; const v = $('video', scenes[Math.max(0, active)]); s.isActive ? v.play().catch(() => {}) : scenes.forEach((x) => $('video', x).pause()); },
    onUpdate: ({ progress }) => {
      const pos = progress * scenes.length;
      scenes.forEach((s, k) => {
        const wipe = k === 0 ? 1 : clamp(0, 1, (pos - k + .3) / .3);
        s.style.clipPath = `inset(${(1 - wipe) * 100}% 0 0 0)`;
        bars[k].style.setProperty('--fill', clamp(0, 1, pos - k));
      });
      setScene(Math.min(scenes.length - 1, Math.floor(pos + .15)));
    },
  });

  // ================= featured projects =================
  $('#featured').innerHTML = featured.map((p, i) => `
    <article class="proj" data-i="${i}">
      <div class="proj__media">
        <img src="${p.still}" alt="${p.name}" loading="lazy">
        <video muted loop playsinline preload="none" data-src="${p.film}"></video>
        <span class="proj__badge">Film</span>
      </div>
      <div class="proj__meta"><h3>${p.name}</h3><span>${p.label}</span></div>
    </article>`).join('');
  $$('.proj').forEach((card) => {
    gsap.to($('.proj__media', card), { clipPath: 'inset(0% 0 0 0 round 8px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
    const v = $('video', card);
    card.addEventListener('pointerenter', () => { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); card.classList.add('is-playing'); });
    card.addEventListener('pointerleave', () => { v.pause(); card.classList.remove('is-playing'); });
  });
  const lb = $('.lightbox'), lbv = $('.lightbox video');
  $('#featured').addEventListener('click', (e) => {
    const card = e.target.closest('.proj');
    if (!card) return;
    const p = featured[+card.dataset.i];
    lbv.src = p.film; lbv.play().catch(() => {});
    $('h3', lb).textContent = p.name; $('p', lb).textContent = p.label;
    lb.classList.add('is-open'); lenis.stop();
  });
  const closeLb = () => { lb.classList.remove('is-open'); lbv.pause(); lenis.start(); };
  $('.lightbox__close').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => e.target === lb && closeLb());
  addEventListener('keydown', (e) => e.key === 'Escape' && closeLb());

  // ================= moving portfolio gallery =================
  // Two rows drift in opposite directions; they ease to a stop on hover, react to scroll speed and can be dragged.
  const card = ([name, type, img]) => `<figure class="gcard"><img src="${IMG + img}" alt="${name}" loading="lazy" draggable="false"><figcaption class="gcard__cap"><b>${name}</b><span>${type}</span></figcaption></figure>`;
  const halves = [portfolio.slice(0, 7), portfolio.slice(7)];
  let boost = 0;
  lenis.on('scroll', (l) => (boost = Math.min(Math.abs(l.velocity) * .25, 8)));
  $$('.gallery__row').forEach((row, r) => {
    const tr = $('.gallery__track', row), dir = +row.dataset.dir;
    const html = halves[r].map(card).join('');
    tr.innerHTML = html + html + html;
    let x = dir > 0 ? -tr.scrollWidth / 3 : 0, speed = 1, want = 1, dragging = false, lastX = 0, onScreen = false;
    new IntersectionObserver(([en]) => (onScreen = en.isIntersecting)).observe(row);
    row.addEventListener('pointerenter', () => (want = 0));
    row.addEventListener('pointerleave', () => { want = 1; dragging = false; });
    row.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; row.setPointerCapture(e.pointerId); });
    row.addEventListener('pointermove', (e) => { if (!dragging) return; x += e.clientX - lastX; lastX = e.clientX; });
    row.addEventListener('pointerup', () => (dragging = false));
    gsap.ticker.add(() => {
      if (!onScreen) return;
      const third = tr.scrollWidth / 3;
      speed += (want - speed) * .06;
      if (!dragging) x += dir * (.5 * speed + boost * .5);
      if (x <= -third * 2) x += third;
      if (x >= 0) x -= third;
      tr.style.transform = `translate3d(${x}px,0,0)`;
    });
  });
  gsap.ticker.add(() => (boost *= .92));

  // ================= values marquee =================
  const mq = $('.marquee__inner');
  let mx = 0, mOn = false;
  new IntersectionObserver(([en]) => (mOn = en.isIntersecting)).observe(mq);
  gsap.ticker.add(() => {
    if (!mOn) return;
    mx -= .6 + boost;
    if (mx <= -mq.scrollWidth / 2) mx += mq.scrollWidth / 2;
    mq.style.transform = `translate3d(${mx}px,0,0)`;
  });

  // ================= voices =================
  const quotes = $$('.quote'), dots = $$('.quotes__dots button');
  let qi = 0, qt;
  const showQuote = (i) => {
    qi = i;
    quotes.forEach((q, k) => q.classList.toggle('is-on', k === i));
    dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    clearTimeout(qt);
    qt = setTimeout(() => showQuote((qi + 1) % quotes.length), 6500);
  };
  dots.forEach((d, i) => d.addEventListener('click', () => showQuote(i)));
  showQuote(0);
  gsap.fromTo('.voices__bg', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.voices', start: 'top bottom', end: 'bottom top', scrub: true } });

  // ================= awards, contact, footer =================
  $$('.award').forEach((a, i) => gsap.to(a, { '--line-x': 1, duration: 1.4, delay: i * .1, ease: 'expo.inOut', scrollTrigger: { trigger: a, start: 'top 90%', once: true } }));
  gsap.from('.form', { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.contact', start: 'top 70%', once: true } });
  $('#enquiry').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    const t = [`Hello ARSH Construction,`, '', `Name: ${d.get('name')}`, `Phone: ${d.get('phone')}`, `Project: ${d.get('type')}`, d.get('msg') || ''].join('\n');
    open(`https://wa.me/919600300599?text=${encodeURIComponent(t)}`, '_blank', 'noopener');
  });
  gsap.fromTo('.footer__big', { '--fill': '0%' }, { '--fill': '100%', ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: true } });

  // ================= cursor =================
  if (canHover) {
    const cur = $('.cursor');
    const xTo = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3' }), yTo = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3' });
    let px = -100, py = -100;
    const state = (el) => {
      const view = !!el?.closest('.proj');
      cur.classList.toggle('is-view', view);
      cur.classList.toggle('is-link', !view && !!el?.closest('a, button, .gcard, select, input, textarea'));
    };
    addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; xTo(px); yTo(py); state(e.target); });
    // content moves under a still pointer while scrolling, so re-check what is under it
    lenis.on('scroll', () => state(document.elementFromPoint(px, py)));
    document.addEventListener('mouseleave', () => (cur.style.opacity = 0));
    document.addEventListener('mouseenter', () => (cur.style.opacity = 1));
  }

  // ================= watermark patch =================
  // The AI films carry a small mark near the bottom-right corner. Instead of zooming the film to crop it
  // (which softens every frame), a soft blur patch is pinned over the mark at native framing.
  const WM = { x: .912, y: .838, w: .075, h: .12 }; // centre and size as fractions of the video frame
  function placePatch(v) {
    const host = v.parentElement;
    let p = v._patch;
    if (!p) { p = document.createElement('span'); p.className = 'wm-patch'; v.after(p); v._patch = p; }
    const cw = v.clientWidth, ch = v.clientHeight, vw = v.videoWidth || 1280, vh = v.videoHeight || 720;
    const sc = Math.max(cw / vw, ch / vh), dw = vw * sc, dh = vh * sc;
    const ox = v.offsetLeft + (cw - dw) / 2, oy = v.offsetTop + (ch - dh) / 2;
    Object.assign(p.style, {
      width: WM.w * dw + 'px', height: WM.h * dh + 'px',
      left: ox + WM.x * dw - (WM.w * dw) / 2 + 'px', top: oy + WM.y * dh - (WM.h * dh) / 2 + 'px',
    });
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  }
  const films = () => $$('video.wm, .proj__media video');
  films().forEach((v) => { placePatch(v); v.addEventListener('loadedmetadata', () => placePatch(v)); });
  addEventListener('resize', () => films().forEach(placePatch));

  // ================= featured: 3D tilt =================
  if (canHover && !reduced) $$('.proj__media').forEach((m) => {
    const rx = gsap.quickTo(m, 'rotationX', { duration: .7, ease: 'power3' }), ry = gsap.quickTo(m, 'rotationY', { duration: .7, ease: 'power3' });
    gsap.set(m, { transformPerspective: 1000 });
    m.addEventListener('pointermove', (ev) => {
      const r = m.getBoundingClientRect();
      rx((.5 - (ev.clientY - r.top) / r.height) * 6);
      ry(((ev.clientX - r.left) / r.width - .5) * 8);
    });
    m.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
  runIntro();
})();
