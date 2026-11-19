(() => {
  'use strict';

  // 参考多光标协作搭建的表现方式，用原生画布绘制首页开场。
  const preference = matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
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
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => 1 - (1 - value) ** 3;

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

  // 细长箭尖、银色折面和一笔暖金边缘呼应玻璃导航与摄影取景框。
  const tip = new Path2D('M0 0 L7 24 L11 16 L16 23 L20 20 L15 13 L23 11 Z');
  const face = new Path2D('M0 0 L11 16 L23 11 Z');
  const silver = ctx.createLinearGradient(0, 0, 21, 23);
  silver.addColorStop(0, '#f5fcff');
  silver.addColorStop(.48, '#c5d2db');
  silver.addColorStop(1, '#64717d');

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
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(side === 1 ? -.19 : .21);
      ctx.shadowColor = '#000a';
      ctx.shadowBlur = 9;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = silver;
      ctx.fill(tip);
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.15;
      ctx.lineJoin = 'round';
      ctx.stroke(tip);
      ctx.fillStyle = 'rgba(36, 44, 54, .72)';
      ctx.fill(face);
      ctx.strokeStyle = '#e2c28a';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(11, 16);
      ctx.stroke();
      ctx.restore();
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
})();
