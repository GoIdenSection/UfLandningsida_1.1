// === Elementreferenser ===
const header = document.querySelector('.header');
const toggleBtn = document.querySelector('.nav__toggle');
const navMenu = document.getElementById('navMenu');
const toast = document.getElementById('toast');

function setHeaderHeightVar(){
  if (!header) return;
  const h = header.offsetHeight;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}
setHeaderHeightVar();
window.addEventListener('resize', setHeaderHeightVar);


// === Mobilmeny ===
if (toggleBtn && navMenu) {
  toggleBtn.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', String(open));
    // Om menyn öppnas: se till att headern visas (så den inte är dold när menyn är framme)
    if (open) header && header.classList.remove('header--hidden');
  });

  // Stäng meny vid klick på länk (mobil)
  navMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// === Smooth scroll för interna länkar ===
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// === Video/Lightbox ===
const videoButtons = document.querySelectorAll('.video-thumb');
videoButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const sel = btn.getAttribute('data-video');
    const dlg = document.querySelector(sel);
    if (dlg && typeof dlg.showModal === 'function') {
      dlg.showModal();
    }
  });
});

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    const dlg = btn.closest('dialog');
    if (dlg) dlg.close();
  });
});

// === Header: hide on scroll down, show on scroll up (var som helst på sidan) ===
(function initSmartHeader(){
  if (!header) return;
  const navMenu = document.getElementById('navMenu');
  const toggleBtn = document.querySelector('.nav__toggle');

  let lastY = window.scrollY || 0;
  const DELTA = 6;     // ignorera mikroskak
  let ticking = false;

  function update(){
    const y = window.scrollY || 0;
    const dy = y - lastY;
    const goingDown = dy > DELTA;
    const goingUp   = dy < -DELTA;

    // Lyft skugga när man inte är allra högst upp
    if (y > 8) header.classList.add('header--elevated');
    else header.classList.remove('header--elevated');

    // Dölj inte när mobilmeny är öppen
    const menuOpen = navMenu && navMenu.classList.contains('is-open');

    if (!menuOpen && goingDown) {
      header.classList.add('header--hidden');    // försvinn på nedåt-scroll
    } else if (goingUp) {
      header.classList.remove('header--hidden'); // dyker upp direkt på uppåt-scroll
    }

    lastY = y;
    ticking = false;
  }

  function onScroll(){
    if (!ticking){
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  // Init + listeners
  update();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Om användaren öppnar mobilmenyn -> visa headern
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => header.classList.remove('header--hidden'));
    toggleBtn.addEventListener('focus', () => header.classList.remove('header--hidden'));
  }
})();


// === Prisberäkning för beställning ===
const form = document.getElementById('orderForm');
const priceEl = document.getElementById('price');
const qtyEl = document.getElementById('qty');
const variantEl = document.getElementById('variant');
const couponEl = document.getElementById('coupon');

const basePrices = { 'usb-c': 179, '3in1': 219 };

function calcPrice() {
  if (!priceEl || !variantEl || !qtyEl) return;
  const variant = variantEl.value;
  const qty = Math.max(1, parseInt(qtyEl.value || '1', 10));
  let price = (basePrices[variant] || 179) * qty;

  const code = (couponEl?.value || '').trim().toUpperCase();
  if (code === 'VOL10') price *= 0.9;

  priceEl.textContent = `${Math.round(price)} kr`;
}
['change', 'keyup', 'input'].forEach(ev => {
  [qtyEl, variantEl, couponEl].forEach(el => el && el.addEventListener(ev, calcPrice));
});
calcPrice();

// === Helpers för formulär ===
function showError(input, msg) {
  const field = input.closest('.form__field');
  if (!field) return;
  const small = field.querySelector('.error');
  if (small) small.textContent = msg || '';
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
}
function clearErrors(formEl) {
  formEl.querySelectorAll('.error').forEach(e => e.textContent = '');
  formEl.querySelectorAll('[aria-invalid="true"]').forEach(el => el.setAttribute('aria-invalid','false'));
}
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-show');
  setTimeout(() => toast.classList.remove('is-show'), 2300);
}

// === Orderformulär (demo) ===
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(form);

    const name = form.name;
    const email = form.email;

    let valid = true;
    if (!name.value.trim()) { showError(name, 'Ange namn.'); valid = false; }
    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showError(email, 'Ogiltig e-post.'); valid = false; }

    if (!valid) return;

    const orderData = {
      name: name.value.trim(),
      email: email.value.trim(),
      variant: form.variant.value,
      color: form.color.value,
      qty: Math.max(1, parseInt(form.qty.value || '1', 10)),
      coupon: (form.coupon.value || '').trim().toUpperCase()
    };

    console.log('Order skickad (demo):', orderData);
    form.reset();
    calcPrice();
    showToast('Tack! Din beställning är mottagen – vi hör av oss via e-post.');
  });
}

// === Kontaktformulär (demo) ===
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(contactForm);

    const cname = contactForm.cname;
    const cemail = contactForm.cemail;
    const cmsg = contactForm.cmsg;
    let valid = true;

    if (!cname.value.trim()) { showError(cname, 'Ange namn.'); valid = false; }
    if (!cemail.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showError(cemail, 'Ogiltig e-post.'); valid = false; }
    if (cmsg.value.trim().length < 10) { showError(cmsg, 'Skriv minst 10 tecken.'); valid = false; }

    if (!valid) return;

    const payload = {
      name: cname.value.trim(),
      email: cemail.value.trim(),
      message: cmsg.value.trim()
    };
    console.log('Kontakt skickad (demo):', payload);
    contactForm.reset();
    showToast('Tack! Ditt meddelande har skickats.');
  });
}
