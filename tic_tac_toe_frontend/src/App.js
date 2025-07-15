import React, { useState, useEffect } from "react";
import "./App.css";

// Color theme config based on requirements
const THEME_VARS = {
  "--bg-primary": "#fff",
  "--bg-secondary": "#f8f9fa",
  "--text-primary": "#212121",
  "--text-secondary": "#1976d2", // primary color for trusted accent text (used for current player)
  "--border-color": "#cfd8dc",
  "--tile-o": "#1976d2", // Primary blue
  "--tile-x": "#424242", // Secondary (dark)
  "--accent-color": "#ffeb3b", // Bright yellow
  "--button-bg": "#1976d2",
  "--button-text": "#fff",
  "--button-secondary": "#424242",
  "--shadow": "0 2px 8px rgba(25, 118, 210, 0.10)",
};

// Board winning lines
const WIN_COMBINATIONS = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6],
];

// PUBLIC_INTERFACE
function App() {
  // board: 0-8; null, "X", or "O"
  const [board, setBoard] = useState(Array(9).fill(null));
  // "X" always starts
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null); // "X","O","draw", or null
  const [scores, setScores] = useState({ X: 0, O: 0 });
  // track whether to highlight win animation
  const [winningLine, setWinningLine] = useState(null);

  // Set up light color vars on mount
  useEffect(() => {
    Object.keys(THEME_VARS).forEach((k) => {
      document.documentElement.style.setProperty(k, THEME_VARS[k]);
    });
  }, []);

  // Compute winner or draw after each turn
  useEffect(() => {
    const check = calculateWinner(board);
    if (check && check.type === "win") {
      setWinner(check.player);
      setWinningLine(check.line);
      setScores((prev) => ({
        ...prev,
        [check.player]: prev[check.player] + 1,
      }));
    } else if (check && check.type === "draw") {
      setWinner("draw");
      setWinningLine(null);
    } else {
      setWinner(null);
      setWinningLine(null);
    }
  }, [board]);

  // PUBLIC_INTERFACE
  const handleClick = (idx) => {
    if (board[idx] || winner) return;
    const nextBoard = board.slice();
    nextBoard[idx] = xIsNext ? "X" : "O";
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext((prev) => (winner === "draw" ? prev : !prev)); // swap starter if someone just won
    setWinner(null);
    setWinningLine(null);
  };

  // Returns UI for a single tic-tac-toe square
  function Square({ value, onClick, highlighted }) {
    return (
      <button
        className="ttt-square"
        style={{
          color: value === "X" ? "var(--tile-x)" : value === "O" ? "var(--tile-o)" : "var(--text-primary)",
          backgroundColor: highlighted ? "var(--accent-color)" : "#fff",
          fontWeight: highlighted ? 700 : 500,
          cursor: value || winner ? "not-allowed" : "pointer",
          boxShadow: highlighted ? THEME_VARS["--shadow"] : undefined,
        }}
        aria-label={value ? `${value} mark` : "Empty square"}
        onClick={onClick}
        disabled={!!value || !!winner}
      >
        {value}
      </button>
    );
  }

  // Board rendering
  function Board() {
    return (
      <div className="ttt-board">
        {board.map((val, idx) => {
          let highlighted = false;
          if (winningLine && winningLine.includes(idx)) highlighted = true;
          return (
            <Square
              key={idx}
              value={val}
              onClick={() => handleClick(idx)}
              highlighted={highlighted}
            />
          );
        })}
      </div>
    );
  }

  // Player panel/status
  function StatusBar() {
    let text, color;
    if (winner === "X" || winner === "O") {
      text = `Player ${winner} wins! 🎉`;
      color = winner === "X" ? "var(--tile-x)" : "var(--tile-o)";
    } else if (winner === "draw") {
      text = `It's a draw! 😮`;
      color = "var(--accent-color)";
    } else {
      text = `Turn: Player ${xIsNext ? "X" : "O"}`;
      color = xIsNext ? "var(--tile-x)" : "var(--tile-o)";
    }
    return (
      <div className="ttt-status" style={{ color, fontWeight: 600 }}>{text}</div>
    );
  }

  // Score row
  function ScorePanel() {
    return (
      <div className="ttt-score-panel">
        <span className="ttt-score ttt-score-x" style={{ color: "var(--tile-x)" }}>
          X: {scores.X}
        </span>
        <span className="ttt-score ttt-score-o" style={{ color: "var(--tile-o)" }}>
          O: {scores.O}
        </span>
      </div>
    );
  }

  // Central wrapper/presentation/layout
  return (
    <div className="App" style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <main className="ttt-main">
        <h1 className="ttt-title" style={{ color: "var(--tile-x)", marginBottom: 8 }}>Tic Tac Toe</h1>
        <ScorePanel />
        <Board />
        <StatusBar />
        <div className="ttt-buttons">
          <button className="ttt-btn ttt-btn-restart" onClick={restartGame}>Restart Game</button>
        </div>
        <footer className="ttt-footer">
          <span>
            Player <span style={{ color: "var(--tile-x)" }}>X</span> = <strong className="font-x">X</strong>;
            Player <span style={{ color: "var(--tile-o)" }}>O</span> = <strong className="font-o">O</strong>
          </span>
          <span style={{ marginLeft: 10, fontSize: 12, color: "#aaa" }}>
            Modern light theme, PVP mode, responsive design
          </span>
        </footer>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function calculateWinner(board) {
  for (let line of WIN_COMBINATIONS) {
    const [a, b, c] = line;
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return { type: "win", player: board[a], line };
    }
  }
  if (board.every(Boolean)) {
    return { type: "draw" };
  }
  return null;
}

export default App;
