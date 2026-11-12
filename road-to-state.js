(function () {
  'use strict';
  const target = new Date(2026, 10, 28, 0, 0, 0, 0);
  const nextDay = new Date(2026, 10, 29, 0, 0, 0, 0);
  const value = document.getElementById('days-left');
  const note = document.getElementById('days-note');

  function updateDaysLeft(now = new Date()) {
    if (now >= target && now < nextDay) {
      value.textContent = 'Tournament day';
      note.textContent = 'Your next adventure is here. Good luck, Vihaan!';
      return;
    }
    if (now >= nextDay) {
      value.textContent = 'Fayetteville';
      note.textContent = 'Tournament day has passed. Your next great move is ahead.';
      return;
    }
    const minutesLeft = Math.ceil((target.getTime() - now.getTime()) / 60000);
    const daysLeft = Math.floor(minutesLeft / (24 * 60));
    if (daysLeft < 2) {
      const hoursLeft = Math.floor((minutesLeft % (24 * 60)) / 60);
      const minutesRemainder = minutesLeft % 60;
      value.textContent = `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} · ${hoursLeft} ${hoursLeft === 1 ? 'hour' : 'hours'} · ${minutesRemainder} ${minutesRemainder === 1 ? 'minute' : 'minutes'}`;
      note.textContent = 'Your next adventure is getting close. Keep making your next great move.';
    } else {
      value.textContent = `${daysLeft} days`;
      note.textContent = 'You’re getting ready, one good move at a time.';
    }
  }

  function localDay() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function attachChecklist(listId, statusId, storageKey) {
    const list = document.getElementById(listId);
    const status = document.getElementById(statusId);
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { saved = {}; }
    list.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.checked = saved[input.dataset.id] === true;
      input.addEventListener('change', () => {
        saved[input.dataset.id] = input.checked;
        try {
          localStorage.setItem(storageKey, JSON.stringify(saved));
          status.textContent = 'Saved on this device.';
        } catch {
          status.textContent = 'This browser could not save the checkmark.';
        }
      });
    });
  }

  const menu = document.getElementById('road-menu');
  const navLinks = document.getElementById('road-nav-links');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('is-open', open);
  });

  updateDaysLeft();
  window.setInterval(updateDaysLeft, 60000);
  attachChecklist('practice-list', 'practice-status', `vihaanRoadPractice-${localDay()}`);
  attachChecklist('morning-list', 'morning-status', 'vihaanRoadMorning-v1');
})();
