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

  // 起点散在视野两侧，每支光标负责一个现有的首页元素。
  const scene = [
    { selector: '#nav', from: [.18, .31], delay: 0, side: 1 },
    { selector: '.hero h1', from: [.13, .54], delay: 105, side: 1, text: true, reveal: true },
    { selector: '.hero .sub', from: [.84, .21], delay: 155, side: -1, text: true, reveal: true },
    { selector: '.hero .desc', from: [.89, .46], delay: 215, side: -1, text: true, reveal: true },
    { selector: '.hero-cta .btn-primary', from: [.23, .77], delay: 285, side: 1 },
    { selector: '.hero-cta .btn-ghost', from: [.80, .77], delay: 340, side: -1 },
    { selector: '.hero-tags', from: [.58, .91], delay: 400, side: -1, text: true }
  ];
  const travelTime = 530;
  const traceTime = 360;
  const exitTime = 270;
  const duration = 1800;
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => 1 - (1 - value) ** 3;

  const workers = scene.flatMap(task => {
    const element = document.querySelector(task.selector);
    const rect = element.getBoundingClientRect();
    if (rect.bottom > height - 10 || rect.top < 8) return [];

    let contentWidth = rect.width;
    if (task.text) {
      const folded = element.querySelectorAll('.fold-text-piece');
      if (folded.length) {
        contentWidth = Array.from(folded).reduce((total, char) => total + char.offsetWidth, 0);
      } else {
        const text = document.createRange();
        text.selectNodeContents(element);
        contentWidth = text.getBoundingClientRect().width;
      }
    }
    const gap = task.selector === '.hero h1' ? 14 : 8;
    const margin = (rect.width - contentWidth) / 2;
    const boxWidth = contentWidth + gap * 2;
    const boxHeight = rect.height + gap * 2;
    const boxLeft = rect.left + margin - gap;
    const boxTop = rect.top - gap;
    const cornerX = task.side === 1 ? boxLeft : boxLeft + boxWidth;
    const cornerY = task.side === 1 ? boxTop : boxTop + boxHeight;
    const edge = Math.min(18, boxWidth * .19, boxHeight * .33);

    return [{
      ...task, element, rect, margin, cornerX, cornerY, boxWidth, boxHeight, edge,
      startX: task.from[0] * width,
      startY: task.from[1] * height
    }];
  });

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
    if (!worker.reveal) continue;
    const { element, rect, margin, side, delay } = worker;
    const edge = Math.max(0, margin - 18);
    const closed = side === 1
      ? `inset(-20px ${rect.width - edge}px -20px -20px)`
      : `inset(-20px -20px -20px ${rect.width - edge}px)`;
    revealAnimations.push(element.animate(
      [{ clipPath: closed }, { clipPath: 'inset(-20px)' }],
      { delay: delay + travelTime - 85, duration: 390, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
    ));
  }

  function draw(elapsed) {
    ctx.clearRect(0, 0, width, height);
    for (const worker of workers) {
      const time = elapsed - worker.delay;
      if (time < 0) continue;

      const { side, cornerX, cornerY, boxWidth, boxHeight, edge, startX, startY } = worker;
      const travel = clamp(time / travelTime);
      const arrival = ease(travel);
      const trace = clamp((time - travelTime) / traceTime);
      const out = clamp((time - travelTime - traceTime - 180) / exitTime);
      const alpha = Math.min(time / 120, 1) * (1 - out);
      if (alpha <= 0) continue;

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
        const farEdge = edge * clamp(trace * 1.6 - .55);
        ctx.moveTo(farX, farY - side * farEdge);
        ctx.lineTo(farX, farY);
        ctx.lineTo(farX - side * farEdge, farY);
        ctx.stroke();
      }

      const x = startX + (cornerX - startX) * arrival + side * edge * trace - side * 24 * out;
      const y = startY + (cornerY - startY) * arrival + Math.sin(travel * Math.PI) * side * 35 + 18 * out;
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
