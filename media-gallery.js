(() => {
  'use strict';
  const imageSizes = {"assets/album/t_032_1757585213957.jpg":[720,540],"assets/album/t_073_1781849016930.jpg":[540,720],"assets/edit-2.jpg":[846,460],"assets/album/t_107_1782309975413.jpg":[720,540],"assets/album/t_061_1781787154658.jpg":[540,720],"assets/album/t_058_1781787050840.jpg":[540,720],"assets/album/t_075_1781849063832.jpg":[540,720],"assets/video-end.jpg":[1600,695],"assets/album/t_037_1776512578381.jpg":[540,720],"assets/album/t_033_1766149897063.jpg":[540,720],"assets/album/t_112_202610040004.jpg":[720,540],"assets/album/t_106_1782309972078.jpg":[540,720],"assets/album/t_089_1782016480623.jpg":[540,720],"assets/album/t_097_1782135273606.jpg":[720,540],"assets/video-sports.jpg":[1600,721],"assets/album/t_086_1781934520849.jpg":[540,720],"assets/album/t_070_1781787505554.jpg":[720,405],"assets/edit-1.jpg":[1400,788],"assets/guitar-video-10-poster.jpg":[720,406],"assets/album/t_101_1782145162404.jpg":[720,540],"assets/album/t_017_1731924865036.jpg":[720,540],"assets/album/t_023_1744380205389.jpg":[540,720],"assets/album/t_001_1690538120289.jpg":[540,720],"assets/album/t_096_1782128115204.jpg":[405,720],"assets/album/t_054_1781689417424.jpg":[720,540],"assets/album/t_067_1781787472547.jpg":[720,540],"assets/album/t_103_1782297557136.jpg":[540,720],"assets/album/t_100_1782145160627.jpg":[720,540],"assets/album/t_109_202610040001.jpg":[540,720],"assets/cat-3.jpg":[1080,1080],"assets/album/t_064_1781787437832.jpg":[720,540],"assets/album/t_026_1746029057444.jpg":[720,405],"assets/album/t_052_1781689388951.jpg":[720,405],"assets/album/t_028_1749049538604.jpg":[720,576],"assets/album/t_094_1782121416344.jpg":[540,720],"assets/album/t_044_1781660539455.jpg":[720,540],"assets/album/t_010_1711271325989.jpg":[720,540],"assets/guitar-video-5-poster.jpg":[720,406],"assets/album/t_022_1738328437780.jpg":[720,481],"assets/album/t_091_1782016490317.jpg":[720,540],"assets/album/t_006_1696331385947.jpg":[480,720],"assets/album/t_110_202610040002.jpg":[540,720],"assets/v-catch.jpg":[1200,2096],"assets/guitar-video-6-poster.jpg":[720,406],"assets/album/t_048_1781676619816.jpg":[720,540],"assets/album/t_053_1781689393818.jpg":[720,540],"assets/video-hello.jpg":[1600,695],"assets/album/t_078_1781882221237.jpg":[540,720],"assets/album/t_093_1782031513055.jpg":[720,540],"assets/album/t_116_202610040008.jpg":[540,720],"assets/guitar-video-1-poster.jpg":[662,720],"assets/album/t_056_1781716572970.jpg":[720,480],"assets/album/t_063_1781787408524.jpg":[540,720],"assets/album/t_019_1735642970752.jpg":[510,720],"assets/album/t_046_1781675990045.jpg":[720,405],"assets/album/t_024_1744425845475.jpg":[540,720],"assets/album/t_099_1782145158549.jpg":[720,540],"assets/guitar-video-11-poster.jpg":[720,406],"assets/album/t_013_1727711029512.jpg":[720,405],"assets/album/t_113_202610040005.jpg":[540,720],"assets/album/t_095_1782128113112.jpg":[720,540],"assets/album/t_084_1781934483871.jpg":[720,540],"assets/album/t_059_1781787108972.jpg":[720,540],"assets/v-400days.jpg":[1200,652],"assets/after-rain-demo-poster.jpg":[720,430],"assets/album/t_008_1704077933482.jpg":[720,480],"assets/album/t_007_1701422759524.jpg":[720,540],"assets/album/t_066_1781787468808.jpg":[540,720],"assets/album/t_000_1689834179369.jpg":[540,720],"assets/album/t_077_1781882210900.jpg":[720,480],"assets/album/t_004_1696331383571.jpg":[480,720],"assets/album/t_102_1782145170215.jpg":[720,405],"assets/guitar-1.jpg":[1400,1050],"assets/guitar-2.jpg":[1279,1706],"assets/album/t_080_1781934391788.jpg":[720,540],"assets/album/t_111_202610040003.jpg":[540,720],"assets/album/t_082_1781934447593.jpg":[720,540],"assets/album/t_031_1757164516452.jpg":[720,405],"assets/album/t_085_1781934488254.jpg":[540,720],"assets/cat-2.jpg":[1260,659],"assets/album/t_098_1782145119509.jpg":[720,540],"assets/album/t_105_1782299495391.jpg":[405,720],"assets/album/t_072_1781802591488.jpg":[480,720],"assets/guitar-video-3-poster.jpg":[720,406],"assets/album/t_087_1781934523655.jpg":[720,480],"assets/cat-1.jpg":[1400,1051],"assets/album/t_081_1781934394025.jpg":[720,540],"assets/album/t_115_202610040007.jpg":[540,720],"assets/album/t_071_1781788072677.jpg":[720,540],"assets/album/t_041_1781605528140.jpg":[565,720],"assets/album/t_021_1735658770756.jpg":[720,540],"assets/album/t_057_1781786146375.jpg":[540,720],"assets/album/t_029_1751344434360.jpg":[542,548],"assets/guitar-3.jpg":[1080,1439],"assets/album/t_042_1781615113665.jpg":[419,720],"assets/album/t_065_1781787461076.jpg":[540,720],"assets/album/t_045_1781660553984.jpg":[720,540],"assets/album/t_049_1781676624334.jpg":[720,540],"assets/album/t_016_1731777527526.jpg":[540,720],"assets/album/t_050_1781676846715.jpg":[540,720],"assets/album/t_036_1767392018659.jpg":[720,540],"assets/album/t_020_1735643043090.jpg":[720,702],"assets/album/t_047_1781676609654.jpg":[720,540],"assets/album/t_108_1782309979446.jpg":[720,540],"assets/guitar-video-9-poster.jpg":[324,720],"assets/station-logo-ui-poster.jpg":[720,406],"assets/album/t_083_1781934458227.jpg":[720,540],"assets/v-award.jpg":[1200,900],"assets/album/t_025_1746021369904.jpg":[720,540],"assets/album/t_035_1767392015719.jpg":[720,540],"assets/album/t_027_1749018069462.jpg":[540,720],"assets/album/t_034_1766149919260.jpg":[540,720],"assets/guitar-video-8-poster.jpg":[720,406],"assets/album/t_088_1781934525991.jpg":[720,540],"assets/album/t_092_1782031501092.jpg":[720,540],"assets/album/t_114_202610040006.jpg":[540,720],"assets/album/t_076_1781850139586.jpg":[540,720],"assets/album/t_068_1781787489949.jpg":[720,540],"assets/v-award2.jpg":[1200,900],"assets/album/t_074_1781849035720.jpg":[540,720],"assets/album/t_051_1781689300819.jpg":[720,540],"assets/album/t_005_1696331384844.jpg":[480,720],"assets/album/t_090_1782016485857.jpg":[720,540],"assets/album/t_011_1712114780689.jpg":[720,540],"assets/album/t_003_1696331382144.jpg":[720,480],"assets/album/t_014_1727711313723.jpg":[720,540],"assets/guitar-video-13-poster.jpg":[720,406],"assets/album/t_040_1781587652476.jpg":[540,720],"assets/album/t_079_1781883084149.jpg":[540,720],"assets/album/t_002_1695482725253.jpg":[480,720],"assets/album/t_062_1781787401011.jpg":[720,540],"assets/album/t_012_1712291550964.jpg":[720,540],"assets/guitar-video-4-poster.jpg":[720,406],"assets/cat-4.jpg":[1080,1440],"assets/album/t_039_1781587644693.jpg":[540,720],"assets/album/t_069_1781787493616.jpg":[720,405],"assets/album/t_104_1782297558863.jpg":[540,720],"assets/guitar-video-12-poster.jpg":[720,388],"assets/album/t_055_1781689462730.jpg":[540,720],"assets/album/t_043_1781630896146.jpg":[720,540],"assets/album/t_030_1756823450613.jpg":[720,540],"assets/guitar-video-2-poster.jpg":[720,406],"assets/album/t_015_1731777358333.jpg":[645,720],"assets/album/t_060_1781787125767.jpg":[540,720],"assets/cat-video-1-poster.jpg":[960,540],"assets/v-class.jpg":[1200,684],"assets/album/t_018_1735387078579.jpg":[720,540],"assets/album/t_009_1707051314675.jpg":[523,627]};

  const ui = window.SiteUI;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointerHover = matchMedia('(hover: hover) and (pointer: fine)');
  const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  const backIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6M8 12h12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const image = (src, title) => ({ type: 'image', src, thumb: src, title });
  const video = (src, poster, title, id) => ({ type: 'video', src, poster, thumb: poster, title, id });
  const albumInfo = [
    ['mountain', '山野', '雪山、云海与经幡，留下路上的风景。'],
    ['lake', '湖光', '湖面、岸边与光影，记录那些安静的片刻。'],
    ['daily', '日常', '那些随手留下的日常记录。']
  ];
  const albums = window.ALBUM_SECTIONS || [];
  const collections = albumInfo.map(([id, title, description], index) => ({
    id, title, description, section: 'works',
    items: (albums[index]?.photos || []).map((photo, i) => ({ type: 'image', src: photo.f, thumb: photo.t, title: title + '照片 ' + (i + 1) }))
  }));
  collections.push({
    id: 'editing', title: '剪辑作品', description: '拍摄、剪辑与调色，把想法做成影像。', section: 'works',
    items: [
      video('assets/videos/station-logo-ui.mp4', 'assets/station-logo-ui-poster.jpg', '台标 UI 剪辑作品'),
      ...['edit-1', 'edit-2', 'video-hello', 'video-end', 'video-sports', 'v-award', 'v-award2', 'v-catch', 'v-400days', 'v-class'].map((name, i) => image('assets/' + name + '.jpg', '剪辑作品记录 ' + (i + 1)))
    ]
  }, {
    id: 'cats', title: '小猫', description: '小猫慵懒可爱。', section: 'more',
    items: [
      ...[1, 2, 3, 4].map(i => image('assets/cat-' + i + '.jpg', '小猫照片 ' + i)),
      video('assets/videos/cat-1-v2.mp4', 'assets/cat-video-1-poster.jpg', '小猫视频')
    ]
  }, {
    id: 'music', title: '吉他／贝斯', description: '吉他从弹唱到指弹，也在学习贝斯。', section: 'more',
    items: [
      ...[1, 2, 3].map(i => image('assets/guitar-' + i + '.jpg', '吉他照片 ' + i)),
      video('assets/videos/guitar-1-v2.mp4', 'assets/guitar-video-1-poster.jpg', '吉他演奏'),
      ...[2, 3, 4, 5, 6].map(i => video('assets/videos/guitar-' + i + '.mp4', 'assets/guitar-video-' + i + '-poster.jpg', '吉他／贝斯视频 ' + i)),
      video('assets/videos/after-rain-demo.mp4', 'assets/after-rain-demo-poster.jpg', 'After Rain Demo', 'afterRainDemo'),
      ...[8, 9, 10, 11, 12, 13].map(i => video('assets/videos/guitar-' + i + '.mp4', 'assets/guitar-video-' + i + '-poster.jpg', '吉他／贝斯视频 ' + i))
    ]
  });
  const byId = new Map(collections.map(collection => [collection.id, collection]));
  const countText = collection => {
    const photos = collection.items.filter(item => item.type === 'image').length;
    const videos = collection.items.length - photos;
    return [photos ? photos + ' 张照片' : '', videos ? videos + ' 段视频' : ''].filter(Boolean).join(' · ');
  };
  const roots = [];
  const triggers = new Map();
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  // 文件夹只装三张真实缩略卡片；图片与视频资料始终以已发布清单为准。
  collections.forEach(collection => {
    const row = node('article', 'folder-row reveal');
    row.dataset.collection = collection.id;
    const text = node('div', 'folder-copy');
    text.append(node('h3', '', collection.title), node('p', 'folder-description', collection.description), node('p', 'folder-count', countText(collection)));
    const stage = node('div', 'folder-stage');
    const root = node('div', 'folder-float');
    root.innerHTML = '<div class="folder-float__items" aria-hidden="true"></div><div class="folder-float__folder"><span class="folder-float__back" aria-hidden="true"></span><span class="folder-float__paper" aria-hidden="true"></span><span class="folder-float__front" aria-hidden="true"><span class="folder-float__label"></span><span class="folder-float__sub"></span></span><button class="folder-float__trigger" type="button" aria-haspopup="dialog"></button></div>';
    root.querySelector('.folder-float__label').textContent = collection.title;
    root.querySelector('.folder-float__sub').textContent = countText(collection);
    const trigger = root.querySelector('button');
    trigger.setAttribute('aria-label', '打开' + collection.title + '文件夹，' + countText(collection));
    triggers.set(collection.id, trigger);
    let previews = collection.items.slice(0, 3);
    if (collection.id === 'cats') previews = [collection.items[0], collection.items[1], collection.items[4]];
    if (collection.id === 'music') previews = [collection.items[0], collection.items[3], collection.items.find(item => item.id === 'afterRainDemo')];
    previews.forEach(item => {
      const card = node('span', 'folder-preview');
      const frame = node('span', 'folder-preview-media');
      const img = document.createElement('img');
      img.src = item.thumb; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      const size = imageSizes[item.thumb];
      if (size) { img.width = size[0]; img.height = size[1]; }
      frame.appendChild(img);
      if (item.type === 'video') {
        const badge = node('span', 'folder-preview-play');
        badge.innerHTML = playIcon; frame.appendChild(badge);
      }
      card.appendChild(frame);
      root.querySelector('.folder-float__items').appendChild(card);
    });
    const setPreview = open => {
      root.toggleAttribute('data-open', open && !document.hidden && dialog?.hidden !== false);
    };
    root.querySelector('.folder-float__folder').addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch' && pointerHover.matches) setPreview(true);
    });
    stage.addEventListener('pointerleave', () => {
      if (!stage.contains(document.activeElement)) setPreview(false);
    });
    trigger.addEventListener('focus', () => setPreview(true));
    stage.addEventListener('focusout', event => {
      if (!stage.contains(event.relatedTarget) && !stage.matches(':hover')) setPreview(false);
    });
    trigger.addEventListener('click', () => navigate(collection.id, trigger));
    stage.appendChild(root); row.append(text, stage);
    document.getElementById(collection.section === 'works' ? 'workFolders' : 'interestFolders').appendChild(row);
    roots.push(root);
    ui.registerMotion(row);
  });

  const folderObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.toggleAttribute('data-visible', entry.isIntersecting);
      if (!entry.isIntersecting) entry.target.removeAttribute('data-open');
    });
  });
  roots.forEach(root => folderObserver.observe(root));
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('media-page-hidden', document.hidden);
    if (document.hidden) roots.forEach(root => root.removeAttribute('data-open'));
  });

  // 弹层固定在导航与大图灯箱之间，让全站点击火花和高光仍可正常显示。
  const dialog = node('div', 'gallery-dialog');
  dialog.id = 'mediaGallery'; dialog.hidden = true;
  dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'galleryTitle');
  dialog.setAttribute('aria-describedby', 'galleryDescription');
  dialog.innerHTML = '<div class="gallery-inner"><header class="gallery-header glass"><div><h2 class="gallery-title" id="galleryTitle"></h2><p class="gallery-description" id="galleryDescription"></p><p class="gallery-count" id="galleryCount"></p></div><button class="btn btn-ghost gallery-close" type="button">' + backIcon + '<span>返回</span></button></header><div class="gallery-body"></div></div>';
  document.body.appendChild(dialog);
  const closeButton = dialog.querySelector('.gallery-close');
  const title = dialog.querySelector('#galleryTitle');
  const description = dialog.querySelector('#galleryDescription');
  const count = dialog.querySelector('#galleryCount');
  const body = dialog.querySelector('.gallery-body');
  const makeStrip = (label, className) => {
    const section = node('section', 'gallery-section');
    section.appendChild(node('h3', 'strip-title', label));
    const wrap = node('div', 'strip-wrap');
    const strip = node('div', className);
    wrap.appendChild(strip);
    [-1, 1].forEach(direction => {
      const button = node('button', 'strip-arrow ' + (direction < 0 ? 'left' : 'right'), direction < 0 ? '‹' : '›');
      button.type = 'button';
      button.setAttribute('aria-label', label + (direction < 0 ? '往前翻' : '往后翻'));
      button.addEventListener('click', () => strip.scrollBy({ left: direction * strip.clientWidth * .8, behavior: motion.matches ? 'auto' : 'smooth' }));
      wrap.appendChild(button);
    });
    section.appendChild(wrap); body.appendChild(section);
    return { section, strip };
  };
  const photoView = makeStrip('照片', 'strip gallery-photo-strip');
  const videoView = makeStrip('视频', 'video-strip gallery-video-strip');
  let current = null;
  let opener = null;
  let closing = false;
  let scrollPosition = 0;
  let savedStyle = null;
  let inertStates = [];
  let parentHash = '';
  let renderedHash = '';

  const releaseMedia = () => {
    videoView.strip.querySelectorAll('video').forEach(element => {
      element.pause(); element.removeAttribute('src'); element.load();
    });
    photoView.strip.replaceChildren(); videoView.strip.replaceChildren();
  };
  const lockPage = () => {
    scrollPosition = window.scrollY;
    savedStyle = Object.fromEntries(['position', 'top', 'left', 'right', 'width', 'overflow'].map(key => [key, document.body.style[key]]));
    Object.assign(document.body.style, { position: 'fixed', top: -scrollPosition + 'px', left: '0', right: '0', width: '100%', overflow: 'hidden' });
    const elements = [...document.body.children].filter(element => element.matches('nav, header, section, footer'));
    inertStates = elements.map(element => [element, element.inert]);
    elements.forEach(element => { element.inert = true; });
  };
  const unlockPage = () => {
    inertStates.forEach(([element, previous]) => { element.inert = previous; });
    inertStates = [];
    if (savedStyle) Object.assign(document.body.style, savedStyle);
    savedStyle = null;
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollPosition);
    document.documentElement.style.scrollBehavior = previousBehavior;
  };
  const render = (collection, targetId) => {
    const wasClosed = dialog.hidden;
    if (wasClosed) lockPage();
    ui.closeLightbox(); releaseMedia();
    current = collection;
    roots.forEach(root => root.removeAttribute('data-open'));
    dialog.hidden = false; dialog.classList.add('is-open');
    description.textContent = collection.description; count.textContent = countText(collection);
    closeButton.setAttribute('aria-label', '关闭' + collection.title + '画廊，返回首页');
    ui.refreshTitle(title, collection.title);
    const photos = collection.items.filter(item => item.type === 'image');
    const videos = collection.items.filter(item => item.type === 'video');
    const fullPhotos = photos.map(item => item.src);
    photoView.section.hidden = !photos.length; videoView.section.hidden = !videos.length;
    photos.forEach((item, index) => {
      const picture = node('button', 's-item gallery-picture');
      picture.type = 'button'; picture.setAttribute('aria-label', '查看' + item.title);
      const size = imageSizes[item.thumb] || [4, 3];
      picture.style.setProperty('--media-ratio', String(size[0] / size[1]));
      const img = document.createElement('img');
      img.src = item.thumb; img.alt = item.title; img.width = size[0]; img.height = size[1];
      img.loading = 'lazy'; img.decoding = 'async';
      img.addEventListener('error', () => { picture.setAttribute('aria-label', item.title + '暂时无法加载'); picture.classList.add('media-error'); });
      picture.appendChild(img);
      picture.addEventListener('click', () => ui.openLightbox(fullPhotos, index));
      photoView.strip.appendChild(picture);
    });
    videos.forEach(item => {
      const element = document.createElement('video');
      element.src = item.src; element.poster = item.poster;
      element.controls = true; element.playsInline = true; element.preload = 'none';
      element.tabIndex = 0; element.setAttribute('aria-label', item.title);
      const size = imageSizes[item.poster];
      if (size) { element.width = size[0]; element.height = size[1]; }
      if (item.id) element.id = item.id;
      videoView.strip.appendChild(element);
    });
    dialog.scrollTop = 0; photoView.strip.scrollLeft = 0; videoView.strip.scrollLeft = 0;
    closeButton.focus({ preventScroll: true });
    ui.registerMotion(body);
    window.dispatchEvent(new Event('site:overlay-change'));
    if (targetId) requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (target && dialog.contains(target)) target.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    }));
  };
  const hide = () => {
    if (dialog.hidden) return;
    ui.closeLightbox(); releaseMedia();
    dialog.classList.remove('is-open'); dialog.hidden = true; current = null; closing = false; renderedHash = '';
    unlockPage();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
    window.dispatchEvent(new Event('site:overlay-change'));
  };
  const route = () => {
    closing = false;
    const hash = location.hash;
    const legacy = hash === '#afterRainDemo' || hash === '#guitarVideos';
    const id = legacy ? 'music' : hash.match(/^#gallery\/([a-z]+)$/)?.[1];
    const collection = byId.get(id);
    if (!collection) { hide(); return; }
    if (!dialog.hidden && renderedHash === hash) return;
    renderedHash = hash;
    if (!opener) opener = triggers.get(id);
    render(collection, hash === '#afterRainDemo' ? 'afterRainDemo' : null);
  };
  function navigate(id, button) {
    if (!byId.has(id)) return;
    parentHash = dialog.hidden ? location.hash : parentHash;
    opener = button || triggers.get(id);
    history.pushState({ ...history.state, mediaFolderEntry: true }, '', '#gallery/' + id);
    route();
  }
  const close = () => {
    if (closing || dialog.hidden) return;
    if (history.state?.mediaFolderEntry) { closing = true; history.back(); }
    else {
      const destination = parentHash || (current.section === 'works' ? '#works' : '#more');
      history.replaceState(history.state, '', destination);
      hide();
    }
  };
  closeButton.addEventListener('click', close);
  window.addEventListener('popstate', route);
  window.addEventListener('hashchange', route);
  document.addEventListener('keydown', event => {
    if (dialog.hidden || ui.isLightboxOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button, video[controls]')].filter(element => !element.disabled && element.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }, true);
  document.addEventListener('focusin', event => {
    if (!dialog.hidden && !ui.isLightboxOpen() && !dialog.contains(event.target)) closeButton.focus({ preventScroll: true });
  });
  window.MediaGallery = { collections, open: id => navigate(id), close };
  route();
})();

