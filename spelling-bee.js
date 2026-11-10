(() => {
  'use strict';
  const M = window.SpellingBeeModel;
  const bank = Array.isArray(window.SpellingWords) ? window.SpellingWords : [];
  const $ = id => document.getElementById(id);
  const state = M.readState();
  let round = [];
  let position = 0;
  let correct = 0;
  let level = '';
  let roundKind = 'standard';
  let roundMisses = [];
  let answered = false;
  let storageReady = M.writeState(state);

  const navToggle = $('bee-menu-toggle');
  const navLinks = $('bee-nav-links');
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('open', open);
  });
  navLinks.addEventListener('keydown', event => {
    if (event.key === 'Escape') { navToggle.setAttribute('aria-expanded', 'false'); navLinks.classList.remove('open'); navToggle.focus(); }
  });

  function setFeedback(message, tone = '') {
    const feedback = $('feedback');
    feedback.textContent = message;
    feedback.className = `bee-feedback${tone ? ` ${tone}` : ''}`;
  }
  function updateStorageMessage() {
    if (!storageReady) {
      $('daily-message').textContent = 'Practice is ready. This browser may not be able to save your progress.';
    }
  }
  function saveState() {
    storageReady = M.writeState(state);
    updateStorageMessage();
    renderStreak();
    renderTrickyCount();
  }
  function renderStreak() {
    const summary = M.streakSummary(state);
    $('current-streak').textContent = String(summary.current);
    $('best-streak').textContent = String(summary.best);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const holder = $('streak-days');
    holder.replaceChildren();
    summary.days.forEach(item => {
      const date = M.parseDateKey(item.date);
      const day = document.createElement('span');
      day.className = `bee-day${item.earned ? ' earned' : ''}${item.today ? ' today' : ''}`;
      const label = document.createElement('span');
      label.textContent = date ? dayNames[date.getDay()] : '';
      const dot = document.createElement('span');
      dot.className = 'bee-day-dot';
      dot.textContent = item.earned ? '✓' : '·';
      day.append(label, dot);
      holder.append(day);
    });
    const lastDay = state.completedDays.at(-1);
    const missedStreak = lastDay && lastDay < M.shiftDateKey(M.localDateKey(), -1);
    $('daily-message').textContent = summary.completedToday
      ? "Today's goal is done. Nice work!"
      : missedStreak ? 'Start a new streak today!' : 'Finish a full ten-word round to reach today’s goal.';
    updateStorageMessage();
  }
  function renderTrickyCount() {
    const count = state.trickyWords.length;
    const playableCount = state.trickyWords.filter(saved => bank.some(item => item.word.toLowerCase() === saved.word && item.level === saved.level)).length;
    $('tricky-count').textContent = count === 0
      ? 'Your list is empty. Missed words will be saved here for another try.'
      : playableCount === 0
        ? 'Those saved words are not in this practice set right now. Ask a grown-up to check the list.'
        : `${playableCount} ${playableCount === 1 ? 'word is' : 'words are'} ready for another try.`;
    $('practice-tricky').disabled = playableCount === 0;
  }
  function voiceAvailable() {
    try {
      return Boolean(window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function' && window.speechSynthesis.getVoices().length);
    } catch (_) { return false; }
  }
  function speak(text) {
    try {
      if (!voiceAvailable()) throw new Error('Voice unavailable');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.82;
      const voice = window.speechSynthesis.getVoices().find(item => /^en(-|_)/i.test(item.lang));
      if (voice) utterance.voice = voice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (_) {
      setFeedback("I can't speak right now. Ask a grown-up to check the voice setting; your answer stays hidden.", 'kind');
      return false;
    }
  }
  function currentWord() { return round[position]; }
  function focusAnswer() {
    $('answer-input').disabled = false;
    $('check-answer').disabled = false;
    $('answer-input').value = '';
    $('answer-input').focus();
  }
  function showPrompt(speakNow) {
    const word = currentWord();
    if (!word) return;
    answered = false;
    $('round-progress').textContent = `Word ${position + 1} of ${round.length}`;
    $('prompt-title').textContent = 'Your word is ready.';
    $('hint-text').hidden = true;
    $('hint-text').textContent = '';
    $('letter-feedback').hidden = true;
    $('letter-feedback').replaceChildren();
    $('next-word').hidden = true;
    $('answer-form').hidden = false;
    setFeedback('');
    focusAnswer();
    if (speakNow) speak(word.word);
  }
  function beginRound(selected, kind, selectedLevel) {
    if (!selected.length) return;
    round = selected;
    position = 0;
    correct = 0;
    level = selectedLevel;
    roundKind = kind;
    roundMisses = [];
    $('level-picker').hidden = true;
    $('score-panel').hidden = true;
    $('round-panel').hidden = false;
    $('round-kind').textContent = kind === 'standard' ? `${levelLabel(level)} · Standard round` : 'Tricky word practice';
    $('round-heading').textContent = 'Listen for your word';
    showPrompt(true);
  }
  function levelLabel(value) {
    return ({ 'warm-up': 'Warm-Up', 'bee-ready': 'Bee Ready', champion: 'Champion' })[value] || 'Practice';
  }
  function showHint(which) {
    const word = currentWord();
    if (!word) return;
    const text = which === 'definition' ? word.definition : word.sentence;
    // A sentence hint needs the target word to be a real example, but a bee
    // prompt must not show its spelling. Keep the source sentence intact and
    // mask the target only while it is displayed on screen.
    const visibleText = which === 'sentence'
      ? text.replace(new RegExp(word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '_____')
      : text;
    $('hint-text').textContent = visibleText;
    $('hint-text').hidden = false;
    speak(text);
  }
  function markLetters(answer, target) {
    const holder = $('letter-feedback');
    holder.replaceChildren();
    const label = document.createElement('span');
    label.className = 'bee-letters-label';
    label.textContent = 'Letters in the answer: green means that letter was in the right place.';
    holder.append(label);
    Array.from(target).forEach((letter, index) => {
      const chip = document.createElement('span');
      const matches = answer[index] && answer[index].toLowerCase() === letter.toLowerCase();
      chip.className = `bee-letter ${matches ? 'match' : 'miss'}`;
      chip.textContent = letter;
      chip.setAttribute('aria-label', matches ? `${letter}, right place` : `${letter}, try this place`);
      holder.append(chip);
    });
    holder.hidden = false;
  }
  function revealAnswer(wasCorrect, answer) {
    const word = currentWord();
    answered = true;
    $('answer-input').disabled = true;
    $('check-answer').disabled = true;
    $('answer-form').hidden = false;
    if (wasCorrect) {
      correct += 1;
      state.trickyWords = M.correctTrickyWord(state, word.word).trickyWords;
      $('prompt-title').textContent = word.word;
      setFeedback('You got it! Nice spelling.', 'good');
    } else {
      const updated = M.missTrickyWord(state, word.word, word.level);
      state.trickyWords = updated.trickyWords;
      if (!roundMisses.some(item => item.word.toLowerCase() === word.word.toLowerCase())) roundMisses.push(word);
      $('prompt-title').textContent = word.word;
      setFeedback('Tricky one — it is on your list now. Keep going!', 'kind');
      markLetters(answer, word.word);
    }
    saveState();
    $('next-word').textContent = position + 1 >= round.length ? 'See my score' : 'Next';
    $('next-word').hidden = false;
    $('next-word').focus();
  }
  function submitAnswer(event) {
    event.preventDefault();
    if (answered) return;
    const answer = $('answer-input').value.trim();
    if (!answer) {
      setFeedback('Type your best try first. You can listen again or ask for a hint.', 'kind');
      $('answer-input').focus();
      return;
    }
    revealAnswer(answer.toLocaleLowerCase() === currentWord().word.toLocaleLowerCase(), answer);
  }
  function nextWord() {
    if (!answered) return;
    position += 1;
    if (position >= round.length) { finishRound(); return; }
    showPrompt(true);
  }
  function finishRound() {
    $('round-panel').hidden = true;
    $('score-panel').hidden = false;
    if (round.length === 10) {
      const updated = M.completeStandardRound(state);
      state.completedDays = updated.completedDays;
      state.bestStreak = updated.bestStreak;
      saveState();
    }
    $('score-line').textContent = `${correct} of ${round.length} — ${scorePraise(correct, round.length)}`;
    $('score-message').textContent = round.length === 10
      ? 'You finished a full ten-word round. Today’s goal is complete! Every bit of practice helps.'
      : 'Nice practice! A short tricky-word round does not count toward today’s goal.';
    const area = $('score-tricky');
    area.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = roundMisses.length ? 'Your tricky words from this round' : 'No tricky words this round';
    area.append(heading);
    if (roundMisses.length) {
      const list = document.createElement('ul');
      roundMisses.forEach(item => { const li = document.createElement('li'); li.textContent = item.word; list.append(li); });
      area.append(list);
    } else {
      const note = document.createElement('p');
      note.className = 'bee-no-tricky';
      note.textContent = 'Great careful spelling. Keep that confidence going!';
      area.append(note);
    }
    $('new-round').focus();
  }
  function scorePraise(score, total) {
    if (score === total) return 'perfect focus!';
    if (score >= total * 0.8) return 'strong round!';
    if (score >= total * 0.5) return 'great practice!';
    return 'you kept learning!';
  }
  function leaveRound() {
    $('round-panel').hidden = true;
    $('score-panel').hidden = true;
    $('level-picker').hidden = false;
    document.querySelector('[data-level]')?.focus();
  }

  document.querySelectorAll('[data-level]').forEach(button => {
    button.addEventListener('click', () => {
      const chosen = button.dataset.level;
      beginRound(M.selectLevelWords(bank, chosen, 10), 'standard', chosen);
    });
  });
  $('practice-tricky').addEventListener('click', () => {
    const entries = state.trickyWords.map(saved => bank.find(item => item.word.toLowerCase() === saved.word && item.level === saved.level)).filter(Boolean);
    const selected = M.shuffleWords(entries, 10);
    if (selected.length) beginRound(selected, 'tricky', 'tricky');
  });
  $('answer-form').addEventListener('submit', submitAnswer);
  $('hear-again').addEventListener('click', () => { if (currentWord()) speak(currentWord().word); });
  $('show-definition').addEventListener('click', () => showHint('definition'));
  $('show-sentence').addEventListener('click', () => showHint('sentence'));
  $('next-word').addEventListener('click', nextWord);
  $('leave-round').addEventListener('click', leaveRound);
  $('new-round').addEventListener('click', leaveRound);
  $('answer-input').addEventListener('keydown', event => {
    if (event.key === 'Enter' && !answered) { event.preventDefault(); $('answer-form').requestSubmit(); }
  });
  renderStreak();
  renderTrickyCount();
})();
