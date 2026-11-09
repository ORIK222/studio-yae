/* ================= Settings — change here =================
   formEndpoint: the form service that forwards requests to the studio's e-mail.
   FormSubmit needs no account: the very first request sends an activation
   letter to the address below; once someone clicks the link in it, every form
   arrives in that inbox. If sending fails, the form keeps the answers and shows
   a note with the phone number and an e-mail link.
   formKey: only for services that need an access key (e.g. Web3Forms). */
var CONFIG = {
  email: 'studioiamm8@gmail.com',
  formEndpoint: 'https://formsubmit.co/ajax/studioiamm8@gmail.com',
  formKey: ''
};

(function () {
  var html = document.documentElement;
  function $(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function en() { return html.lang === 'en'; }

  /* ---------- Language: Ukrainian is written in the page, English sits in data-en ---------- */
  var META = {
    uk: { title: 'Психологічна студія «Яє» — Рівне', menuOpen: 'Відкрити меню', menuClose: 'Закрити меню', nav: 'Головне меню' },
    en: { title: 'Yae psychological studio — Rivne, Ukraine', menuOpen: 'Open menu', menuClose: 'Close menu', nav: 'Main menu' }
  };
  function swap(el, attr, enVal, toEn) {
    var key = 'ua' + attr.replace(/-/g, '');
    if (el.dataset[key] === undefined) el.dataset[key] = attr === 'Html' ? el.innerHTML : (el.getAttribute(attr) || '');
    var v = toEn ? enVal : el.dataset[key];
    if (attr === 'Html') el.innerHTML = v; else el.setAttribute(attr, v);
  }
  function setLang(l, save) {
    var toEn = l === 'en';
    html.lang = toEn ? 'en' : 'uk';
    all('[data-en]').forEach(function (el) { swap(el, 'Html', el.dataset.en, toEn); });
    all('[data-en-ph]').forEach(function (el) { swap(el, 'placeholder', el.dataset.enPh, toEn); });
    all('[data-en-alt]').forEach(function (el) { swap(el, 'alt', el.dataset.enAlt, toEn); });
    all('[data-en-aria]').forEach(function (el) { swap(el, 'aria-label', el.dataset.enAria, toEn); });
    var m = META[html.lang];
    document.title = m.title;
    $('nav').setAttribute('aria-label', m.nav);
    setMenu(header.classList.contains('menu-open'));
    all('.lang button').forEach(function (b) {
      var on = b.dataset.lang === html.lang;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
    });
    if (save) { try { localStorage.setItem('yae_lang', html.lang); } catch (e) {} }
    if (window.aimFrames) window.aimFrames();
  }

  /* ---------- Mobile menu ---------- */
  var header = $('header'), burger = $('burger');
  function setMenu(open) {
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', META[html.lang][open ? 'menuClose' : 'menuOpen']);
  }
  burger.addEventListener('click', function () { setMenu(!header.classList.contains('menu-open')); });
  all('#nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  all('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang, true); }); });
  setLang(html.lang, false);

  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  $('year').textContent = new Date().getFullYear();

  /* ---------- Hero: the painting plays, and on every loop the logo draws itself (from Ilona's version) ----------
     Timings follow the painting video's clock, so the logo appears when the ribbons knot together. */
  var hv = $('heroVideo'), clip = $('logoClip'), lockup = $('lockup'), cv = $('logoCanvas');
  var cx = null;
  try { cx = cv.getContext('2d', { willReadFrequently: true }); } catch (e) {}
  var TL = { logo: [2.96, 4.58], rule1: [4.34, 4.81], top: [4.39, 5.36], rule2: [5.32, 5.78], bottom: [5.36, 6.43], fade: [9.06, 10.31] };
  function clamp(x) { return Math.max(0, Math.min(1, x)); }
  function ease(x) { return .5 - .5 * Math.cos(Math.PI * clamp(x)); }
  function win(t, a) { return clamp((t - a[0]) / (a[1] - a[0])); }
  function sm(a, b, x) { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); }
  var LW = cv.width, LH = cv.height, clipOn = false, lastT = -1, cleared = true;
  // The logo animation is dark on white: turn it into a milk-white logo with a soft orange accent
  function paintLogo() {
    cx.drawImage(clip, 0, 0, LW, LH);
    var im = cx.getImageData(0, 0, LW, LH), d = im.data;
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i], g = d[i + 1], b = d[i + 2], dk = (255 - (r + g + b) / 3) / 255, wa = clamp((r - b - 6) / 16);
      var am = sm(.30, .70, dk) * (1 - wa), aa = sm(.06, .14, dk) * wa * (1 - sm(.55, .75, dk)), a = Math.max(am, aa), t = aa / (am + aa + 1e-4);
      d[i] = 255 - 13 * t; d[i + 1] = 250 - 108 * t; d[i + 2] = 238 - 158 * t; d[i + 3] = a * 255;
    }
    cx.putImageData(im, 0, 0);
    cleared = false;
  }
  function still() { lockup.classList.add('still'); }
  var topT = $('topText'), botT = $('bottomText'), r1 = $('rule1'), r2 = $('rule2');
  function heroFrame() {
    var t = hv.currentTime, local = t - TL.logo[0];
    if (local < 0) {
      if (clipOn) { clip.pause(); try { clip.currentTime = 0; } catch (e) {} clipOn = false; }
      if (!cleared) { cx.clearRect(0, 0, LW, LH); cleared = true; lastT = -1; }
    } else {
      if (!clipOn) { try { clip.currentTime = 0; } catch (e) {} clip.play().catch(function () {}); clipOn = true; }
      else if (!clip.ended && clip.duration && local < clip.duration && Math.abs(clip.currentTime - local) > .25) { try { clip.currentTime = local; } catch (e) {} }
      if (clip.readyState >= 2 && Math.abs(clip.currentTime - lastT) > .001) {
        lastT = clip.currentTime;
        try { paintLogo(); } catch (e) { still(); }   // e.g. opened straight from a folder: the browser won't let us read the video
      }
    }
    topT.style.setProperty('--p', ease(win(t, TL.top)));
    botT.style.setProperty('--p', ease(win(t, TL.bottom)));
    var a1 = ease(win(t, TL.rule1)), a2 = ease(win(t, TL.rule2));
    r1.style.transform = 'scaleX(' + a1 + ')'; r1.style.opacity = a1;
    r2.style.transform = 'scaleX(' + a2 + ')'; r2.style.opacity = a2;
    if (!lockup.classList.contains('still')) {
      var f = ease(win(t, TL.fade));
      lockup.style.opacity = 1 - f;
      lockup.style.filter = f ? 'blur(' + (f * 3).toFixed(2) + 'px)' : '';
    } else { lockup.style.opacity = ''; lockup.style.filter = ''; }
    requestAnimationFrame(heroFrame);
  }
  function startHero() {
    if (!html.classList.contains('motion') || !cx) { still(); return; }
    try { hv.currentTime = 0; } catch (e) {}
    var p = hv.play();
    if (p && p.catch) p.catch(function () { still(); });
    requestAnimationFrame(heroFrame);
  }
  if (!html.classList.contains('motion')) still();

  /* ---------- 1. Loading screen with the logo animation ---------- */
  var intro = $('intro'), iv = $('introVideo');
  function afterIntro() { startMotion(); startHero(); }
  if (html.classList.contains('intro-on')) {
    var finished = false, started = false;
    var finish = function () {
      if (finished) return;
      finished = true;
      html.classList.add('intro-out');
      afterIntro();
      setTimeout(function () { html.classList.remove('intro-on', 'intro-out'); iv.pause(); intro.remove(); }, 800);
    };
    // With sound if the browser allows it; most block sound until the first tap, then it plays muted
    iv.muted = false;
    var p = iv.play();
    if (p && p.catch) p.catch(function () {
      iv.muted = true;
      $('introSound').hidden = false;
      iv.play().catch(finish);
    });
    iv.addEventListener('playing', function () { started = true; });
    iv.addEventListener('ended', function () { setTimeout(finish, 450); });
    iv.addEventListener('error', finish);
    $('introSkip').addEventListener('click', finish);
    // Sound on: start the logo again from the beginning so it is heard in full
    var cap = setTimeout(finish, 9000);
    $('introSound').addEventListener('click', function () {
      iv.muted = false; iv.currentTime = 0; iv.play().catch(function () {});
      this.hidden = true;
      clearTimeout(cap); cap = setTimeout(finish, 9000);
    });
    setTimeout(function () { if (!started) finish(); }, 3500);   // slow network: don't hold the page
  } else {
    intro.remove();
    afterIntro();
  }

  /* ---------- Motion: frames draw themselves, blocks float in, script captions write themselves ---------- */
  function startMotion() {
    if (!html.classList.contains('motion') || !('IntersectionObserver' in window)) {
      html.classList.remove('motion');
      return;
    }
    html.classList.add('ready');

    // Start each frame's brush stroke inside its open corner
    var frames = all('.frame');
    window.aimFrames = function () {
      frames.forEach(function (f) {
        var w = f.offsetWidth, h = f.offsetHeight;
        function ang(x, y) { return (Math.atan2(x - w / 2, h / 2 - y) * 180 / Math.PI + 360) % 360; }
        f.style.setProperty('--fs', ((ang(0, h * .82) + ang(w * .11, h)) / 2).toFixed(1) + 'deg');
      });
    };
    window.aimFrames();
    window.addEventListener('resize', window.aimFrames);

    var reveal = '.head > :not(.script), .about-text > :not(.script), .studio-card, .story-photo, .story-text > :not(.script),' +
      ' .value, .team-head > :not(.script), .person, .crew h3, .crew-item, .founder-photo, .founder-copy > :not(.script),' +
      ' .services-head > :not(.script), .svc, .access-head, .access-list li, .step, .book-form, .ask-text > :not(.script), .ask-frame,' +
      ' .gift-cards, .gift-text > :not(.script), .cert-order, .contact-card, .social-wall, .map';
    all(reveal).forEach(function (el) { el.classList.add('rv'); });
    all('main .script').forEach(function (el) { if (!el.closest('.hero') && !el.closest('.access')) el.classList.add('w'); });

    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // A block can be both a frame and a reveal (service cards, the anonymous form): do both
        if (el.classList.contains('frame')) el.classList.add('drawn');
        if (el.classList.contains('rv')) {
          el.style.setProperty('--d', Math.min(n++ * .09, .45) + 's');
          el.classList.add('in');
        }
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    all('.frame, .rv').forEach(function (el) { io.observe(el); });

    var ioScript = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ioScript.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .5 });
    all('.script.w').forEach(function (el) { ioScript.observe(el); });
  }

  /* ---------- Booking: buttons on team and service cards pre-fill the form ---------- */
  function pick(spec, svc) {
    if (spec && $('bk-spec').querySelector('option[value="' + spec + '"]')) $('bk-spec').value = spec;
    if (svc) {
      var r = document.querySelector('#svc-opts input[value="' + svc + '"]');
      if (r) r.checked = true;
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-spec],[data-svc]');
    if (a) pick(a.dataset.spec, a.dataset.svc);
  });
  var qs = new URLSearchParams(location.search);
  pick(qs.get('spec'), qs.get('svc'));

  /* ---------- Certificate: preview follows the chosen colour ---------- */
  all('#cert-form input[name=color]').forEach(function (r) {
    r.addEventListener('change', function () {
      all('.co-prev').forEach(function (img) { img.hidden = img.dataset.color !== r.value; });
    });
  });

  /* ---------- Privacy policy ---------- */
  var dlg = $('privacy');
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.privacy-link');
    if (!a) return;
    e.preventDefault();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  /* ---------- Forms: sent to CONFIG.formEndpoint ---------- */
  function label(form, name) {
    var input = form.querySelector('[name="' + name + '"]');
    if (!input) return name;
    var f = input.closest('.field');
    var l = f && (f.querySelector('legend') || f.querySelector('label'));
    return l ? l.textContent.replace(/\s*\(.*?\)\s*/g, '').trim() : name;
  }
  function chosenText(form, name) {
    var r = form.querySelector('[name="' + name + '"]:checked');
    if (!r) return '';
    var s = r.parentNode.querySelector('span:not(.sw)') || r.parentNode;
    return s.textContent.trim();
  }
  function selectText(sel) { return sel.options[sel.selectedIndex].textContent.trim(); }
  function line(k, v) { return v ? k + ': ' + v : null; }
  function val(f, n) { return (f.elements[n].value || '').trim(); }

  /* Sending: the button says «Надсилаємо…». Sent: the fields give way to a
     confirmation with a «send another» button. Failed: the answers stay in the
     form and a note under the button offers to retry, call or write an e-mail. */
  // the studio's infinity sign; a brush-like stroke keeps running along it
  var INF = '<svg class="inf-loader" viewBox="0 0 44 22" aria-hidden="true">' +
    '<path class="inf-track" pathLength="100" d="M22 11C25.5 6.5 29 3.5 33.5 3.5 38 3.5 40.5 7 40.5 11S38 18.5 33.5 18.5C29 18.5 25.5 15.5 22 11S15 3.5 10.5 3.5C6 3.5 3.5 7 3.5 11s2.5 7.5 7 7.5c4.5 0 8-3 11.5-7.5z"/>' +
    '<path class="inf-run" pathLength="100" d="M22 11C25.5 6.5 29 3.5 33.5 3.5 38 3.5 40.5 7 40.5 11S38 18.5 33.5 18.5C29 18.5 25.5 15.5 22 11S15 3.5 10.5 3.5C6 3.5 3.5 7 3.5 11s2.5 7.5 7 7.5c4.5 0 8-3 11.5-7.5z"/></svg>';

  function send(form, subject, lines, fieldsId, okId) {
    var body = lines.filter(Boolean).join('\n');
    var fields = $(fieldsId), ok = $(okId);
    var btn = form.querySelector('button[type=submit]');
    var err = form.querySelector('.form-err');
    var mailHref = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    if (btn.disabled) return;

    function busy(on) {
      btn.disabled = on;
      btn.classList.toggle('is-sending', on);
      btn.setAttribute('aria-busy', on ? 'true' : 'false');
      if (on) { btn.dataset.label = btn.innerHTML; btn.innerHTML = INF + '<span>' + (en() ? 'Sending…' : 'Надсилаємо…') + '</span>'; }
      else if (btn.dataset.label) { btn.innerHTML = btn.dataset.label; }
    }
    function done() {
      busy(false);
      form.reset();
      fields.hidden = true;
      ok.hidden = false;
      ok.focus({ preventScroll: true });
      ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function fail() {
      busy(false);
      err.querySelector('.err-mail').href = mailHref;
      err.hidden = false;
      err.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    err.hidden = true;
    if (!CONFIG.formEndpoint) { fail(); return; }
    busy(true);
    // test mode, nothing is sent: ?formtest shows success after 4 s, ?formtest=fail shows the error
    var test = /[?&]formtest(=([^&]*))?/.exec(location.search);
    if (test) { setTimeout(test[2] === 'fail' ? fail : done, 4000); return; }
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    fetch(CONFIG.formEndpoint, {
      method: 'POST',
      signal: ctrl ? ctrl.signal : undefined,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: CONFIG.formKey || undefined,
        subject: subject, _subject: subject, _template: 'box', _captcha: 'false',
        from_name: 'Сайт студії «Яє»', message: body
      })
    }).then(function (r) {
      // FormSubmit answers 200 with success "false" while the inbox is not activated
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok && j.success !== false && j.success !== 'false') done(); else fail();
      });
    }).catch(fail).then(function () { clearTimeout(timer); });
  }

  all('.form-again').forEach(function (b) {
    b.addEventListener('click', function () {
      var form = b.closest('form');
      form.querySelector('.form-ok').hidden = true;
      var fields = form.firstElementChild;
      fields.hidden = false;
      var first = fields.querySelector('input:not([type=hidden]),textarea,select');
      if (first) first.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  $('book-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this;
    send(f, en() ? 'Booking request' : 'Заявка на запис', [
      line(label(f, 'service'), chosenText(f, 'service')),
      line(label(f, 'specialist'), selectText(f.elements.specialist)),
      line(label(f, 'format'), selectText(f.elements.format)),
      line(label(f, 'name'), val(f, 'name')),
      line(label(f, 'contact'), val(f, 'contact')),
      line('Email', val(f, 'email')),
      line(en() ? 'Contact via' : 'Зв’язок через', chosenText(f, 'channel')),
      line(en() ? 'Reminder the day before' : 'Нагадування напередодні', f.elements.remind.checked ? (en() ? 'yes' : 'так') : (en() ? 'no' : 'ні')),
      line(label(f, 'comment'), val(f, 'comment'))
    ], 'book-fields', 'book-ok');
  });

  $('ask-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this;
    send(f, en() ? 'Anonymous message' : 'Анонімне звернення', [
      line(label(f, 'name'), val(f, 'name')),
      line(label(f, 'contact'), val(f, 'contact')),
      line(label(f, 'message'), val(f, 'message'))
    ], 'ask-fields', 'ask-ok');
  });

  $('cert-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this;
    send(f, en() ? 'Gift certificate order' : 'Замовлення сертифіката', [
      line(label(f, 'type'), chosenText(f, 'type')),
      line(label(f, 'color'), chosenText(f, 'color')),
      line(label(f, 'name'), val(f, 'name')),
      line(label(f, 'phone'), val(f, 'phone')),
      line('Email', val(f, 'email')),
      line(label(f, 'recipient'), val(f, 'recipient')),
      line(label(f, 'comment'), val(f, 'comment'))
    ], 'cert-fields', 'cert-ok');
  });
})();
