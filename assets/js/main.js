(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const menuButton = $('.menu-toggle');
  const navigation = $('.main-nav');
  const navLinks = $$('.main-nav a[href^="#"]');
  const copyButton = $('.copy-email');
  const toast = $('.toast');
  const currentYear = $('#current-year');
  const progress = $('.scroll-progress span');
  const reveals = $$('.reveal');

  const editorTabs = $$('[data-editor-tab]');
  const editorPanels = $$('[data-editor-panel]');
  const editorPosition = $('#editor-position');
  const editorLanguage = $('#editor-language');
  const sidebarFiles = $$('[data-sidebar-file]');
  const runButton = $('[data-run-editor]');

  const terminal = $('[data-workspace-terminal]');
  const terminalToggle = $('[data-terminal-toggle]');
  const terminalClose = $('[data-terminal-close]');
  const terminalForm = $('[data-terminal-form]');
  const terminalInput = $('#terminal-input');
  const terminalOutput = $('#terminal-output');

  const projectDetails = $$('.repo-inspect');
  const projectFilters = $$('[data-project-filter]');
  const projectItems = $$('.repo-item[data-project-stack]');
  const projectCount = $('#project-count');

  const commandDialog = $('[data-command-dialog]');
  const commandTriggers = $$('[data-command-palette]');
  const commandClose = $('[data-command-close]');
  const commandSearch = $('[data-command-search]');
  const commandList = $('[data-command-list]');
  const commandEmpty = $('[data-command-empty]');

  const editorStatus = {
    profile: { position: 'Ln 9, Col 1', language: 'JSON' },
    api: { position: 'Ln 9, Col 1', language: 'HTTP' },
    docker: { position: 'Ln 9, Col 1', language: 'YAML' }
  };

  const projectUrls = {
    justraduz: 'https://github.com/TeamGHCP/JusTraduz',
    zokyo: 'https://github.com/PietroTamanini/Zokyo',
    oab: 'https://github.com/PietroTamanini/API-consulta-OAB',
    api: 'https://github.com/PietroTamanini/API-consulta-OAB'
  };

  let activeEditor = 'profile';
  let previousFocus = null;
  let commandSelection = 0;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => toast.classList.remove('show'), 1800);
  };

  const setMenuState = (open, { restoreFocus = false } = {}) => {
    if (!menuButton || !navigation) return;

    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    navigation.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);

    if (open) navigation.querySelector('a')?.focus({ preventScroll: true });
    else if (restoreFocus) menuButton.focus({ preventScroll: true });
  };

  const closeMenu = (options) => setMenuState(false, options);

  menuButton?.addEventListener('click', () => {
    setMenuState(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  navLinks.forEach((link) => link.addEventListener('click', () => closeMenu()));

  document.addEventListener('click', (event) => {
    if (menuButton?.getAttribute('aria-expanded') !== 'true') return;
    if (navigation?.contains(event.target) || menuButton.contains(event.target)) return;
    closeMenu();
  });

  const desktopMedia = window.matchMedia('(min-width: 761px)');
  desktopMedia.addEventListener?.('change', (event) => {
    if (event.matches) closeMenu();
  });

  const setActiveNavigation = (sectionId) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${sectionId}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const sections = $$('main section[id]');
  reveals.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${(index % 3) * 55}ms`);
  });

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (active) setActiveNavigation(active.target.id);
    }, { rootMargin: '-24% 0px -60%', threshold: [0.01, 0.12, 0.25] });

    sections.forEach((section) => sectionObserver.observe(section));

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6%', threshold: 0.08 });

    reveals.forEach((item) => revealObserver.observe(item));
  } else {
    reveals.forEach((item) => item.classList.add('visible'));
  }

  const activateEditorTab = (name, { focus = false } = {}) => {
    const status = editorStatus[name];
    if (!status) return;
    activeEditor = name;

    editorTabs.forEach((tab) => {
      const active = tab.dataset.editorTab === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus({ preventScroll: true });
    });

    editorPanels.forEach((panel) => {
      const active = panel.dataset.editorPanel === name;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });

    sidebarFiles.forEach((button) => {
      const active = button.dataset.sidebarFile === name;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (editorPosition) editorPosition.textContent = status.position;
    if (editorLanguage) editorLanguage.textContent = status.language;
  };

  editorTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activateEditorTab(tab.dataset.editorTab);
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });

    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + editorTabs.length) % editorTabs.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % editorTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = editorTabs.length - 1;

      const nextTab = editorTabs[nextIndex];
      activateEditorTab(nextTab.dataset.editorTab, { focus: true });
      nextTab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  });

  sidebarFiles.forEach((button) => {
    button.addEventListener('click', () => activateEditorTab(button.dataset.sidebarFile));
  });

  const initialEditorTab = editorTabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || editorTabs[0];
  if (initialEditorTab) activateEditorTab(initialEditorTab.dataset.editorTab);

  $$('.code-lines li').forEach((line, index) => {
    line.tabIndex = 0;
    line.setAttribute('aria-label', `Linha ${index + 1}. Clique para alternar breakpoint.`);

    const toggleBreakpoint = () => {
      line.classList.toggle('breakpoint');
      if (editorPosition) editorPosition.textContent = `Ln ${index + 1}, Col 1`;
      showToast(line.classList.contains('breakpoint') ? `breakpoint on line ${index + 1}` : `breakpoint removed`);
    };

    line.addEventListener('click', toggleBreakpoint);
    line.addEventListener('keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      toggleBreakpoint();
    });
  });

  const setTerminalState = (open, { focus = false } = {}) => {
    if (!terminal) return;
    terminal.classList.toggle('open', open);
    terminal.setAttribute('aria-hidden', String(!open));
    terminalToggle?.classList.toggle('active', open);
    terminalToggle?.setAttribute('aria-label', open ? 'Fechar terminal' : 'Abrir terminal');
    if (open && focus) window.setTimeout(() => terminalInput?.focus(), reducedMotion ? 0 : 180);
  };

  const appendTerminalLine = (text, className = '') => {
    if (!terminalOutput) return;
    const line = document.createElement('p');
    if (className) line.className = className;
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  };

  const appendTerminalCommand = (command) => {
    if (!terminalOutput) return;
    const line = document.createElement('p');
    const prompt = document.createElement('span');
    prompt.className = 'terminal-prompt';
    prompt.textContent = 'pietro@dev:~$';
    line.append(prompt, document.createTextNode(` ${command}`));
    terminalOutput.appendChild(line);
  };

  const scrollToSection = (selector) => {
    const section = $(selector);
    if (!section) return false;
    section.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    return true;
  };

  const applyProjectFilter = (filter) => {
    let visible = 0;

    projectFilters.forEach((button) => {
      const active = button.dataset.projectFilter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    projectItems.forEach((item) => {
      const stack = (item.dataset.projectStack || '').split(/\s+/);
      const matches = filter === 'all' || stack.includes(filter);
      item.hidden = !matches;

      if (matches) {
        visible += 1;
        item.classList.remove('filter-enter');
        void item.offsetWidth;
        item.classList.add('filter-enter');
        window.setTimeout(() => item.classList.remove('filter-enter'), 320);
      } else {
        const details = $('.repo-inspect', item);
        if (details?.open) details.open = false;
      }
    });

    if (projectCount) projectCount.textContent = String(visible);
    return visible;
  };

  projectFilters.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.projectFilter;
      const total = applyProjectFilter(filter);
      showToast(`${total} project${total === 1 ? '' : 's'} · ${filter}`);
    });
  });

  const syncProjectDetails = (details) => {
    const summary = $('summary', details);
    const label = $('.inspect-label', details);
    const expanded = details.open;
    summary?.setAttribute('aria-expanded', String(expanded));
    if (label) label.textContent = expanded ? 'close project' : 'inspect project';
  };

  projectDetails.forEach((details) => {
    syncProjectDetails(details);
    details.addEventListener('toggle', () => {
      if (details.open) {
        projectDetails.forEach((other) => {
          if (other !== details && other.open) other.open = false;
        });
      }
      syncProjectDetails(details);
    });
  });

  const terminalCommands = {
    help: () => [
      'commands: help, whoami, about, projects, stack, contact, pwd, clear',
      'open: github, linkedin, justraduz, zokyo, oab',
      'filters: filter all | python | php | docker'
    ],
    whoami: () => ['Pietro Tamanini · Backend Developer', 'Python · PHP · APIs · MySQL · Docker · Linux'],
    about: () => {
      scrollToSection('#about');
      return ['opening ./about'];
    },
    projects: () => {
      scrollToSection('#projects');
      return ['JusTraduz/', 'Zokyo/', 'API-consulta-OAB/'];
    },
    ls: () => ['about/', 'projects/', 'stack.yml', 'git.log', 'contact.sh'],
    stack: () => {
      scrollToSection('#stack');
      return ['backend: Python, PHP, Flask, REST APIs', 'data: MySQL, MariaDB, SQLAlchemy', 'infra: Docker, Linux, Nginx, Gunicorn'];
    },
    contact: () => {
      scrollToSection('#contact');
      return ['pietro@tamanini.dev.br', 'Joinville, Santa Catarina'];
    },
    pwd: () => ['/home/pietro/portfolio'],
    date: () => [new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'medium' }).format(new Date())]
  };

  const executeTerminalCommand = (rawCommand) => {
    const command = rawCommand.trim();
    if (!command) return;

    appendTerminalCommand(command);
    const [base, ...args] = command.toLowerCase().split(/\s+/);

    if (base === 'clear') {
      if (terminalOutput) terminalOutput.innerHTML = '';
      return;
    }

    if (base === 'open') {
      const target = args[0];
      if (target === 'github') window.open('https://github.com/PietroTamanini', '_blank', 'noopener,noreferrer');
      else if (target === 'linkedin') window.open('https://www.linkedin.com/in/pietrotamanini/', '_blank', 'noopener,noreferrer');
      else if (projectUrls[target]) window.open(projectUrls[target], '_blank', 'noopener,noreferrer');
      else {
        appendTerminalLine(`open: target not found: ${target || '(empty)'}`, 'terminal-error');
        return;
      }
      appendTerminalLine(`opening ${target}...`, 'terminal-success');
      return;
    }

    if (base === 'filter') {
      const filter = args[0] || 'all';
      const allowed = ['all', 'python', 'php', 'docker'];
      if (!allowed.includes(filter)) {
        appendTerminalLine(`filter: invalid option '${filter}'`, 'terminal-error');
        return;
      }
      const count = applyProjectFilter(filter);
      scrollToSection('#projects');
      appendTerminalLine(`${count} repositories match '${filter}'`, 'terminal-success');
      return;
    }

    const handler = terminalCommands[base];
    if (!handler) {
      appendTerminalLine(`command not found: ${base}. type 'help'.`, 'terminal-error');
      return;
    }

    const lines = handler();
    lines.forEach((line, index) => {
      window.setTimeout(() => appendTerminalLine(line, index === 0 ? 'terminal-success' : ''), reducedMotion ? 0 : index * 45);
    });
  };

  terminalToggle?.addEventListener('click', () => {
    setTerminalState(!terminal?.classList.contains('open'), { focus: true });
  });
  terminalClose?.addEventListener('click', () => setTerminalState(false));
  terminalForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = terminalInput?.value || '';
    if (terminalInput) terminalInput.value = '';
    executeTerminalCommand(command);
  });

  const runActiveFile = () => {
    const output = {
      profile: ['$ node profile.json', 'profile loaded · 6 technologies · status ready'],
      api: ['$ send api.http', 'GET /health 200 OK · database connected · 42ms'],
      docker: ['$ docker compose up -d', 'app started · database healthy · network ready']
    }[activeEditor];

    if (!output) return;
    setTerminalState(true);
    runButton?.classList.add('running');
    appendTerminalCommand(output[0].replace(/^\$\s*/, ''));

    window.setTimeout(() => {
      appendTerminalLine(output[1], 'terminal-success');
      runButton?.classList.remove('running');
    }, reducedMotion ? 0 : 420);
  };

  runButton?.addEventListener('click', runActiveFile);

  const getVisibleCommandItems = () => {
    if (!commandList) return [];
    return $$('button:not([hidden]), a:not([hidden])', commandList);
  };

  const updateCommandSelection = (index) => {
    const items = getVisibleCommandItems();
    if (!items.length) return;
    commandSelection = (index + items.length) % items.length;
    items.forEach((item, itemIndex) => item.classList.toggle('selected', itemIndex === commandSelection));
    items[commandSelection].scrollIntoView({ block: 'nearest' });
  };

  const filterCommands = () => {
    if (!commandSearch || !commandList) return;
    const query = commandSearch.value.trim().toLowerCase();
    const items = $$('button, a', commandList);
    let visible = 0;

    items.forEach((item) => {
      const haystack = `${item.textContent} ${item.dataset.keywords || ''}`.toLowerCase();
      const matches = !query || haystack.includes(query);
      item.hidden = !matches;
      item.classList.remove('selected');
      if (matches) visible += 1;
    });

    if (commandEmpty) commandEmpty.hidden = visible > 0;
    commandSelection = 0;
    if (visible) updateCommandSelection(0);
  };

  const setCommandDialogState = (open) => {
    if (!commandDialog) return;

    commandDialog.classList.toggle('open', open);
    commandDialog.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('dialog-open', open);

    if (open) {
      previousFocus = document.activeElement;
      if (commandSearch) commandSearch.value = '';
      filterCommands();
      window.setTimeout(() => commandSearch?.focus(), reducedMotion ? 0 : 60);
    } else if (previousFocus instanceof HTMLElement) {
      previousFocus.focus({ preventScroll: true });
    }
  };

  commandTriggers.forEach((button) => button.addEventListener('click', () => setCommandDialogState(true)));
  commandClose?.addEventListener('click', () => setCommandDialogState(false));
  commandSearch?.addEventListener('input', filterCommands);

  commandList?.addEventListener('click', (event) => {
    const target = event.target.closest('button, a');
    if (!target) return;

    if (target.dataset.commandTarget) {
      event.preventDefault();
      setCommandDialogState(false);
      scrollToSection(target.dataset.commandTarget);
    } else if (target.dataset.commandAction === 'terminal') {
      event.preventDefault();
      setCommandDialogState(false);
      setTerminalState(true, { focus: true });
    } else {
      setCommandDialogState(false);
    }
  });

  commandSearch?.addEventListener('keydown', (event) => {
    const items = getVisibleCommandItems();
    if (!items.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      updateCommandSelection(commandSelection + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      updateCommandSelection(commandSelection - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      items[commandSelection]?.click();
    }
  });

  $$('.stack-row').forEach((row) => {
    row.tabIndex = 0;
    row.setAttribute('aria-selected', 'false');
    const activate = () => {
      const selected = !row.classList.contains('is-active');
      $$('.stack-row').forEach((other) => {
        other.classList.remove('is-active');
        other.setAttribute('aria-selected', 'false');
      });
      if (selected) {
        row.classList.add('is-active');
        row.setAttribute('aria-selected', 'true');
        const key = $('.stack-key', row)?.textContent?.replace(':', '') || 'stack';
        showToast(`${key} selected`);
      }
    };
    row.addEventListener('click', activate);
    row.addEventListener('keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      activate();
    });
  });

  const copyTextFallback = (text) => {
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.inset = '0 auto auto -9999px';
    document.body.appendChild(input);
    input.select();

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    } finally {
      input.remove();
    }
    return copied;
  };

  copyButton?.addEventListener('click', async () => {
    const email = copyButton.dataset.email;
    if (!email) return;

    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
        copied = true;
      } else copied = copyTextFallback(email);
    } catch {
      copied = copyTextFallback(email);
    }

    showToast(copied ? 'email copied' : email);
    if (!copied) return;

    const originalLabel = copyButton.textContent;
    copyButton.textContent = 'copied';
    copyButton.disabled = true;
    window.setTimeout(() => {
      copyButton.textContent = originalLabel;
      copyButton.disabled = false;
    }, 1400);
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;

    if (event.key === 'Escape') {
      if (commandDialog?.classList.contains('open')) {
        event.preventDefault();
        setCommandDialogState(false);
        return;
      }
      if (menuButton?.getAttribute('aria-expanded') === 'true') {
        closeMenu({ restoreFocus: true });
        return;
      }
      if (terminal?.classList.contains('open') && !typing) setTerminalState(false);
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      setCommandDialogState(!commandDialog?.classList.contains('open'));
      return;
    }

    if (event.ctrlKey && event.key === '`') {
      event.preventDefault();
      setTerminalState(!terminal?.classList.contains('open'), { focus: true });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !commandDialog?.classList.contains('open')) {
      event.preventDefault();
      runActiveFile();
      return;
    }

    if (event.key === '/' && !typing && !commandDialog?.classList.contains('open')) {
      event.preventDefault();
      setTerminalState(true, { focus: true });
    }

    if (commandDialog?.classList.contains('open') && event.key === 'Tab') {
      const focusable = $$('input, button:not([hidden]), a:not([hidden])', commandDialog).filter((element) => element.tabIndex !== -1);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  };

  const requestProgressUpdate = () => {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(updateProgress);
  };

  window.addEventListener('scroll', requestProgressUpdate, { passive: true });
  window.addEventListener('resize', requestProgressUpdate);
  updateProgress();

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();
