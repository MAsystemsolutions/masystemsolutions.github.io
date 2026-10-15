(function () {
  var root = document.documentElement;
  var EMAIL = 'miabr.marie@gmail.com';

  function gmail(subject, body) {
    return 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }
  /* open every Gmail link in a new tab */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="https://mail.google.com"]');
    if (a) { a.target = '_blank'; a.rel = 'noopener'; }
  }, true);

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


  /* ---------- contact form (every page) ---------- */
  var fModal = document.getElementById('formModal');
  var form = document.getElementById('contactForm');
  var ENDPOINT = 'https://formsubmit.co/ajax/' + EMAIL;
  var TYPE_LABEL = { hire: 'Hiring inquiry', starter: 'Quote request (Starter)', professional: 'Quote request (Professional)', quote: 'Quote request', custom: 'Quote request (Custom build)', notify: 'Launch updates', other: 'New message' };
  var fLast = null;
  function openForm(type, system) {
    if (!fModal) return;
    fLast = document.activeElement;
    var sel = document.getElementById('fType'), sys = document.getElementById('fSystem');
    if (type && sel.querySelector('option[value="' + type + '"]')) sel.value = type;
    if (system) {
      var match = Array.prototype.filter.call(sys.options, function (o) { return o.text === system; })[0];
      sys.value = match ? match.text : 'Not sure yet';
    }
    document.getElementById('fResult').className = 'form-msg';
    var demo = document.getElementById('demoModal');
    if (demo && demo.classList.contains('open')) { demo.classList.remove('open'); var mf = document.getElementById('mFrame'); if (mf) mf.innerHTML = ''; }
    fModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { document.getElementById('fName').focus(); }, 50);
  }
  function closeForm() {
    fModal.classList.remove('open');
    document.body.style.overflow = '';
    if (fLast) fLast.focus();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-form]');
    if (t) { e.preventDefault(); openForm(t.getAttribute('data-form'), t.getAttribute('data-system')); }
  });
  if (fModal) {
    fModal.addEventListener('click', function (e) { if (e.target === fModal || e.target.closest('.close')) closeForm(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && fModal.classList.contains('open')) closeForm(); });
  }
  function setErr(id, msg) {
    var el = document.getElementById(id), f = el.closest('.field');
    f.classList.toggle('bad', !!msg); f.querySelector('.err').textContent = msg || '';
  }
  if (form) {
    ['fName', 'fEmail', 'fMsg'].forEach(function (id) { document.getElementById(id).addEventListener('input', function () { setErr(id, ''); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
      var ok = true;
      if (!name) { setErr('fName', 'Enter your name'); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('fEmail', 'Enter a valid email'); ok = false; }
      if (msg.length < 5) { setErr('fMsg', 'Add a short message'); ok = false; }
      if (!ok) return;
      if (form._honey.value) return;
      var type = form.inquiry.value, system = form.system.value, company = form.company.value.trim();
      var subject = (TYPE_LABEL[type] || 'New message') + (system && system !== 'Not sure yet' ? ' – ' + system : '') + ' – from ' + name + (company ? ', ' + company : '');
      var btn = document.getElementById('fSend'), res = document.getElementById('fResult');
      btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader-2"></i> Sending…';
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ _subject: subject, _template: 'table', _captcha: 'false', _replyto: email,
          Name: name, Email: email, Company: company || '—', 'Interested in': TYPE_LABEL[type], System: system, Message: msg, Page: location.href })
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (x) {
          if (x.ok && String(x.d.success) === 'true') {
            res.className = 'form-msg ok';
            res.innerHTML = '<b>Thank you, ' + name.replace(/[<>&]/g, '') + '!</b> Your message was sent. I’ll reply to ' + email.replace(/[<>&]/g, '') + ' soon.';
            form.reset();
          } else { throw new Error('send failed'); }
        })
        .catch(function () {
          res.className = 'form-msg fail';
          res.innerHTML = 'Sorry, the message didn’t go through. Please email me directly at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL) + '" target="_blank" rel="noopener" style="color:var(--gold)">' + EMAIL + '</a>.';
        })
        .then(function () { btn.disabled = false; btn.innerHTML = '<i class="ti ti-send"></i> Send message'; });
    });
  }

  /* ---------- catalog (home page only) ---------- */
  var SYSTEMS = window.SYSTEMS || [];
  var grid = document.getElementById('systemGrid');
  if (!grid) return;

  function quoteLink(name) {
    var body = 'Hi Mia,\n\nI am interested in ' + name + '.\n\nName:\nBusiness:\nWhat I need:\n\nThank you!';
    return gmail('Quote Request – ' + name, body);
  }
  function hireLink() {
    var body = 'Hi Mia,\n\nI would like to talk about hiring you.\n\nName:\nCompany:\nRole / needs:\n\nThank you!';
    return gmail('Hiring Inquiry – Executive Assistant & Systems', body);
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
      '<p style="font-size:.9rem;margin:0 0 12px"><b>Starter · Professional · Custom</b> &nbsp;·&nbsp; <span style="color:var(--gold);font-weight:700">FREE when you hire me</span></p>' +
      '<div class="stack">' +
      '<a class="btn btn-gold" href="#contact" data-form="quote" data-system="' + s.name + '"><i class="ti ti-mail"></i> Get a quote</a>' +
      '<a class="btn btn-ghost" href="#contact" data-form="hire" data-system="' + s.name + '"><i class="ti ti-briefcase"></i> Hire me, get it free</a>' +
      '<a class="btn btn-ghost" href="' + s.slug + '.html"><i class="ti ti-file-description"></i> Full details</a>' +
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
