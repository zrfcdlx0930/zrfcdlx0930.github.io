(() => {
  'use strict';

  const preference = matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const tip = new Path2D('M0 0 7 24 11 16 16 23 20 20 15 13 23 11Z');
  const facet = new Path2D('M0 0 11 16 23 11Z');
  const easing = 'cubic-bezier(.22,1,.36,1)';
  const gold = '#dfc494';
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => 1 - (1 - value) ** 3;
  const mix = (a, b, progress) => a + (b - a) * progress;
  const jobs = [];
  const visible = new Set();
  const played = new Set();
  const seen = new WeakSet();
  const active = new Set();
  let mode, frame, width, height, silver;

  canvas.className = 'interaction-fx';
  canvas.setAttribute('aria-hidden', 'true');

  function mount(nextMode) {
    mode = nextMode;
    canvas.id = mode === 'intro' ? 'swarmIntro' : 'swarmScroll';
    document.body.append(canvas);
    ({ width, height } = canvas.getBoundingClientRect());
    const density = Math.min(devicePixelRatio || 1, mode === 'intro' ? 1.5 : 1);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    silver = ctx.createLinearGradient(0, 0, 21, 23);
    silver.addColorStop(0, '#f5fcff');
    silver.addColorStop(.48, '#c5d2db');
    silver.addColorStop(1, '#64717d');
  }

  function clearJob(job) {
    job.animations.forEach(animation => animation.cancel());
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    jobs.forEach(clearJob);
    jobs.length = 0;
    active.clear();
    canvas.remove();
    mode = null;
  }

  // 排版时按实际字块逐个落位，保留页面自身文字与无障碍名称。
  function schedule(element, kind, start, duration, reveal, owner) {
    const flight = kind === 'sweep' ? 100 : mode === 'scroll' ? 120 : kind === 'place' ? 170 : 235;
    const exit = kind === 'sweep' || mode === 'scroll' ? 130 : 190;
    const arrives = start + flight;
    const glyphs = kind === 'type' ? [...element.querySelectorAll('.fold-text-piece')] : [];
    const range = kind === 'type' && !glyphs.length ? document.createRange() : null;
    range?.selectNodeContents(element);
    const animations = [];
    const writing = reveal && glyphs.length > 0;
    const side = kind === 'place' || kind === 'develop' ? -1 : 1;
    const play = (node, keys, delay, length, timing = easing) => {
      animations.push(node.animate(keys, { delay, duration: length, easing: timing, fill: 'backwards' }));
    };
    const delay = arrives - performance.now();

    if (reveal) {
      // 已纳入搭建的内容由本次时间轴控制，避免原来的整块渐显叠加。
      const container = element.closest('.reveal, .blur-reveal');
      container?.classList.add('in', 'swarm-ready');
      if (writing) {
        element.classList.add('swarm-typeset');
        const interval = duration / glyphs.length;
        glyphs.forEach((glyph, index) => {
          play(glyph, [{ opacity: 0, translate: '0 .17em' }, { opacity: 1, translate: '0 0' }],
            delay + interval * index, Math.min(190, interval + 50));
        });
      } else if (kind === 'type') {
        play(element, [{ clipPath: 'inset(-12px 100% -12px -12px)' }, { clipPath: 'inset(-12px)' }],
          delay, duration, 'linear');
      } else if (kind === 'develop') {
        // 裁切的是现有照片，光标下移时才逐段露出画面。
        play(element, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0)' }],
          delay, duration, 'linear');
      } else if (kind === 'place') {
        play(element, [
          { opacity: 0, translate: '44px 22px' },
          { opacity: .85, translate: '44px 22px', offset: .12 },
          { opacity: 1, translate: '0 0' }
        ], delay, duration);
      } else {
        play(element, [{ opacity: 0 }, { opacity: 0, offset: .48 }, { opacity: 1 }],
          delay, duration, 'linear');
      }
    }
    jobs.push({ element, kind, start, flight, duration, exit, owner, animations, glyphs, range, side });
  }

  function cursor(x, y, side, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(side > 0 ? -.19 : .21);
    ctx.fillStyle = silver;
    ctx.strokeStyle = '#edf5fa';
    ctx.lineWidth = 1.1;
    ctx.lineJoin = 'round';
    ctx.fill(tip);
    ctx.stroke(tip);
    ctx.fillStyle = 'rgba(36,44,54,.72)';
    ctx.fill(facet);
    ctx.strokeStyle = gold;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(11, 16);
    ctx.stroke();
    ctx.restore();
  }

  function draw(job, elapsed) {
    const { element, kind, glyphs, range, flight, duration, exit, side } = job;
    const box = element.getBoundingClientRect();
    if (box.bottom < 0 || box.top > height) return;

    const approach = ease(clamp(elapsed / flight));
    const phase = clamp((elapsed - flight) / duration);
    const leave = clamp((elapsed - flight - duration) / exit);
    const alpha = clamp(elapsed / 85) * (1 - leave);

    if (kind === 'sweep') {
      // 回看只扫过上沿的一小段，内容保持原位。
      const y = Math.max(76, box.top - 6);
      const left = box.left - 6;
      const x = mix(left, Math.min(box.right, left + 112), ease(phase));
      ctx.globalAlpha = alpha * .36;
      ctx.strokeStyle = gold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.max(left, x - 32), y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      cursor(x - (1 - approach) * 28 + leave * 14, y + (1 - approach) * 12, 1, alpha * .66);
      return;
    }

    let x = box.left - 7;
    let y = box.top - 7;
    ctx.globalAlpha = alpha * .85;
    ctx.strokeStyle = gold;
    ctx.lineWidth = 1.15;
    ctx.beginPath();

    if (kind === 'type' && glyphs.length) {
      const glyph = glyphs[Math.min(glyphs.length - 1, Math.floor(phase * glyphs.length))];
      const letter = glyph.getBoundingClientRect();
      x = letter.right + 3;
      y = letter.bottom - 5;
      ctx.moveTo(x, letter.top + 5);
      ctx.lineTo(x, y);
    } else if (kind === 'type') {
      const text = range.getBoundingClientRect();
      x = mix(text.left, text.right, phase);
      y = text.bottom + 4;
      ctx.moveTo(text.left, y);
      ctx.lineTo(x, y);
    } else if (kind === 'develop') {
      x = box.right + 4;
      y = mix(box.top, box.bottom, phase);
      ctx.moveTo(box.left, y);
      ctx.lineTo(x, y);
      if (elapsed >= flight) cursor(box.left - 7, y, 1, alpha * .75);
    } else if (kind === 'rail') {
      x = box.left - 24;
      y = mix(box.top, box.bottom, phase);
      ctx.moveTo(x, box.top);
      ctx.lineTo(x, y);
    } else {
      x = kind === 'place' ? box.right + 5 : mix(box.left, box.right + 5, ease(phase));
      y = kind === 'place' ? box.top + 8 : mix(box.top, box.bottom + 5, ease(phase));
      if (elapsed >= flight) {
        // 拉框时对角由光标带动，搬运时选框跟着实际卡片移动。
        ctx.setLineDash(kind === 'place' && phase < .8 ? [5, 4] : []);
        ctx.rect(box.left - 5, box.top - 5, Math.max(1, x - box.left + 5),
          kind === 'place' ? box.height + 10 : Math.max(1, y - box.top + 5));
        ctx.fillStyle = 'rgba(223,196,148,.055)';
        ctx.fill();
        ctx.fillStyle = gold;
        ctx.fillRect(box.left - 7, box.top - 7, 4, 4);
      }
    }
    if (elapsed >= flight) ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    cursor(
      x - side * (1 - approach) * 130 + side * leave * 24,
      y + (1 - approach) * 46 - leave * 17, side, alpha
    );
  }

  function tick(now) {
    frame = 0;
    ctx.clearRect(0, 0, width, height);
    for (let index = jobs.length - 1; index >= 0; index--) {
      const job = jobs[index];
      const elapsed = now - job.start;
      if (elapsed >= job.flight + job.duration + job.exit) {
        if (mode === 'intro' && job.owner) {
          seen.add(job.owner);
          played.add(job.owner);
        }
        clearJob(job);
        jobs.splice(index, 1);
      } else if (elapsed >= 0) {
        draw(job, elapsed);
      }
    }
    if (mode === 'scroll') {
      for (const element of active) {
        if (!jobs.some(job => job.owner === element)) active.delete(element);
      }
    }
    if (!jobs.length) stop();
    startVisible();
    if (jobs.length && !frame) frame = requestAnimationFrame(tick);
  }

  // 首屏按拉出玻璃导航、排版、搬入口、展开相片的顺序搭建。
  function intro() {
    mount('intro');
    const start = performance.now();
    const plan = [
      ['#nav', 'frame', 0, 620],
      ['#nav .brand', 'place', 390, 420],
      ['.hero h1', 'type', 760, 1140],
      ['.hero .sub', 'type', 1830, 640],
      ['.hero .desc', 'type', 2330, 570],
      ['.hero-cta .btn-primary', 'place', 2680, 570],
      ['.hero-cta .btn-ghost', 'place', 3020, 550],
      ['.hero-tags', 'type', 3430, 510],
      ['.hero .strip-title', 'type', 3850, 630]
    ];
    plan.forEach(([selector, kind, offset, duration]) => {
      const node = document.querySelector(selector);
      if (node.getBoundingClientRect().top < height - 24) {
        schedule(node, kind, start + offset, duration, true, node.matches('.strip-title') ? node : null);
      }
    });
    document.querySelectorAll('#nav [data-nav]').forEach((node, index) => {
      schedule(node, 'place', start + 520 + index * 90, 340, true);
    });
    const portrait = document.getElementById('portraitAccordion');
    if (portrait.getBoundingClientRect().top < height - 24) {
      schedulePortrait(portrait, start + 4080, true, portrait);
    }
    frame = requestAnimationFrame(tick);
  }

  function schedulePortrait(element, start, reveal, owner) {
    schedule(element, 'frame', start - 170, 460, reveal, owner);
    element.querySelectorAll('.portrait-panel img').forEach((photo, index) => {
      schedule(photo, 'develop', start + index * 62, index === 0 ? 680 : 390, reveal, owner);
    });
  }

  function keepTextVisible(element) {
    if (element.matches('.fold-text')) element.classList.add('swarm-typeset');
    element.querySelectorAll('.fold-text').forEach(title => title.classList.add('swarm-typeset'));
  }

  function showImmediately(element) {
    element.closest('.reveal, .blur-reveal')?.classList.add('in', 'swarm-ready');
    keepTextVisible(element);
    seen.add(element);
    played.add(element);
    element.classList.remove('swarm-pending');
  }

  function startVisible() {
    if (!preference.matches || document.hidden || scrollY <= 24 || mode === 'intro' ||
        document.querySelector('.gallery-dialog.is-open, .lightbox.open')) return;

    const entering = [...visible].filter(element => !played.has(element));
    const revisiting = entering.filter(element => seen.has(element));
    const fresh = entering.filter(element => !seen.has(element));
    const pending = fresh.slice(0, 3 - active.size);
    // 超出同屏预算的内容立即可读，避免滑到新位置后还在等上一轮搭建。
    fresh.slice(pending.length).forEach(showImmediately);
    // 同一批回到视野的内容只搭配一次轻扫，避免光标排队追赶滚动。
    for (const element of revisiting) {
      played.add(element);
      keepTextVisible(element);
    }
    const replayTarget = !pending.length && !active.size ? revisiting[0] : null;
    if (!pending.length && !replayTarget) return;
    if (!mode) mount('scroll');
    const now = performance.now();
    if (replayTarget) {
      active.add(replayTarget);
      schedule(replayTarget, 'sweep', now, 210, false, replayTarget);
    }
    pending.forEach((element, index) => {
      const start = now + index * 45;
      const add = (node, kind, offset, duration) => schedule(node, kind, start + offset * .55, duration * .6, true, element);
      seen.add(element);
      played.add(element);
      active.add(element);

      if (element.id === 'portraitAccordion') {
        schedulePortrait(element, start, true, element);
      } else if (element.matches('.tl-item')) {
        add(element, 'rail', 0, 620);
        add(element.querySelector('h3'), 'type', 150, 570);
        add(element.querySelector('p'), 'type', 430, 440);
      } else if (element.matches('.skill-row')) {
        add(element, 'frame', 0, 410);
        add(element.querySelector('.ic'), 'place', 240, 350);
        add(element.querySelector('h3'), 'type', 350, 410);
        add(element.querySelector('p'), 'type', 540, 400);
      } else if (element.matches('.folder-row')) {
        add(element.querySelector('.folder-float'), 'place', 0, 620);
        add(element.querySelector('h3'), 'type', 270, 550);
        add(element.querySelector('.folder-description'), 'type', 480, 470);
      } else {
        const kind = element.matches('.sec-title, .sec-sub, h3, .contact .big, .contact .sub, .about-text') ? 'type' : 'place';
        add(element, kind, 0, 550);
      }
      // 所有子动作都处于就绪状态后才解除等待，原有渐显不会提前露出内容。
      element.classList.remove('swarm-pending');
    });
    if (!frame) frame = requestAnimationFrame(tick);
  }

  const targets = document.querySelectorAll([
    '.hero .strip-title', '#portraitAccordion', '.sec-title', '.sec-sub', '.about-text', '.fact',
    '.tl-item', '.honours h3', '.honour', '.skill-row', '.folder-row',
    '.contact .big', '.contact .sub', '.contact .btn-primary', '#mailCopy'
  ].join(','));
  if (preference.matches) {
    // 只暂藏尚未进屏的区块，刷新或直达时已看见的内容保持可见。
    const waiting = [...targets].filter(element => {
      const rect = element.getBoundingClientRect();
      if (rect.top >= innerHeight || rect.bottom <= 0) return true;
      seen.add(element);
      return false;
    });
    waiting.forEach(element => element.classList.add('swarm-pending'));
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const element = entry.target;
      if (entry.intersectionRatio >= .16) {
        visible.add(element);
      } else if (!entry.isIntersecting) {
        visible.delete(element);
        played.delete(element);
        active.delete(element);
        for (let index = jobs.length - 1; index >= 0; index--) {
          if (jobs[index].owner === element) clearJob(jobs.splice(index, 1)[0]);
        }
      }
    }
    startVisible();
  }, { threshold: [0, .16], rootMargin: '-70px 0px 0px' });
  targets.forEach(element => observer.observe(element));

  if (preference.matches && !document.hidden && !location.hash && scrollY <= 24) intro();
  window.addEventListener('scroll', () => {
    if (mode === 'intro' && scrollY > 24) stop();
    startVisible();
  }, { passive: true });
  for (const event of ['pointerdown', 'focusin']) {
    window.addEventListener(event, ({ target }) => {
      const waiting = target.closest('.swarm-pending');
      if (waiting) showImmediately(waiting);
      stop();
    });
  }
  for (const event of ['keydown', 'pagehide', 'site:overlay-change']) {
    window.addEventListener(event, stop);
  }
  window.addEventListener('resize', () => {
    stop();
    requestAnimationFrame(startVisible);
  });
  document.addEventListener('visibilitychange', stop);
  preference.addEventListener('change', () => {
    stop();
    document.querySelectorAll('.swarm-pending').forEach(showImmediately);
  });
})();
