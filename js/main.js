/* ==========================================================================
   Clear Thoughts Psychiatry Inc. — site scripts
   Vanilla JS, no dependencies. Progressive enhancement only: every page
   remains readable and usable with JavaScript disabled.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');

  if (toggle && nav) {
    var closeNav = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.removeProperty('overflow');
    };

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) {
        closeNav();
      } else {
        nav.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close when a link is tapped
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        toggle.focus();
      }
    });

    // Reset when resizing back to desktop
    var mq = window.matchMedia('(min-width: 981px)');
    var onChange = function (e) { if (e.matches) closeNav(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---------------------------------------------------------------------
     Header shadow on scroll
     --------------------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var setStuck = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Accordion (FAQ)
     --------------------------------------------------------------------- */
  var accButtons = document.querySelectorAll('.acc-btn');
  Array.prototype.forEach.call(accButtons, function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;

    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.setAttribute('data-open', String(!isOpen));
    });
  });

  // Deep-link support: /faq.html#insurance opens that item
  if (window.location.hash) {
    var target = document.querySelector(window.location.hash);
    if (target && target.classList.contains('acc-item')) {
      var b = target.querySelector('.acc-btn');
      if (b && b.getAttribute('aria-expanded') !== 'true') b.click();
    }
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Array.prototype.forEach.call(revealEls, function (el) {
        el.classList.add('is-visible');
      });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
          setTimeout(function () { el.classList.add('is-visible'); }, delay);
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

      Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });
    }
  }

  /* ---------------------------------------------------------------------
     Current year in footer
     --------------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------------------------------------------------------------------
     Appointment request form
     ---------------------------------------------------------------------
     Submits to the Formspree endpoint in the form's action via fetch so the
     visitor stays on the page. Without JS the browser posts the form and
     Formspree shows its own confirmation page.
     --------------------------------------------------------------------- */
  var form = document.getElementById('appointment-form');
  if (form) {
    var status = document.getElementById('form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : '';

    var showStatus = function (message, ok) {
      if (!status) return;
      status.textContent = message;
      status.className = 'form-status is-visible ' + (ok ? 'form-status--ok' : 'form-status--err');
      status.setAttribute('role', 'status');
    };

    var setFieldError = function (input, message) {
      var wrap = input.closest('.field');
      if (!wrap) return;
      wrap.classList.add('has-error');
      var err = wrap.querySelector('.field-error');
      if (err) err.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    };

    var clearFieldError = function (input) {
      var wrap = input.closest('.field');
      if (!wrap) return;
      wrap.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
    };

    // Clear an error as soon as the visitor starts fixing it
    form.addEventListener('input', function (e) {
      if (e.target.matches('input, select, textarea')) clearFieldError(e.target);
    });

    var validate = function () {
      var firstBad = null;
      var required = form.querySelectorAll('[required]');

      Array.prototype.forEach.call(required, function (input) {
        clearFieldError(input);
        var value = (input.value || '').trim();
        var bad = false;
        var message = 'This field is required.';

        if (input.type === 'checkbox') {
          bad = !input.checked;
          message = 'Please confirm to continue.';
        } else if (!value) {
          bad = true;
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          bad = true;
          message = 'Please enter a valid email address.';
        } else if (input.type === 'tel' && value.replace(/\D/g, '').length < 10) {
          bad = true;
          message = 'Please enter a 10-digit phone number.';
        }

        if (bad) {
          setFieldError(input, message);
          if (!firstBad) firstBad = input;
        }
      });

      return firstBad;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstBad = validate();
      if (firstBad) {
        showStatus('Please correct the highlighted fields and try again.', false);
        firstBad.focus();
        return;
      }

      // Honeypot: silently succeed for bots without sending anything.
      var hp = form.querySelector('input[name="_gotcha"]');
      if (hp && hp.value) { form.reset(); return; }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      if (status) status.className = 'form-status';

      fetch(form.getAttribute('action'), {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          showStatus(
            'Thank you — your request has been received. A member of our team will ' +
            'contact you within one business day to schedule your appointment.',
            true
          );
        })
        .catch(function () {
          showStatus(
            'Sorry, we could not send your request. Please call 551-250-3868 ' +
            '(Fairfield) or 845-545-5444 (Warwick) and we will be glad to help.',
            false
          );
        })
        .then(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
        });
    });
  }
})();
