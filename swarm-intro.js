(() => {
  'use strict';

  // 与首屏共用钛银光标，区块进入视野后继续接力。
  const preference = matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => 1 - (1 - value) ** 3;
  const tip = new Path2D('M0 0 L7 24 L11 16 L16 23 L20 20 L15 13 L23 11 Z');
  const face = new Path2D('M0 0 L11 16 L23 11 Z');
  setupScrollScenes();
  if (!preference.matches || document.hidden || location.hash || window.scrollY > 24) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.id = 'swarmIntro';
  canvas.className = 'interaction-fx';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);

  const { width, height } = canvas.getBoundingClientRect();
  const density = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * density);
  canvas.height = Math.round(height * density);
  ctx.scale(canvas.width / width, canvas.height / height);

  // 分批搭建导航、标题、简介和入口。开始时间包含飞行，搭建从光标落位时起算。
  const scene = [
    { selector: '#nav', from: [.18, .31], start: 0, build: 600, side: 1, kind: 'nav' },
    { selector: '.hero h1', from: [.13, .52], start: 850, build: 750, side: 1, kind: 'title' },
    { selector: '.hero .sub', from: [.84, .21], start: 1730, build: 600, side: 1, kind: 'text' },
    { selector: '.hero .desc', from: [.89, .46], start: 2290, build: 530, side: 1, kind: 'text' },
    { selector: '.hero-cta .btn-primary', from: [.23, .77], start: 2840, build: 500, side: 1, kind: 'button' },
    { selector: '.hero-cta .btn-ghost', from: [.80, .77], start: 3400, build: 480, side: -1, kind: 'button' },
    { selector: '.hero-tags', from: [.58, .91], start: 3870, build: 550, side: 1, kind: 'text' }
  ];
  const travelTime = 660;
  const exitTime = 470;

  const workers = scene.flatMap(task => {
    const element = document.querySelector(task.selector);
    const rect = element.getBoundingClientRect();
    if (rect.bottom > height - 10 || rect.top < 8) return [];

    const writesText = task.kind === 'title' || task.kind === 'text';
    let contentWidth = rect.width;
    if (writesText) {
      const folded = element.querySelectorAll('.fold-text-piece');
      if (folded.length) {
        contentWidth = Array.from(folded).reduce((total, char) => total + char.offsetWidth, 0);
      } else {
        const text = document.createRange();
        text.selectNodeContents(element);
        contentWidth = text.getBoundingClientRect().width;
      }
    }
    const gap = task.kind === 'title' ? 14 : 8;
    const margin = (rect.width - contentWidth) / 2;
    const boxWidth = contentWidth + gap * 2;
    const boxHeight = rect.height + gap * 2;
    const boxLeft = rect.left + margin - gap;
    const boxTop = rect.top - gap;
    const cornerX = task.side === 1 ? boxLeft : boxLeft + boxWidth;
    const cornerY = task.side === 1 ? boxTop : boxTop + boxHeight;
    const edge = Math.min(24, boxWidth * .19, boxHeight * .38);

    return [{
      ...task, element, rect, margin, cornerX, cornerY, boxWidth, boxHeight, edge, writesText,
      arrives: task.start + travelTime,
      startX: task.from[0] * width,
      startY: task.from[1] * height
    }];
  });
  const lastBuild = Math.max(0, ...workers.map(worker => worker.arrives + worker.build));
  const duration = lastBuild + exitTime;

  const silver = cursorGradient(ctx);

  let frame;
  const revealAnimations = [];
  const listeners = new AbortController();
  const signal = listeners.signal;

  function finish() {
    cancelAnimationFrame(frame);
    listeners.abort();
    revealAnimations.forEach(animation => animation.cancel());
    canvas.remove();
  }

  for (const worker of workers) {
    const { element, rect, margin, arrives, kind, build, writesText } = worker;
    const easing = 'cubic-bezier(.16,1,.3,1)';
    if (!writesText) {
      // 可点击元素只改透明度，动画途中仍能接收键盘和鼠标输入。
      revealAnimations.push(element.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { delay: arrives + 100, duration: 350, easing, fill: 'backwards' }
      ));
      if (kind === 'nav') {
        element.querySelectorAll('.brand, [data-nav]').forEach((item, index) => {
          revealAnimations.push(item.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { delay: arrives + 155 + index * 57, duration: 160, easing, fill: 'backwards' }
          ));
        });
      }
      continue;
    }

    const trim = Math.max(0, margin - 12);
    revealAnimations.push(element.animate(
      [
        { clipPath: `inset(-20px ${rect.width - trim}px -20px -20px)` },
        { clipPath: `inset(-20px ${trim}px -20px -20px)` }
      ],
      { delay: arrives, duration: build, easing: kind === 'title' ? 'steps(3, end)' : 'linear', fill: 'backwards' }
    ));
  }

  // 首屏露出的相册随最后一批光标接上，保持下方内容的原有滚动入场。
  const tags = workers.find(worker => worker.selector === '.hero-tags');
  if (tags) {
    const portraitTitle = document.querySelector('.hero .strip-title');
    if (portraitTitle.getBoundingClientRect().top < height) {
      for (const [index, element] of [portraitTitle, document.querySelector('#portraitAccordion')].entries()) {
        revealAnimations.push(element.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { delay: tags.arrives + index * 140, duration: 390, easing: 'ease-out', fill: 'backwards' }
        ));
      }
    }
  }

  function draw(elapsed) {
    ctx.clearRect(0, 0, width, height);
    const release = clamp((elapsed - lastBuild) / exitTime);

    for (const worker of workers) {
      const time = elapsed - worker.start;
      if (time < 0) continue;

      const { side, cornerX, cornerY, boxWidth, boxHeight, edge, startX, startY, build, writesText, arrives } = worker;
      const travel = clamp(time / travelTime);
      const arrival = ease(travel);
      const trace = clamp((elapsed - arrives) / build);
      const settled = clamp((elapsed - arrives - build) / 320);
      const alpha = Math.min(time / 150, 1) * (1 - .58 * settled) * (1 - release);
      if (alpha <= 0) continue;

      const distance = (writesText ? boxWidth : edge) * trace;
      if (trace > 0) {
        ctx.globalAlpha = alpha * .8;
        ctx.strokeStyle = '#dfc494';
        ctx.lineWidth = 1.15;
        // 从落点描出两只对角线取景框，描边完成后一起退场。
        ctx.beginPath();
        ctx.moveTo(cornerX, cornerY + side * edge * trace);
        ctx.lineTo(cornerX, cornerY);
        ctx.lineTo(cornerX + side * edge * trace, cornerY);
        const farX = cornerX + side * boxWidth;
        const farY = cornerY + side * boxHeight;
        const farEdge = edge * clamp(trace * 1.8 - .55);
        ctx.moveTo(farX, farY - side * farEdge);
        ctx.lineTo(farX, farY);
        ctx.lineTo(farX - side * farEdge, farY);
        ctx.stroke();

        // 文字上方的细导线随光标向前扫描，与实际露出的内容对齐。
        if (writesText && settled < 1) {
          ctx.globalAlpha *= .45 * (1 - settled);
          ctx.beginPath();
          ctx.moveTo(cornerX, cornerY);
          ctx.lineTo(cornerX + distance, cornerY);
          ctx.stroke();
        }
      }

      const x = startX + (cornerX - startX) * arrival + side * distance + side * 26 * release;
      const y = startY + (cornerY - startY) * arrival + Math.sin(travel * Math.PI) * side * 35 - 22 * release;
      drawCursor(ctx, silver, x, y, side, alpha);
      ctx.globalAlpha = 1;
    }
  }

  const started = performance.now();
  function tick(now) {
    if (now - started >= duration) {
      finish();
      return;
    }
    draw(now - started);
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);

  // 页面开始交互、滚动或切出时马上撤掉装饰层和所有遮罩。
  for (const event of ['pointerdown', 'keydown', 'focusin', 'resize', 'hashchange', 'pagehide', 'site:overlay-change']) {
    window.addEventListener(event, finish, { signal });
  }
  window.addEventListener('scroll', () => {
    if (window.scrollY > 24) finish();
  }, { signal, passive: true });
  document.addEventListener('visibilitychange', finish, { signal });
  preference.addEventListener('change', finish, { signal });

  function cursorGradient(context) {
    const gradient = context.createLinearGradient(0, 0, 21, 23);
    gradient.addColorStop(0, '#f5fcff');
    gradient.addColorStop(.48, '#c5d2db');
    gradient.addColorStop(1, '#64717d');
    return gradient;
  }

  function drawCursor(context, gradient, x, y, side, alpha) {
    context.save();
    context.globalAlpha = alpha;
    context.translate(x, y);
    context.rotate(side === 1 ? -.19 : .21);
    context.shadowColor = '#000a';
    context.shadowBlur = 9;
    context.shadowOffsetY = 3;
    context.fillStyle = gradient;
    context.fill(tip);
    context.shadowColor = 'transparent';
    context.strokeStyle = '#fff';
    context.lineWidth = 1.15;
    context.lineJoin = 'round';
    context.stroke(tip);
    context.fillStyle = 'rgba(36, 44, 54, .72)';
    context.fill(face);
    context.strokeStyle = '#e2c28a';
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(11, 16);
    context.stroke();
    context.restore();
  }

  function setupScrollScenes() {
    const targets = document.querySelectorAll([
      '.hero .strip-title', '#portraitAccordion', '.sec-title', '.sec-sub',
      '.about-text', '.fact', '.tl-item', '.honours h3', '.honour',
      '.skill-row', '.folder-row', '.contact .big', '.contact .sub',
      '.contact .btn-primary', '#mailCopy'
    ].join(','));
    const visible = new Set();
    const played = new Set();
    const firstAppearance = new WeakSet();
    const active = new Map();
    const flight = 390;
    const traceTime = 510;
    const fadeTime = 270;
    let layer, paint, gradient, frame = 0, width, height;

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      active.forEach(scene => scene.reveal?.cancel());
      active.clear();
      layer?.remove();
      layer = null;
      paint = null;
      gradient = null;
    }

    function startVisible() {
      if (!preference.matches || window.scrollY <= 24 || document.hidden ||
          document.querySelector('#swarmIntro, .gallery-dialog.is-open, .lightbox.open')) return;
      const pending = [...visible].filter(element => !played.has(element)).slice(0, 5 - active.size);
      if (!pending.length) return;

      // 同屏共用一层画布，全部完成便释放，浏览时不维持常驻绘制。
      if (!layer) {
        layer = document.createElement('canvas');
        layer.id = 'swarmScroll';
        layer.className = 'interaction-fx';
        layer.setAttribute('aria-hidden', 'true');
        document.body.append(layer);
        ({ width, height } = layer.getBoundingClientRect());
        const ratio = Math.min(devicePixelRatio || 1, 1.5);
        layer.width = Math.round(width * ratio);
        layer.height = Math.round(height * ratio);
        paint = layer.getContext('2d');
        paint.scale(layer.width / width, layer.height / height);
        gradient = cursorGradient(paint);
      }

      const now = performance.now();
      pending.forEach((element, index) => {
        const stagger = index * 105;
        const heading = element.matches('h2, h3, .contact .big, .sec-sub');
        const range = heading ? document.createRange() : null;
        range?.selectNodeContents(element);
        let reveal;
        if (!firstAppearance.has(element)) {
          firstAppearance.add(element);
          // 只在首次入场衔接原有渐显，返回已经读过的区块时文字保持清晰。
          reveal = element.animate([{ opacity: .32 }, { opacity: 1 }], {
            delay: stagger + flight - 90,
            duration: 380,
            easing: 'cubic-bezier(.16,1,.3,1)',
            fill: 'backwards'
          });
        }
        active.set(element, { starts: now + stagger, range, reveal });
        played.add(element);
      });
      if (!frame) frame = requestAnimationFrame(paintScenes);
    }

    function paintScenes(now) {
      frame = 0;
      paint.clearRect(0, 0, width, height);
      for (const [element, scene] of active) {
        const elapsed = now - scene.starts;
        if (elapsed < 0) continue;
        if (elapsed >= flight + traceTime + fadeTime) {
          active.delete(element);
          continue;
        }

        // 每帧用当前元素位置绘制，滚动或原有入场位移不会把光标留在原处。
        const box = scene.range ? scene.range.getBoundingClientRect() : element.getBoundingClientRect();
        const left = box.left - 9;
        const top = box.top - 8;
        const right = box.right + 9;
        const bottom = box.bottom + 8;
        const arriving = ease(clamp(elapsed / flight));
        const trace = clamp((elapsed - flight) / traceTime);
        const fade = clamp((elapsed - flight - traceTime) / fadeTime);
        const alpha = clamp(elapsed / 150) * (1 - fade);
        const edge = Math.min(28, (right - left) * .22, (bottom - top) * .35) * trace;
        const sweep = scene.range ? (right - left) * trace : edge;

        paint.globalAlpha = alpha * .72;
        paint.strokeStyle = '#dfc494';
        paint.lineWidth = 1.2;
        paint.beginPath();
        paint.moveTo(left, top + edge);
        paint.lineTo(left, top);
        paint.lineTo(left + sweep, top);
        paint.moveTo(right - edge, bottom);
        paint.lineTo(right, bottom);
        paint.lineTo(right, bottom - edge);
        paint.stroke();

        const drift = (1 - arriving) * 105;
        const lift = (1 - arriving) * 42;
        drawCursor(paint, gradient, left - drift + sweep + 20 * fade, top + lift - 14 * fade, 1, alpha);
        drawCursor(paint, gradient, right + drift - edge - 20 * fade, bottom - lift + 14 * fade, -1, alpha * .86);
      }
      startVisible();
      if (active.size && !frame) frame = requestAnimationFrame(paintScenes);
      if (!active.size) stop();
    }

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const element = entry.target;
        if (entry.isIntersecting) {
          if (entry.intersectionRatio >= .16) visible.add(element);
        } else {
          visible.delete(element);
          played.delete(element);
          active.get(element)?.reveal?.cancel();
          active.delete(element);
        }
      }
      startVisible();
    }, { threshold: [0, .16], rootMargin: '-70px 0px 0px' });

    targets.forEach(element => observer.observe(element));
    window.addEventListener('scroll', startVisible, { passive: true });
    for (const event of ['pointerdown', 'keydown', 'focusin', 'resize', 'pagehide', 'site:overlay-change']) {
      window.addEventListener(event, stop);
    }
    document.addEventListener('visibilitychange', stop);
    preference.addEventListener('change', stop);
  }
})();
