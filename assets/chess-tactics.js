import { Chess } from './chess-tactics/chess.js';

const puzzles = Array.isArray(window.CHESS_TACTICS_PUZZLES) ? window.CHESS_TACTICS_PUZZLES : [];
const boardElement = document.getElementById('chess-board');
const numberElement = document.getElementById('puzzle-number');
const labelElement = document.getElementById('puzzle-label');
const sideElement = document.getElementById('side-to-move');
const turnDot = document.getElementById('turn-dot');
const feedback = document.getElementById('move-feedback');
const sourceLink = document.getElementById('source-game');
const nextButton = document.getElementById('next-puzzle');
const solvedCount = document.getElementById('solved-count');
const files = 'abcdefgh';
const pieceGlyph = { wk:'♔', wq:'♕', wr:'♖', wb:'♗', wn:'♘', wp:'♙', bk:'♚', bq:'♛', br:'♜', bb:'♝', bn:'♞', bp:'♟' };
const storageKey = 'vihaanChessTacticsSolved_v1';
let index = 0;
let game;
let selected = null;
let legalTargets = [];
let finished = false;
let lastMove = null;

if (!puzzles.length) {
  feedback.textContent = 'Your puzzle is getting ready. Try again in a moment.';
  nextButton.hidden = true;
} else {
  game = new Chess(puzzles[index].fen);
  init();
}

function readSolved() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return new Set(Array.isArray(value) ? value.filter(id => puzzles.some(puzzle => puzzle.id === id)) : []);
  } catch { return new Set(); }
}
const solved = readSolved();
solvedCount.textContent = String(solved.size);

function init() {
  nextButton.addEventListener('click', nextPuzzle);
  boardElement.addEventListener('click', onSquareClick);
  boardElement.addEventListener('dragstart', onDragStart);
  boardElement.addEventListener('dragover', event => {
    if (event.target.closest('[data-square]')) event.preventDefault();
  });
  boardElement.addEventListener('drop', onDrop);
  render();
}

function currentPuzzle() { return puzzles[index]; }
function describePiece(piece) {
  if (!piece) return 'empty';
  const names = { k:'king', q:'queen', r:'rook', b:'bishop', n:'knight', p:'pawn' };
  return `${piece.color === 'w' ? 'white' : 'black'} ${names[piece.type]}`;
}
function squareName(row, col, side) {
  const visualRow = side === 'white' ? row : 7 - row;
  const visualCol = side === 'white' ? col : 7 - col;
  return `${files[visualCol]}${8 - visualRow}`;
}
function render() {
  const puzzle = currentPuzzle();
  const side = puzzle.side;
  const sideCode = side[0];
  numberElement.textContent = `Puzzle ${index + 1} of ${puzzles.length}`;
  labelElement.textContent = puzzle.label;
  sideElement.textContent = `${side[0].toUpperCase()}${side.slice(1)} to move`;
  turnDot.className = `turn-dot ${side}`;
  boardElement.dataset.orientation = side;
  boardElement.replaceChildren();
  const rows = game.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = squareName(row, col, side);
      const visualRow = side === 'white' ? row : 7 - row;
      const visualCol = side === 'white' ? col : 7 - col;
      const piece = rows[visualRow][visualCol];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `chess-square ${((visualRow + visualCol) % 2 === 0) ? 'light' : 'dark'}`;
      button.dataset.square = square;
      button.setAttribute('aria-label', `${square}, ${describePiece(piece)}`);
      if (piece?.color === sideCode && !finished) button.draggable = true;
      if (selected === square) button.classList.add('is-selected');
      if (legalTargets.includes(square)) {
        button.classList.add('is-legal');
        if (piece) button.classList.add('is-capture');
      }
      if (lastMove && (lastMove.from === square || lastMove.to === square)) button.classList.add('is-last');
      if (piece) {
        const glyph = document.createElement('span');
        glyph.className = `chess-piece ${piece.color === 'b' ? 'black-piece' : 'white-piece'}`;
        glyph.textContent = pieceGlyph[`${piece.color}${piece.type}`];
        glyph.setAttribute('aria-hidden', 'true');
        button.append(glyph);
      }
      if (col === 0) {
        const coord = document.createElement('span');
        coord.className = 'square-coord';
        coord.textContent = square[1];
        coord.setAttribute('aria-hidden', 'true');
        button.append(coord);
      }
      if (row === 7) {
        const coord = document.createElement('span');
        coord.className = 'square-coord';
        coord.style.left = 'auto';
        coord.style.right = '3px';
        coord.style.top = 'auto';
        coord.style.bottom = '2px';
        coord.textContent = square[0];
        coord.setAttribute('aria-hidden', 'true');
        button.append(coord);
      }
      boardElement.append(button);
    }
  }
}

