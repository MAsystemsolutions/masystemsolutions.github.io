(function () {
  var root = document.documentElement;
  var EMAIL = 'miabr.marie@gmail.com';

  /* theme toggle (remembered per visitor when the browser allows it) */
  try { var saved = localStorage.getItem('ma-theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function paintToggle() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.innerHTML = isDark() ? '<i class="ti ti-sun"></i>' : '<i class="ti ti-moon"></i>';
      b.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-theme-toggle]');
    if (!t) return;
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('ma-theme', next); } catch (err) {}
    paintToggle();
  });
  paintToggle();

  /* mobile menu */
  var menuBtn = document.querySelector('.menu-btn');
  var links = document.querySelector('.nav-links');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () { links.classList.toggle('open'); });
    links.addEventListener('click', function (e) { if (e.target.tagName === 'A') links.classList.remove('open'); });
  }

  /* scroll reveal */
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  /* year */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- catalog (home page only) ---------- */
  var SYSTEMS = window.SYSTEMS || [];
  var grid = document.getElementById('systemGrid');
  if (!grid) return;

  function quoteLink(name) {
    var body = 'Hi Mia,\n\nI am interested in ' + name + '.\n\nName:\nBusiness:\nWhat I need:\n\nThank you!';
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Quote Request – ' + name) + '&body=' + encodeURIComponent(body);
  }
  function hireLink() {
    var body = 'Hi Mia,\n\nI would like to talk about hiring you.\n\nName:\nCompany:\nRole / needs:\n\nThank you!';
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Hiring Inquiry – Executive Assistant & Systems') + '&body=' + encodeURIComponent(body);
  }
  window.MA_LINKS = { quote: quoteLink, hire: hireLink };

  /* filters */
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var cat = chip.getAttribute('data-cat');
      grid.querySelectorAll('.card').forEach(function (card) {
        var show = cat === 'all' || card.getAttribute('data-cat') === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  /* modal */
  var modal = document.getElementById('demoModal');
  var mTitle = document.getElementById('mTitle');
  var mTag = document.getElementById('mTag');
  var mTabs = document.getElementById('mTabs');
  var mFrame = document.getElementById('mFrame');
  var mSide = document.getElementById('mSide');
  var lastFocus = null;

  function frameHTML(src, isVideo, label) {
    return '<div class="frame' + (isVideo ? ' video' : '') + '"><div class="frame-bar"><div class="dots"><i></i><i></i><i></i></div><span>' + label + '</span></div>' +
      '<iframe src="' + src + '" title="' + label + '" allow="autoplay; fullscreen; clipboard-write" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></div>';
  }

  function render(s, view) {
    mTabs.innerHTML = '';
    var views = s.mode === 'video' ? [['video', 'Watch demo', 'ti-player-play']] : [['live', 'Try it live', 'ti-device-desktop']];
    views.forEach(function (v) {
      var b = document.createElement('button');
      b.className = 'tab' + (v[0] === view ? ' active' : '');
      b.innerHTML = '<i class="ti ' + v[2] + '"></i> ' + v[1];
      mTabs.appendChild(b);
    });
    var open = document.createElement('a');
    open.className = 'tab'; open.href = s.url; open.target = '_blank'; open.rel = 'noopener';
    open.style.textDecoration = 'none';
    open.innerHTML = '<i class="ti ti-external-link"></i> ' + (s.mode === 'video' ? 'Open the app' : 'Open in new tab');
    mTabs.appendChild(open);

    if (view === 'video') {
      mFrame.innerHTML = frameHTML('https://drive.google.com/file/d/' + s.video + '/preview', true, s.name + ' – video walkthrough') +
        '<p class="frame-note">Want to explore it yourself? Use “Open the app” above.</p>';
    } else {
      mFrame.innerHTML = frameHTML(s.url, false, s.name + ' – live demo') +
        '<p class="frame-note">If the demo doesn’t load here, use “Open in new tab” above.</p>';
    }
  }

  function openSystem(slug) {
    var s = SYSTEMS.filter(function (x) { return x.slug === slug; })[0];
    if (!s) return;
    lastFocus = document.activeElement;
    mTitle.textContent = s.name;
    mTag.textContent = s.category;
    var feats = s.features.slice(0, 6).map(function (f) { return '<li>' + f + '</li>'; }).join('');
    mSide.innerHTML =
      (s.sample ? '<div class="sample"><i class="ti ti-info-circle"></i> ' + s.sample + '</div>' : '') +
      '<h4>What it does</h4><p style="color:var(--sub);font-size:.93rem;margin-top:0">' + s.short + '</p>' +
      '<h4>Key features</h4><ul>' + feats + '</ul>' +
      '<p style="font-size:.9rem;margin:0 0 12px"><b>From $50</b> &nbsp;·&nbsp; <span style="color:var(--gold);font-weight:700">FREE when you hire me</span></p>' +
      '<div class="stack">' +
      '<a class="btn btn-gold" href="' + quoteLink(s.name) + '"><i class="ti ti-mail"></i> Request a quote</a>' +
      '<a class="btn btn-ghost" href="' + hireLink() + '"><i class="ti ti-briefcase"></i> Hire me, get it free</a>' +
      '<a class="btn btn-ghost" href="systems/' + s.slug + '.html"><i class="ti ti-file-description"></i> Full details</a>' +
      '</div>';
    render(s, s.mode === 'video' ? 'video' : 'live');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.close').focus();
  }
  function closeModal() {
    modal.classList.remove('open');
    mFrame.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open]');
    if (b) { e.preventDefault(); openSystem(b.getAttribute('data-open')); }
  });
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.close')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
})();
