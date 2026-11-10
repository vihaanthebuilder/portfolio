/* Local-only enhancement: the HTML already contains every deck fact. */
(() => {
  'use strict';
  const ship = document.querySelector('.cruise-ship');
  const controls = Array.from(document.querySelectorAll('[data-deck]'));
  const panels = Array.from(document.querySelectorAll('.cs-detail'));
  const announcement = document.getElementById('cs-announcement');
  const menu = document.getElementById('gr-menu');
  const links = document.getElementById('gr-nav-links');
  if (!ship || controls.length !== 4 || panels.length !== 4) return;

  function selectDeck(control, announce = true) {
    const id = control.getAttribute('href').slice(1);
    const panel = document.getElementById(id);
    if (!panel) return;
    const changed = control.getAttribute('aria-pressed') !== 'true';
    controls.forEach(item => item.setAttribute('aria-pressed', String(item === control)));
    panels.forEach(item => { item.hidden = item !== panel; });
    if (announce && changed) {
      announcement.textContent = `Deck ${control.dataset.deck}: ${panel.querySelector('h3').textContent}. ${panel.dataset.status}.`;
    }
  }

  controls.forEach(control => {
    control.setAttribute('role', 'button');
    control.setAttribute('aria-controls', control.getAttribute('href').slice(1));
    control.setAttribute('aria-label', `Deck ${control.dataset.deck}: ${control.querySelector('.cs-deck-name').textContent}. ${control.querySelector('.cs-status').textContent}.`);
    control.addEventListener('click', event => {
      event.preventDefault();
      selectDeck(control);
      control.focus({ preventScroll: true });
    });
    control.addEventListener('keydown', event => {
      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        selectDeck(control);
      }
    });
  });
  selectDeck(controls.find(control => control.dataset.deck === '2'), false);
  ship.classList.add('cs-enhanced');
  menu.hidden = false;
  function closeMenu() {
    links.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeMenu(); menu.focus(); }
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
})();
