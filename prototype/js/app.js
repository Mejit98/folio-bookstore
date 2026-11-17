/* Фолиант — визуальная логика прототипа (спринт 1). Без внешних библиотек. */
(function () {
  'use strict';
  var MSG = {
    required: 'Заполните это поле',
    email: 'Введите корректный адрес электронной почты',
    min: function (n) { return 'Минимальная длина — ' + n + ' символов'; },
    phone: 'Телефон в формате +7 900 123-45-67',
    match: 'Пароли не совпадают',
    file: 'Допустимы файлы PDF, DOCX, TXT размером до 10 МБ',
    check: 'Необходимо подтвердить согласие'
  };

  function validateField(el) {
    var v = (el.value || '').trim(), attr = el.getAttribute('data-rule') || '', rule = attr.split(' ');
    if (rule.indexOf('required') > -1) {
      if (el.type === 'checkbox' && !el.checked) return MSG.check;
      if (el.type === 'file' && !el.files.length) return MSG.required;
      if (el.type !== 'checkbox' && el.type !== 'file' && !v) return MSG.required;
    }
    if (!v && el.type !== 'file') return '';
    if (rule.indexOf('email') > -1 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return MSG.email;
    if (rule.indexOf('phone') > -1 && !/^\+?[0-9\s()\-]{10,}$/.test(v)) return MSG.phone;
    var m = attr.match(/min:(\d+)/);
    if (m && v.length < +m[1]) return MSG.min(m[1]);
    var mt = el.getAttribute('data-match');
    if (mt && v !== document.querySelector(mt).value) return MSG.match;
    if (el.type === 'file' && el.files.length) {
      var f = el.files[0];
      if (!(/\.(pdf|docx|txt)$/i.test(f.name) && f.size <= 10 * 1048576)) return MSG.file;
    }
    return '';
  }

  function showState(el) {
    var box = el.closest('.field');
    if (!box) return true;
    var err = validateField(el), out = box.querySelector('.field__error');
    box.classList.toggle('field--error', !!err);
    box.classList.toggle('field--ok', !err && !!(el.value || '').trim());
    if (out) out.textContent = err;
    return !err;
  }

  function toast(t) {
    var e = document.getElementById('toast');
    if (!e) return;
    e.textContent = t; e.classList.add('show');
    setTimeout(function () { e.classList.remove('show'); }, 2600);
  }

  // 1. Проверки при редактировании поля и при сохранении формы
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var fields = form.querySelectorAll('[data-rule]');
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { showState(el); });
      el.addEventListener('input', function () { if (el.closest('.field--error')) showState(el); });
      el.addEventListener('change', function () { showState(el); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[data-rule]').forEach(function (el) { if (!showState(el)) ok = false; });
      if (ok) toast(form.getAttribute('data-success') || 'Данные сохранены');
      else {
        var first = form.querySelector('.field--error input, .field--error textarea, .field--error select');
        if (first) first.focus();
      }
    });
  });

  // 2. Вкладки; содержимое отмеченных вкладок загружается при первом открытии
  document.querySelectorAll('[data-tabs]').forEach(function (tabs) {
    tabs.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabs.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var scope = document.querySelector(tabs.getAttribute('data-tabs'));
        scope.querySelectorAll(':scope > .tab-panel').forEach(function (p) { p.classList.remove('active'); });
        var panel = scope.querySelector(btn.getAttribute('data-target'));
        panel.classList.add('active');
        var tpl = panel.getAttribute('data-lazy');
        if (tpl && !panel.getAttribute('data-loaded')) {
          panel.innerHTML = '<div class="loading">Загрузка…</div>';
          panel.setAttribute('data-loaded', '1');
          setTimeout(function () { panel.innerHTML = document.getElementById(tpl).innerHTML; }, 300);
        }
      });
    });
  });

  // 3. Сортировка списков и таблиц
  document.querySelectorAll('[data-sort-for]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      var box = document.querySelector(sel.getAttribute('data-sort-for'));
      var p = sel.value.split('-'), key = p[0], dir = p[1] === 'desc' ? -1 : 1;
      var items = Array.prototype.slice.call(box.children);
      items.sort(function (a, b) {
        var x = a.getAttribute('data-' + key), y = b.getAttribute('data-' + key);
        var nx = parseFloat(x), ny = parseFloat(y);
        return (isNaN(nx) || isNaN(ny) ? x.localeCompare(y, 'ru') : nx - ny) * dir;
      });
      items.forEach(function (i) { box.appendChild(i); });
    });
  });

  // 4. Количество и итоговая сумма корзины
  function fmt(n) { return n.toLocaleString('ru-RU') + ' ₽'; }
  function recalc() {
    var total = 0, cnt = 0;
    document.querySelectorAll('[data-cart-row]').forEach(function (r) {
      var q = +r.querySelector('.qty input').value, p = +r.getAttribute('data-price');
      r.querySelector('[data-sum]').textContent = fmt(q * p);
      total += q * p; cnt += q;
    });
    var t = document.getElementById('cart-total'); if (t) t.textContent = fmt(total);
    var c = document.getElementById('cart-count'); if (c) c.textContent = cnt + ' шт.';
  }
  document.querySelectorAll('.qty').forEach(function (q) {
    var inp = q.querySelector('input'), b = q.querySelectorAll('button');
    b[0].addEventListener('click', function () { inp.value = Math.max(1, +inp.value - 1); recalc(); });
    b[1].addEventListener('click', function () { inp.value = Math.min(+inp.max || 99, +inp.value + 1); recalc(); });
    inp.addEventListener('change', recalc);
  });
  document.querySelectorAll('[data-remove]').forEach(function (b) {
    b.addEventListener('click', function () { b.closest('[data-cart-row]').remove(); recalc(); });
  });
  recalc();

  // 5. Раскрывающиеся заказы (шапка — детейл)
  document.querySelectorAll('.order__head').forEach(function (h) {
    h.addEventListener('click', function () { h.parentNode.classList.toggle('open'); });
  });

  // 6. Счётчик символов
  document.querySelectorAll('textarea[data-counter]').forEach(function (t) {
    var out = document.querySelector(t.getAttribute('data-counter')), max = t.maxLength;
    function u() { out.textContent = t.value.length + ' / ' + max; }
    t.addEventListener('input', u); u();
  });

  // 7. Подсветка выбранной строки таблицы
  document.querySelectorAll('table[data-select] tbody tr').forEach(function (tr) {
    tr.addEventListener('click', function () {
      tr.parentNode.querySelectorAll('tr').forEach(function (r) { r.classList.remove('selected'); });
      tr.classList.add('selected');
    });
  });

  // 8. Комментарий обязателен при доработке и отказе
  var dec = document.querySelectorAll('input[name=decision]'), cm = document.getElementById('decision-comment');
  if (dec.length && cm) {
    dec.forEach(function (r) {
      r.addEventListener('change', function () {
        var need = r.value !== 'ok';
        cm.setAttribute('data-rule', need ? 'required' : '');
        document.getElementById('comment-label').classList.toggle('req', need);
        showState(cm);
      });
    });
  }

  // 9. Открытие вкладки регистрации по якорю
  if (location.hash === '#register') {
    var rb = document.querySelector('[data-target="#t-reg"]');
    if (rb) rb.click();
  }

  // 10. Кнопки без серверной части
  document.querySelectorAll('[data-toast]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); toast(b.getAttribute('data-toast')); });
  });
})();
