// Pack 2 uses only Stockfish 19 depth-24+ verified positions from Vihaan's
// real rated classical games where he missed the engine's winning move.
window.CHESS_TACTICS_PUZZLES = [
  {
    id: 'hcq5faBB-25', gameId: 'hcq5faBB', moveNumber: 25, side: 'white',
    fen: '3r1rk1/2p3pp/2p5/1pNqPb2/p2P1p2/1PP2R1P/P5P1/R2Q2K1 w - - 0 25',
    solution: 'f3f4', played: 'b4',
    line: 'Rxf4 a3 Qe2 Be6 Rxf8+ Rxf8 Qe3 Bf5 Re1 h6 Qg3 Qf7 e6 Qe7 Qe5 Bg6 Na6 Rf5 Qe3 Rg5 Re2 Rf5',
    date: '2026.07.22', source: 'https://lichess.org/hcq5faBB', label: 'Win a pawn', theme: 'Win a pawn'
  },
  {
    id: 'XEqCG0bg-10', gameId: 'XEqCG0bg', moveNumber: 10, side: 'black',
    fen: 'r1b1k1nr/p1p1q1pp/2pb1p2/4p3/2P2P2/4PNP1/PB1P3P/RN1QK2R b KQkq - 0 10',
    solution: 'e5f4', played: 'Ba6',
    line: 'exf4 gxf4 Nh6 Qb3 Bg4 O-O c5 Nc3 O-O Qc2 Rab8 Rf2 Qe6 Re1 Bh3 Nh4 Qxc4 Ba1 Qf7 Ne4 Qh5 Ng2 Bf5 Qc4+ Qf7 Qxf7+ Rxf7',
    date: '2026.06.01', source: 'https://lichess.org/XEqCG0bg', label: 'Win a pawn', theme: 'Win a pawn'
  },
  {
    id: 'OU4OCkBD-10', gameId: 'OU4OCkBD', moveNumber: 10, side: 'white',
    fen: 'r1bq1rk1/ppp2pp1/5nNp/3p4/1bBnP3/2NP4/PPPB1PPP/R2Q1RK1 w - - 0 10',
    solution: 'c3d5', played: 'Nxf8',
    line: 'Nxd5 Nxd5 c3 fxg6 Bxd5+ Kh7 cxb4 c6 Bc4 Qe7 Bc3 Rd8 a3 Be6 Bxe6 Qxe6 Re1 b6 h3 c5 bxc5 bxc5 f4',
    date: '2026.05.25', source: 'https://lichess.org/OU4OCkBD', label: 'Win a pawn', theme: 'Win a pawn'
  },
  {
    id: 'WiCfML4J-12', gameId: 'WiCfML4J', moveNumber: 12, side: 'white',
    fen: 'r2qk1nr/p1pn1pbp/b3p1p1/3pP3/1p1P1B2/1BN2N2/PPPQ1PPP/2KRR3 w kq - 0 12',
    solution: 'c3d5', played: 'Nb1',
    line: 'Nxd5 Bb5 Bg5 Qc8 Nf6+ Ndxf6 exf6 Nxf6 Qxb4 c6 Qc5 a5 a4 Ba6 Ne5 Bf8 Qc3 Nd5 Qxc6+ Qxc6 Nxc6 Bb7 Bxd5',
    date: '2026.04.29', source: 'https://lichess.org/WiCfML4J', label: 'Win material', theme: 'Win material'
  },
  {
    id: 'hcq5faBB-10', gameId: 'hcq5faBB', moveNumber: 10, side: 'white',
    fen: 'r1bq1rk1/1ppp1ppp/p1n2n2/4p3/2B1P3/2NPPN1P/PPP3P1/R2Q1RK1 w - - 0 10',
    solution: 'f3g5', played: 'd4',
    line: 'Ng5 d6 Nd5 Be6 Nxf6+ gxf6 Nxe6 fxe6 Qg4+ Kh8 Bxe6 Qe7 Rf3 Qg7 Qh4 Qg5 Qf2 Rae8 Bd5 Re7 Rf1 Rg7 Kh1',
    date: '2026.07.22', source: 'https://lichess.org/hcq5faBB', label: 'Attack on f7', theme: 'Attack on f7'
  },
  {
    id: 'WlWvF2uV-14', gameId: 'WlWvF2uV', moveNumber: 14, side: 'white',
    fen: 'r2q1rk1/pbpp1pp1/7p/np2P2Q/4n3/1BP2N2/P1P2PPP/R1B2RK1 w - - 1 14',
    solution: 'c1h6', played: 'Ba3',
    line: 'Bxh6 gxh6 Qg6+ Kh8 Qxh6+ Kg8 Qg6+ Kh8 Bxf7 Rxf7 Qxf7 Qe8 Qf4 Qg6 Nh4 Qg5 Qxg5 Nxg5 Rfd1 Bc6 Ng6+ Kg7 Ne7 Rd8 Nxc6',
    date: '2026.04.12', source: 'https://lichess.org/WlWvF2uV', label: 'Sacrifice', theme: 'Sacrifice'
  },
  {
    id: 'hcq5faBB-34', gameId: 'hcq5faBB', moveNumber: 34, side: 'white',
    fen: '3r2k1/2p3pp/2p3q1/1p2P1N1/pP1P4/2r4P/P2R2Q1/R5K1 w - - 0 34',
    solution: 'a1f1', played: 'Rb1',
    line: 'Rf1 a3 Rdf2 h6 Ne4 Qxg2+ Rxg2 Re3 Ng3 Kh8 Nf5 Re4 Ne7 c5 bxc5 b4 Ng6+ Kg8 Kh2 b3 axb3 Re3 Ne7+ Kh7 Nf5 Rxb3 e6',
    date: '2026.07.22', source: 'https://lichess.org/hcq5faBB', label: 'Winning move', theme: 'Winning move'
  },
  {
    id: '2zv590kA-28', gameId: '2zv590kA', moveNumber: 28, side: 'black',
    fen: '2R3k1/6pp/p4p2/P5r1/1P2p1b1/8/5PPP/5RK1 b - - 4 28',
    solution: 'g4c8', played: 'Kf7',
    line: 'Bxc8 h4 Re5 Rc1 Bd7 Rc7 Bb5 Rc8+ Kf7 Rc7+ Kg6 Rc3 Rd5 Rg3+ Kf7 Rc3 Rd1+ Kh2',
    date: '2026.04.24', source: 'https://lichess.org/2zv590kA', label: 'Win the rook', theme: 'Win the rook'
  },
  {
    id: 'Lb8tuAJC-28', gameId: 'Lb8tuAJC', moveNumber: 28, side: 'white',
    fen: 'r4r2/2p2p1k/4b2p/p1q1PppQ/8/P5R1/2P2PPP/4R1K1 w - - 2 28',
    solution: 'g3h3', played: 'Rxg5',
    line: 'Rh3 Kg8 Qxh6 Qxf2+ Kxf2 a4 Qxg5#',
    date: '2026.06.06', source: 'https://lichess.org/Lb8tuAJC', label: 'Mate in 4', theme: 'Mate in 4'
  }
];
