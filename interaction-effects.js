(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const makeCanvas = id => {
    const canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.className = 'interaction-fx';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    return canvas;
  };

  // 将 SpecularButton 的边缘着色器移植到一个共享画布，避免每个玻璃框各建一个 WebGL 上下文。
  const setupSpecular = () => {
    const selector = '.glass, .btn-ghost, .strip-arrow, .lb-nav, .lightbox .close';
    const canvas = makeCanvas('specularFx');
    let gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
    let program;
    let uniforms;
    let frame = 0;
    let lastTime = 0;
    let pointer = null;
    let touchTimer;
    let width = document.documentElement.clientWidth;
    let height = innerHeight;
    let dpr = Math.min(devicePixelRatio || 1, 1.5);
    const states = [...document.querySelectorAll(selector)].map(element => ({ element, angle: 2.4, brightness: 0, rim: null }));
    const visible = new Set();

    const fallback = () => {
      gl = null;
      canvas.hidden = true;
      states.forEach(state => {
        if (state.rim) return;
        state.rim = document.createElement('span');
        state.rim.className = 'specular-rim';
        state.rim.setAttribute('aria-hidden', 'true');
        state.element.appendChild(state.rim);
      });
    };

    if (gl) {
      try {
        const compile = (type, source) => {
          const shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
          return shader;
        };
        const vertex = compile(gl.VERTEX_SHADER, `#version 300 es
          in vec2 position;
          void main() { gl_Position = vec4(position, 0.0, 1.0); }
        `);
        const fragment = compile(gl.FRAGMENT_SHADER, `#version 300 es
          precision highp float;
          uniform vec2 uCenter;
          uniform vec2 uHalfSize;
          uniform float uRadius;
          uniform float uAngle;
          uniform float uPx;
          uniform float uIntensity;
          out vec4 fragColor;
          float sdRoundedRect(vec2 p, vec2 b, float r) {
            vec2 q = abs(p) - b + r;
            return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
          }
          float gaussianLine(float d, float sigma) {
            float x = d / (sigma + 1e-6);
            float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
            return exp(-k * x * x);
          }
          void main() {
            vec2 p = gl_FragCoord.xy - uCenter;
            float d = sdRoundedRect(p, uHalfSize, uRadius);
            vec2 light = vec2(cos(uAngle), sin(uAngle));
            vec2 normal = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
            float phi = acos(clamp(abs(dot(normal, light)), 0.0, 1.0));
            float rim = 1.0 - smoothstep(radians(10.0 - 40.0), radians(10.0 + 40.0) + 1e-4, phi);
            float base = (1.0 - smoothstep(0.0, uPx, abs(d))) * 0.45;
            float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
            float shine = gaussianLine(d, uPx) * rim * edgeClamp * uIntensity;
            fragColor = vec4(vec3(82.0 / 255.0) * base + vec3(1.0) * shine, clamp(base + shine, 0.0, 1.0));
          }
        `);
        program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        gl.useProgram(program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        uniforms = Object.fromEntries(['uCenter', 'uHalfSize', 'uRadius', 'uAngle', 'uPx', 'uIntensity'].map(name => [name, gl.getUniformLocation(program, name)]));
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
      } catch (error) {
        console.warn('玻璃高光使用 CSS 兼容效果：', error.message);
        fallback();
      }
    } else fallback();

    const requestPaint = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
    };
    const resize = () => {
      width = document.documentElement.clientWidth;
      height = innerHeight;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
      requestPaint();
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const state = states.find(item => item.element === entry.target);
        if (entry.isIntersecting) visible.add(state);
        else {
          visible.delete(state);
          state.brightness = 0;
          if (state.rim) state.rim.style.opacity = '0';
        }
      });
      requestPaint();
    }, { rootMargin: '20px' });
    states.forEach(state => observer.observe(state.element));

    const paint = now => {
      frame = 0;
      const dt = Math.min(lastTime ? (now - lastTime) / 1000 : 1 / 60, .05);
      lastTime = now;
      let settling = false;
      if (gl) {
        gl.disable(gl.SCISSOR_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.SCISSOR_TEST);
      }
      const lightbox = document.querySelector('.lightbox.open');
      const gallery = document.querySelector('.gallery-dialog.is-open');
      const activeOverlay = lightbox || gallery;
      visible.forEach(state => {
        const element = state.element;
        const rect = element.getBoundingClientRect();
        const hidden = !rect.width || !rect.height || element.closest('.reveal:not(.in), .blur-reveal:not(.in)') || (activeOverlay && !activeOverlay.contains(element)) || (element.closest('.lightbox') && !lightbox) || (element.closest('.gallery-dialog') && !gallery);
        let targetBrightness = 0;
        let targetAngle = state.angle;
        if (!hidden && pointer) {
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const distance = Math.hypot(Math.max(rect.left - pointer.x, 0, pointer.x - rect.right), Math.max(rect.top - pointer.y, 0, pointer.y - rect.bottom));
          const proximity = Math.max(0, 1 - distance / 250);
          targetBrightness = proximity * proximity * (3 - 2 * proximity);
          targetAngle = distance === 0
            ? Math.atan2(2 / rect.height, -2 / rect.width) + ((pointer.x - cx) / (rect.width / 2)) * .3 + ((cy - pointer.y) / (rect.height / 2)) * .15
            : Math.atan2(cy - pointer.y, pointer.x - cx);
        }
        if (!hidden && element.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) targetBrightness = Math.max(targetBrightness, .7);
        const difference = ((targetAngle - state.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        state.angle += difference * (reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 7));
        state.brightness += (targetBrightness - state.brightness) * (reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 8));
        if (Math.abs(difference) > .002 || Math.abs(targetBrightness - state.brightness) > .002) settling = true;
        if (state.rim) {
          state.rim.style.setProperty('--shine-angle', `${-state.angle * 180 / Math.PI}deg`);
          state.rim.style.opacity = hidden ? '0' : String(state.brightness);
          return;
        }
        if (!gl || hidden || state.brightness < .003) return;
        const left = Math.max(0, Math.floor((rect.left - 20) * dpr));
        const bottom = Math.max(0, Math.floor((height - rect.bottom - 20) * dpr));
        const right = Math.min(canvas.width, Math.ceil((rect.right + 20) * dpr));
        const top = Math.min(canvas.height, Math.ceil((height - rect.top + 20) * dpr));
        if (right <= left || top <= bottom) return;
        gl.scissor(left, bottom, right - left, top - bottom);
        gl.uniform2f(uniforms.uCenter, (rect.left + rect.width / 2) * dpr, (height - rect.top - rect.height / 2) * dpr);
        gl.uniform2f(uniforms.uHalfSize, rect.width * dpr / 2, rect.height * dpr / 2);
        gl.uniform1f(uniforms.uRadius, Math.min(parseFloat(getComputedStyle(element).borderTopLeftRadius) || 18, rect.width / 2, rect.height / 2) * dpr);
        gl.uniform1f(uniforms.uAngle, state.angle);
        gl.uniform1f(uniforms.uPx, dpr);
        gl.uniform1f(uniforms.uIntensity, state.brightness);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      });
      if (settling) requestPaint();
      else lastTime = 0;
    };

    window.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      pointer = { x: event.clientX, y: event.clientY };
      requestPaint();
    }, { passive: true });
    document.addEventListener('pointerdown', event => {
      pointer = { x: event.clientX, y: event.clientY };
      requestPaint();
      if (event.pointerType === 'touch') {
        clearTimeout(touchTimer);
        touchTimer = setTimeout(() => { pointer = null; requestPaint(); }, 420);
      }
    }, { passive: true, capture: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer = null; requestPaint(); });
    document.addEventListener('focusin', requestPaint);
    document.addEventListener('focusout', requestPaint);
    document.addEventListener('click', requestPaint, true);
    window.addEventListener('site:overlay-change', requestPaint);
    window.addEventListener('scroll', requestPaint, { passive: true, capture: true });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
      else requestPaint();
    });
    canvas.addEventListener('webglcontextlost', () => { fallback(); requestPaint(); });
    reducedMotion.addEventListener('change', requestPaint);
    resize();
  };

  // 全站点击火花：沿用 8 条白色线段、10px 长度、15px 半径、400ms 的 ClickSpark 参数。
  const setupClickSpark = () => {
    const canvas = makeCanvas('clickSparkFx');
    const context = canvas.getContext('2d');
    if (!context) { canvas.remove(); return; }
    let frame = 0;
    let sparks = [];
    let width = document.documentElement.clientWidth;
    let height = innerHeight;
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      sparks = [];
      context.clearRect(0, 0, width, height);
    };
    const resize = () => {
      width = document.documentElement.clientWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      clear();
    };
    const draw = now => {
      frame = 0;
      context.clearRect(0, 0, width, height);
      context.strokeStyle = '#fff';
      context.lineWidth = 2;
      sparks = sparks.filter(spark => now - spark.start < 400);
      sparks.forEach(spark => {
        const progress = Math.max(0, (now - spark.start) / 400);
        const eased = progress * (2 - progress);
        const distance = eased * 15;
        const length = 10 * (1 - eased);
        context.beginPath();
        context.moveTo(spark.x + distance * Math.cos(spark.angle), spark.y + distance * Math.sin(spark.angle));
        context.lineTo(spark.x + (distance + length) * Math.cos(spark.angle), spark.y + (distance + length) * Math.sin(spark.angle));
        context.stroke();
      });
      if (sparks.length) frame = requestAnimationFrame(draw);
    };
    document.addEventListener('click', event => {
      if (reducedMotion.matches || document.hidden) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[disabled], [aria-disabled="true"]')) return;
      const rect = event.detail === 0 && target ? target.getBoundingClientRect() : null;
      const x = rect ? rect.left + rect.width / 2 : event.clientX;
      const y = rect ? rect.top + rect.height / 2 : event.clientY;
      const start = performance.now();
      sparks.push(...Array.from({ length: 8 }, (_, i) => ({ x, y, start, angle: 2 * Math.PI * i / 8 })));
      sparks = sparks.slice(-160);
      if (!frame) frame = requestAnimationFrame(draw);
    }, true);
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
    reducedMotion.addEventListener('change', clear);
    resize();
  };

  setupSpecular();
  setupClickSpark();
})();
