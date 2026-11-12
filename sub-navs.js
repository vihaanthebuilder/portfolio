(() => {
  const groups = [
    { name: 'Chess', pages: [['chess.html', 'Chess'], ['gameroom.html', 'Game Room']] },
    { name: 'LEGO', pages: [['lego.html', 'LEGO Lab'], ['hall-of-fame.html', 'Hall of Fame'], ['cruise-ship.html', 'Cruise Ship'], ['build-of-the-week.html', 'Build of the Week']] },
    { name: 'Play', pages: [['games.html', 'Games'], ['comics.html', 'Comics']] },
    { name: 'Words', pages: [['authors-room.html', "Author's Room"], ['notebook.html', 'Notebook'], ['spelling-bee.html', 'Spelling Bee']] },
    { name: 'Me', pages: [['goals.html', 'Goals'], ['badges.html', 'Badges']] },
  ];
  const allPages = new Map(groups.flatMap(group => group.pages.map(([href, label]) => [href, { href, label, group }])));
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  let groupSetIndex = 0;
  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };

  function makeGroups(className, sourceLinks) {
    const setId = groupSetIndex++;
    const host = make('div', `subnav-groups ${className}`);
    const extras = new Map(groups.map(group => [group.name, []]));
    sourceLinks.forEach(link => {
      const href = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
      if (!allPages.has(href) && href) {
        const label = link.querySelector('.mnd-title')?.textContent.trim() || link.textContent.trim();
        const destination = `${href} ${label}`;
        let group = null;
        if (/lego|ship|build|hall/i.test(destination)) group = groups[1];
        else if (/author|notebook|spell|word|book/i.test(destination)) group = groups[3];
        else if (/game|chess/i.test(destination)) group = groups[0];
        else if (/goal|badge|home|index|profile/i.test(destination)) group = groups[4];
        group ||= groups.find(item => item.pages.some(([page]) => page === current)) || groups[4];
        extras.get(group.name).push({ href: link.getAttribute('href'), label });
      }
    });
    groups.forEach((group, index) => {
      const id = `subnav-menu-${setId}-${index}`;
      const section = make('div', 'subnav-group');
      const button = make('button', 'subnav-trigger', group.name);
      let lastPointerType = '';
      button.type = 'button';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', id);
      button.setAttribute('aria-haspopup', 'true');
      const caret = make('span', 'subnav-caret', '▾');
      caret.setAttribute('aria-hidden', 'true');
      button.append(caret);
      const list = make('ul', 'subnav-menu');
      list.id = id;
      list.hidden = true;
      group.pages.concat(extras.get(group.name).map(item => [item.href, item.label])).forEach(([href, label]) => {
        const item = make('li', '');
        const link = make('a', 'subnav-link', label);
        link.href = href;
        if (href.toLowerCase() === current) {
          link.setAttribute('aria-current', 'page');
          item.classList.add('is-current');
          section.classList.add('contains-current');
        }
        item.append(link);
        list.append(item);
      });
      function setOpen(open) {
        list.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
        section.classList.toggle('is-open', open);
      }
      button.addEventListener('pointerdown', event => { lastPointerType = event.pointerType; });
      button.addEventListener('click', event => {
        event.stopPropagation();
        const shouldOpen = lastPointerType === 'touch' ? list.hidden : (event.detail > 0 ? true : list.hidden);
        lastPointerType = '';
        host.querySelectorAll('.subnav-group').forEach(other => {
          other.querySelector('.subnav-menu').hidden = true;
          other.querySelector('.subnav-trigger').setAttribute('aria-expanded', 'false');
          other.classList.remove('is-open');
        });
        setOpen(shouldOpen);
      });
      section.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') setOpen(true);
      });
      section.addEventListener('pointerleave', event => {
        if (event.pointerType === 'mouse') setOpen(false);
      });
      section.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          setOpen(false);
          button.focus();
        }
      });
      list.addEventListener('click', event => {
        if (event.target.closest('a')) setOpen(false);
      });
      section.append(button, list);
      host.append(section);
    });
    return host;
  }

  function convert(container, kind) {
    if (!container || container.dataset.subnavReady) return;
    const links = Array.from(container.querySelectorAll('a'));
    const groupsHost = makeGroups(kind, links);
    container.replaceChildren(groupsHost);
    container.dataset.subnavReady = 'true';
  }

  // The homepage and pages using the shared renderer have desktop links in .center.
  document.querySelectorAll('#topnav .center').forEach(node => convert(node, 'subnav-desktop'));
  // Older feature pages have their own responsive navigation containers.
  document.querySelectorAll('.gr-nav-links, .bee-nav-links').forEach(node => convert(node, 'subnav-desktop'));
  // The homepage's mobile drawer uses the same grouped destinations.
  document.querySelectorAll('.mnd-links').forEach(node => convert(node, 'subnav-drawer'));

  // Build of the Week predates the site navigation; give it the same grouped bar.
  if (current === 'build-of-the-week.html' && !document.querySelector('#topnav, .gr-nav, .bee-nav')) {
    const nav = make('nav', 'subnav-standalone');
    nav.setAttribute('aria-label', 'Main navigation');
    const logo = make('a', 'subnav-logo', 'vihaan.');
    logo.href = 'index.html';
    const links = make('div', 'subnav-standalone-links');
    links.append(makeGroups('subnav-desktop', []));
    const right = make('div', 'subnav-right');
    const card = make('button', 'subnav-card', '🃏 CARD');
    card.type = 'button';
    const status = make('span', 'subnav-status', 'vihaanworld — building lego');
    right.append(card, status);
    nav.append(logo, links, right);
    document.body.prepend(nav);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('.subnav-group')) return;
    document.querySelectorAll('.subnav-group.is-open').forEach(section => {
      section.classList.remove('is-open');
      section.querySelector('.subnav-trigger').setAttribute('aria-expanded', 'false');
      section.querySelector('.subnav-menu').hidden = true;
    });
  });
})();
