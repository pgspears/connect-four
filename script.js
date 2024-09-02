// script.js

// Constants
const ROWS = 6;
const COLS = 7;
const PLAYER = 'red';
const AI = 'yellow';

// Game state
let board = [];
let currentPlayer = PLAYER;
let gameActive = true;

// Initialize the game board
function initBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        let row = [];
        for (let c = 0; c < COLS; c++) {
            row.push(null);
        }
        board.push(row);
    }
}

// Render the board on the screen
function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = ''; // Clear existing board
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            if (board[r][c]) {
                cell.classList.add(board[r][c]);
            }
            cell.addEventListener('click', handleClick);
            boardElement.appendChild(cell);
        }
    }
}

// Handle a player's move
function handleClick(event) {
    if (!gameActive) return;

    const col = event.target.dataset.col;
    const row = getAvailableRow(col);
    if (row !== null) {
        board[row][col] = currentPlayer;
        renderBoard();
        if (checkWin(currentPlayer)) {
            document.getElementById('status').textContent = `${currentPlayer === PLAYER ? 'You' : 'AI'} Win!`;
            highlightWinningCells();
            gameActive = false;
        } else if (isBoardFull()) {
            document.getElementById('status').textContent = 'Draw!';
            gameActive = false;
        } else {
            currentPlayer = currentPlayer === PLAYER ? AI : PLAYER;
            if (currentPlayer === AI) {
                aiMove();
            } else {
                document.getElementById('status').textContent = 'Your turn!';
            }
        }
    }
}

// Get the lowest available row in a column
function getAvailableRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][col]) {
            return r;
        }
    }
    return null;
}

// Check if the board is full
function isBoardFull() {
    for (let c = 0; c < COLS; c++) {
        if (!board[0][c]) {
            return false;
        }
    }
    return true;
}

// Check for a win condition
function checkWin(player) {
    // Check horizontal, vertical, and diagonal (both directions)
    return checkHorizontalWin(player) || checkVerticalWin(player) || checkDiagonalWin(player);
}

function checkHorizontalWin(player) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (board[r][c] === player && board[r][c + 1] === player && board[r][c + 2] === player && board[r][c + 3] === player) {
                return [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]];
            }
        }
    }
    return null;
}

function checkVerticalWin(player) {
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 3; r++) {
            if (board[r][c] === player && board[r + 1][c] === player && board[r + 2][c] === player && board[r + 3][c] === player) {
                return [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]];
            }
        }
    }
    return null;
}

function checkDiagonalWin(player) {
    // Diagonal from top-left to bottom-right
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (board[r][c] === player && board[r + 1][c + 1] === player && board[r + 2][c + 2] === player && board[r + 3][c + 3] === player) {
                return [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]];
            }
        }
    }
    // Diagonal from bottom-left to top-right
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (board[r][c] === player && board[r - 1][c + 1] === player && board[r - 2][c + 2] === player && board[r - 3][c + 3] === player) {
                return [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]];
            }
        }
    }
    return null;
}

// Highlight the winning cells
function highlightWinningCells() {
    const winningCells = checkHorizontalWin(currentPlayer) || checkVerticalWin(currentPlayer) || checkDiagonalWin(currentPlayer);
    if (winningCells) {
        winningCells.forEach(([r, c]) => {
            const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            cell.classList.add('highlight');
        });
    }
}

// AI move using Minimax algorithm
function aiMove() {
    document.getElementById('status').textContent = 'AI is thinking...';
    setTimeout(() => {
        const { col } = minimax(board, 4, true);
        const row = getAvailableRow(col);
        board[row][col] = AI;
        renderBoard();
        if (checkWin(AI)) {
            document.getElementById('status').textContent = 'AI Wins!';
            highlightWinningCells();
            gameActive = false;
        } else if (isBoardFull()) {
            document.getElementById('status').textContent = 'Draw!';
            gameActive = false;
        } else {
            currentPlayer = PLAYER;
            document.getElementById('status').textContent = 'Your turn!';
        }
    }, 500);
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    const scores = {
        red: -10,
        yellow: 10,
        tie: 0
    };

    if (checkWin(PLAYER)) return { score: scores.red };
    if (checkWin(AI)) return { score: scores.yellow };
    if (isBoardFull()) return { score: scores.tie };

    if (depth === 0) return { score: 0 };

    if (isMaximizing) {
        let maxEval = -Infinity;
        let bestCol = null;
        for (let c = 0; c < COLS; c++) {
            const row = getAvailableRow(c);
            if (row !== null) {
                board[row][c] = AI;
                const eval = minimax(board, depth - 1, false).score;
                board[row][c] = null;
                if (eval > maxEval) {
                    maxEval = eval;
                    bestCol = c;
                }
            }
        }
        return { score: maxEval, col: bestCol };
    } else {
        let minEval = Infinity;
        let bestCol = null;
        for (let c = 0; c < COLS; c++) {
            const row = getAvailableRow(c);
            if (row !== null) {
                board[row][c] = PLAYER;
                const eval = minimax(board, depth - 1, true).score;
                board[row][c] = null;
                if (eval < minEval) {
                    minEval = eval;
                    bestCol = c;
                }
            }
        }
        return { score: minEval, col: bestCol };
    }
}

// Restart the game
function restartGame() {
    gameActive = true;
    currentPlayer = PLAYER;
    initBoard();
    renderBoard();
    document.getElementById('status').textContent = 'Your turn!';
}

// Initialize game
document.getElementById('restart').addEventListener('click', restartGame);
initBoard();
renderBoard();
