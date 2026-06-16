// Shared password validator initializer
// options: {
//   passwordSelector, confirmSelector (optional), feedbackSelector, submitSelector, minLength
// }
(function () {
  function validatePassword(password, minLength) {
    return {
      lengthOk: password.length >= (minLength || 6),
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>_\-\\[\];'`~+=\/]/.test(password)
    };
  }

  function initPasswordValidator(options) {
    const pw = document.querySelector(options.passwordSelector);
    const pw2 = options.confirmSelector ? document.querySelector(options.confirmSelector) : null;
    const feedback = document.querySelector(options.feedbackSelector);
    const submitBtn = document.querySelector(options.submitSelector);
    const minLength = options.minLength || 6;
    if (!pw || !feedback || !submitBtn) return;

    let started = false;

    function update() {
      const p = pw.value || '';
      const p2 = pw2 ? (pw2.value || '') : '';
      const r = validatePassword(p, minLength);
      if (started) feedback.classList.add('visible');

      const map = {
        length: r.lengthOk,
        upper: r.upper,
        lower: r.lower,
        number: r.number,
        special: r.special,
        match: pw2 ? (p.length > 0 && p === p2) : true
      };

      Object.keys(map).forEach(key => {
        const li = feedback.querySelector(`li[data-check="${key}"]`);
        if (!li) return;
        const icon = li.querySelector('.icon');
        if (map[key]) {
          li.classList.add('valid');
          if (icon) icon.textContent = '✔';
        } else {
          li.classList.remove('valid');
          if (icon) icon.textContent = '✖';
        }
      });

      const allOk = Object.values(map).every(Boolean);
      submitBtn.disabled = !allOk;
      if (allOk) feedback.classList.add('success'); else feedback.classList.remove('success');
    }

    [pw, pw2].filter(Boolean).forEach(el => el.addEventListener('input', () => {
      if (!started && ((pw && pw.value.length > 0) || (pw2 && pw2.value.length > 0))) started = true;
      update();
    }));

    // prevent form submit if invalid
    const form = pw.closest('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        update();
        if (submitBtn.disabled) {
          e.preventDefault();
          pw.focus();
        }
      });
    }

    // initial
    update();
  }

  window.initPasswordValidator = initPasswordValidator;
})();