function onSquareClick(event) {
  const squareElement = event.target.closest('[data-square]');
  if (!squareElement || finished) return;
  const target = squareElement.dataset.square;
  const piece = game.get(target);
  if (selected && legalTargets.includes(target)) {
    attemptMove(selected, target);
    return;
  }
  if (piece?.color === currentPuzzle().side[0]) {
    selected = target;
    legalTargets = game.moves({ square: target, verbose: true }).map(move => move.to);
    feedback.textContent = legalTargets.length ? 'Choose one of the highlighted squares.' : 'That piece has no move here. Try another one.';
    render();
    return;
  }
  if (selected) {
    feedback.textContent = 'Not quite — try another move.';
    selected = null;
    legalTargets = [];
    render();
  } else {
    feedback.textContent = 'Choose one of your pieces to begin.';
  }
}

function onDragStart(event) {
  const square = event.target.closest('[data-square]');
  if (!square || finished) { event.preventDefault(); return; }
  const piece = game.get(square.dataset.square);
  if (!piece || piece.color !== currentPuzzle().side[0]) { event.preventDefault(); return; }
  event.dataTransfer.setData('text/plain', square.dataset.square);
  event.dataTransfer.effectAllowed = 'move';
  selected = square.dataset.square;
  legalTargets = game.moves({ square: selected, verbose: true }).map(move => move.to);
}

function onDrop(event) {
  const square = event.target.closest('[data-square]');
  if (!square || finished) return;
  event.preventDefault();
  const from = event.dataTransfer.getData('text/plain');
  if (from) attemptMove(from, square.dataset.square);
}

function attemptMove(from, to) {
  let move;
  try { move = game.move({ from, to, promotion: 'q' }); }
  catch {
    feedback.textContent = 'That move is not available. Choose a highlighted square.';
    selected = null;
    legalTargets = [];
    render();
    return;
  }
  if (!move) {
    feedback.textContent = 'That move is not available. Choose a highlighted square.';
    selected = null;
    legalTargets = [];
    render();
    return;
  }
  const played = `${move.from}${move.to}${move.promotion || ''}`;
  if (played !== currentPuzzle().solution) {
    game = new Chess(currentPuzzle().fen);
    selected = null;
    legalTargets = [];
    feedback.textContent = 'Not quite — try another move.';
    render();
    return;
  }
  selected = null;
  legalTargets = [];
  lastMove = { from: move.from, to: move.to };
  finished = true;
  feedback.textContent = 'Beautiful find — that is checkmate!';
  sourceLink.href = currentPuzzle().source;
  sourceLink.hidden = false;
  nextButton.disabled = false;
  if (!solved.has(currentPuzzle().id)) {
    solved.add(currentPuzzle().id);
    try { localStorage.setItem(storageKey, JSON.stringify([...solved])); } catch { /* The current round still works without storage. */ }
    solvedCount.textContent = String(solved.size);
  }
  render();
}

function nextPuzzle() {
  if (!finished) return;
  index = (index + 1) % puzzles.length;
  game = new Chess(currentPuzzle().fen);
  selected = null;
  legalTargets = [];
  finished = false;
  lastMove = null;
  feedback.textContent = 'Your move whenever you\'re ready.';
  sourceLink.hidden = true;
  sourceLink.removeAttribute('href');
  nextButton.disabled = true;
  render();
}
