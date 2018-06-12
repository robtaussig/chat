const Board = require('../../../shared/chess/Board.js');

const pieceMap = {
  'r': '<span class="b" style="color: darkred">♜</span>',
  'n': '<span class="b" style="color: darkred">♞</span>',
  'b': '<span class="b" style="color: darkred">♝</span>',
  'q': '<span class="b" style="color: darkred">♛</span>',
  'k': '<span class="b" style="color: darkred">♚</span>',
  'p': '<span class="b" style="color: darkred">♟</span>',
  '-': '',
  'R': '<span class="w" style="color: lightseagreen">♜</span>',
  'N': '<span class="w" style="color: lightseagreen">♞</span>',
  'B': '<span class="w" style="color: lightseagreen">♝</span>',
  'Q': '<span class="w" style="color: lightseagreen">♛</span>',
  'K': '<span class="w" style="color: lightseagreen">♚</span>',
  'P': '<span class="w" style="color: lightseagreen">♟</span>'
};

const posMap = {
  'a8': 11,  'b8': 12,  'c8': 13,  'd8': 14,  'e8': 15,  'f8': 16,  'g8': 17,  'h8': 18,  'a7': 21, 'b7': 22,
  'c7': 23, 'd7': 24, 'e7': 25, 'f7': 26, 'g7': 27, 'h7': 28, 'a6': 31, 'b6': 32, 'c6': 33, 'd6': 34, 
  'e6': 35, 'f6': 36, 'g6': 37, 'h6': 38, 'a5': 41, 'b5': 42, 'c5': 43, 'd5': 44, 'e5': 45, 'f5': 46, 
  'g5': 47, 'h5': 48, 'a4': 51, 'b4': 52, 'c4': 53, 'd4': 54, 'e4': 55, 'f4': 56, 'g4': 57, 'h4': 58, 
  'a3': 61, 'b3': 62, 'c3': 63, 'd3': 64, 'e3': 65, 'f3': 66, 'g3': 67, 'h3': 68, 'a2': 71, 'b2': 72, 
  'c2': 73, 'd2': 74, 'e2': 75, 'f2': 76, 'g2': 77, 'h2': 78, 'a1': 81, 'b1': 82, 'c1': 83, 'd1': 84, 
  'e1': 85, 'f1': 86, 'g1': 87, 'h1': 88
};

module.exports = class Game {
  constructor(user) {
    this.users = {
      [user.id]: {
        user: user,
        color: 'w'
      }
    };
    this.currentTurn = user.id;
    this.board = new Board();
  }

  generateHtml(user) {
    let boardRepresentation = this.board.getBoard();
    let color = this.users[user.id].color;
    let currentPlayer = this.currentTurn === user.id;
    let white = '?';
    let black = '?';
    for (let user in this.users) {
      if (this.users[user] && this.users[user].color === 'w') {
        white = this.users[user].user.name;
      } else if (this.users[user] && this.users[user].color === 'b') {
        black = this.users[user].user.name;
      }
    }
    if (color === 'b') {
      return `
        <style>
          ul.chess-board { display: flex; flex-flow: column; justify-content: center; height: 100%; width: 100%; background-color: midnightblue; }
          .chess-board li { display: flex; flex-flow: row; justify-content: center; line-height: 3vw; height: 3vw; width: 100%; }
          .chess-board li.bottom { margin-left: 1.5vw }
          .chess-board li span.left { width: 3vw; text-align: center; font-weight: bold; background-color:seagreen; line-height: 3vw; }
          .chess-board li div { box-sizing: border-box; display: flex; justify-content: center; align-items; center; font-size:2.5vw; width:3vw; height:3vw; }
          .chess-board li span.bottom { font-weight: bold; width: 3vw; text-align:center; background-color:seagreen; line-height: 3vw; }
          .white { margin: 0 10px; color: white; display: flex; align-items: center; }
          .vs { margin: 0 10px; color: white; display: flex; align-items: center; }
          .black { margin: 0 10px; color: white; display: flex; align-items: center; }
          @media screen and (max-device-width: 480px) {
            ul.chess-board { height: 100vw!important; }
            span.w, span.b { font-size: 10vw; margin: auto auto; }
            .chess-board li { height: 12.5%; width: 100%; }
            .chess-board li.bottom { display: none; }
            .chess-board li span.left { display: none; }
            .chess-board li div { width:12.5%; height: 100%; }
            .chess-board li span.bottom { display: none; }
          }
        </style>
        <ul class="chess-board">
          <li>
            <span class="white"> ${white} </span>
            <span class="vs"> vs </span>
            <span class="black"> ${black} </span>
          </li>
          <li>
            <span class="left"> 1 </span>
            <div id="a1" style="background-color:black">${pieceMap[boardRepresentation[81]]}</div>
            <div id="b1" style="background-color:white">${pieceMap[boardRepresentation[82]]}</div>
            <div id="c1" style="background-color:black">${pieceMap[boardRepresentation[83]]}</div>
            <div id="d1" style="background-color:white">${pieceMap[boardRepresentation[84]]}</div>
            <div id="e1" style="background-color:black">${pieceMap[boardRepresentation[85]]}</div>
            <div id="f1" style="background-color:white">${pieceMap[boardRepresentation[86]]}</div>
            <div id="g1" style="background-color:black">${pieceMap[boardRepresentation[87]]}</div>
            <div id="h1" style="background-color:white">${pieceMap[boardRepresentation[88]]}</div>
          </li>
          <li>
            <span class="left"> 2 </span>
            <div id="a2" style="background-color:white">${pieceMap[boardRepresentation[71]]}</div>
            <div id="b2" style="background-color:black">${pieceMap[boardRepresentation[72]]}</div>
            <div id="c2" style="background-color:white">${pieceMap[boardRepresentation[73]]}</div>
            <div id="d2" style="background-color:black">${pieceMap[boardRepresentation[74]]}</div>
            <div id="e2" style="background-color:white">${pieceMap[boardRepresentation[75]]}</div>
            <div id="f2" style="background-color:black">${pieceMap[boardRepresentation[76]]}</div>
            <div id="g2" style="background-color:white">${pieceMap[boardRepresentation[77]]}</div>
            <div id="h2" style="background-color:black">${pieceMap[boardRepresentation[78]]}</div>
          </li>                                      
          <li>
            <span class="left"> 3 </span>
            <div id="a3" style="background-color:black">${pieceMap[boardRepresentation[61]]}</div>
            <div id="b3" style="background-color:white">${pieceMap[boardRepresentation[62]]}</div>
            <div id="c3" style="background-color:black">${pieceMap[boardRepresentation[63]]}</div>
            <div id="d3" style="background-color:white">${pieceMap[boardRepresentation[64]]}</div>
            <div id="e3" style="background-color:black">${pieceMap[boardRepresentation[65]]}</div>
            <div id="f3" style="background-color:white">${pieceMap[boardRepresentation[66]]}</div>
            <div id="g3" style="background-color:black">${pieceMap[boardRepresentation[67]]}</div>
            <div id="h3" style="background-color:white">${pieceMap[boardRepresentation[68]]}</div>
          </li>
          <li>
            <span class="left"> 4 </span>
            <div id="a4" style="background-color:white">${pieceMap[boardRepresentation[51]]}</div>
            <div id="b4" style="background-color:black">${pieceMap[boardRepresentation[52]]}</div>
            <div id="c4" style="background-color:white">${pieceMap[boardRepresentation[53]]}</div>
            <div id="d4" style="background-color:black">${pieceMap[boardRepresentation[54]]}</div>
            <div id="e4" style="background-color:white">${pieceMap[boardRepresentation[55]]}</div>
            <div id="f4" style="background-color:black">${pieceMap[boardRepresentation[56]]}</div>
            <div id="g4" style="background-color:white">${pieceMap[boardRepresentation[57]]}</div>
            <div id="h4" style="background-color:black">${pieceMap[boardRepresentation[58]]}</div>
          </li>
          <li>
            <span class="left"> 5 </span>
            <div id="a5" style="background-color:black">${pieceMap[boardRepresentation[41]]}</div>
            <div id="b5" style="background-color:white">${pieceMap[boardRepresentation[42]]}</div>
            <div id="c5" style="background-color:black">${pieceMap[boardRepresentation[43]]}</div>
            <div id="d5" style="background-color:white">${pieceMap[boardRepresentation[44]]}</div>
            <div id="e5" style="background-color:black">${pieceMap[boardRepresentation[45]]}</div>
            <div id="f5" style="background-color:white">${pieceMap[boardRepresentation[46]]}</div>
            <div id="g5" style="background-color:black">${pieceMap[boardRepresentation[47]]}</div>
            <div id="h5" style="background-color:white">${pieceMap[boardRepresentation[48]]}</div>
          </li>         
          <li>
            <span class="left"> 6 </span>
            <div id="a6" style="background-color:white">${pieceMap[boardRepresentation[31]]}</div>
            <div id="b6" style="background-color:black">${pieceMap[boardRepresentation[32]]}</div>
            <div id="c6" style="background-color:white">${pieceMap[boardRepresentation[33]]}</div>
            <div id="d6" style="background-color:black">${pieceMap[boardRepresentation[34]]}</div>
            <div id="e6" style="background-color:white">${pieceMap[boardRepresentation[35]]}</div>
            <div id="f6" style="background-color:black">${pieceMap[boardRepresentation[36]]}</div>
            <div id="g6" style="background-color:white">${pieceMap[boardRepresentation[37]]}</div>
            <div id="h6" style="background-color:black">${pieceMap[boardRepresentation[38]]}</div>
          </li>
          <li>
            <span class="left"> 7 </span>
            <div id="a7" style="background-color:black">${pieceMap[boardRepresentation[21]]}</div>
            <div id="b7" style="background-color:white">${pieceMap[boardRepresentation[22]]}</div>
            <div id="c7" style="background-color:black">${pieceMap[boardRepresentation[23]]}</div>
            <div id="d7" style="background-color:white">${pieceMap[boardRepresentation[24]]}</div>
            <div id="e7" style="background-color:black">${pieceMap[boardRepresentation[25]]}</div>
            <div id="f7" style="background-color:white">${pieceMap[boardRepresentation[26]]}</div>
            <div id="g7" style="background-color:black">${pieceMap[boardRepresentation[27]]}</div>
            <div id="h7" style="background-color:white">${pieceMap[boardRepresentation[28]]}</div>
          </li>
          <li>
            <span class="left"> 8 </span>
            <div id="a8" style="background-color:white">${pieceMap[boardRepresentation[11]]}</div>
            <div id="b8"  style="background-color:black">${pieceMap[boardRepresentation[12]]}</div>
            <div id="c8"  style="background-color:white">${pieceMap[boardRepresentation[13]]}</div>
            <div id="d8"  style="background-color:black">${pieceMap[boardRepresentation[14]]}</div>
            <div id="e8"  style="background-color:white">${pieceMap[boardRepresentation[15]]}</div>
            <div id="f8"  style="background-color:black">${pieceMap[boardRepresentation[16]]}</div>
            <div id="g8"  style="background-color:white">${pieceMap[boardRepresentation[17]]}</div>
            <div id="h8"  style="background-color:black">${pieceMap[boardRepresentation[18]]}</div>
          </li>
          <li class="bottom">
            <span class="bottom"> A </span>
            <span class="bottom"> B </span>
            <span class="bottom"> C </span>
            <span class="bottom"> D </span>
            <span class="bottom"> E </span>
            <span class="bottom"> F </span>
            <span class="bottom"> G </span>
            <span class="bottom"> H </span>
          </li>
        </ul>
      `;
    } else {
      return `
        <style>
          ul.chess-board { display: flex; flex-flow: column; justify-content: center; height: 100%; width: 100%; background-color: midnightblue; }
          .chess-board li { display: flex; flex-flow: row; justify-content: center; line-height: 3vw; height: 3vw; width: 100%; }
          .chess-board li.bottom { margin-left: 1.5vw }
          .chess-board li span.left { width: 3vw; text-align: center; font-weight: bold; background-color:seagreen; line-height: 3vw; }
          .chess-board li div { box-sizing: border-box; display: flex; justify-content: center; align-items; center; font-size:2.5vw; width:3vw; height:3vw; }
          .chess-board li span.bottom { font-weight: bold; width: 3vw; text-align:center; background-color:seagreen; line-height: 3vw; }
          .white { margin: 0 10px; color: white; display: flex; align-items: center; }
          .vs { margin: 0 10px; color: white; display: flex; align-items: center; }
          .black { margin: 0 10px; color: white; display: flex; align-items: center; }
          @media screen and (max-device-width: 480px) {
            ul.chess-board { height: 100vw!important; }
            span.w, span.b { font-size: 10vw; margin: auto auto; }
            .chess-board li { height: 12.5%; width: 100%; }
            .chess-board li.bottom { display: none; }
            .chess-board li span.left { display: none; }
            .chess-board li div { width:12.5%; height: 100%; }
            .chess-board li span.bottom { display: none; }
          }
        </style>
        <ul class="chess-board">
          <li>
            <span class="white"> ${white} </span>
            <span class="vs"> vs </span>
            <span class="black"> ${black} </span>
          </li>
          <li>
            <span class="left"> 8 </span>
            <div id="a8" style="background-color:white">${pieceMap[boardRepresentation[11]]}</div>
            <div id="b8"  style="background-color:black">${pieceMap[boardRepresentation[12]]}</div>
            <div id="c8"  style="background-color:white">${pieceMap[boardRepresentation[13]]}</div>
            <div id="d8"  style="background-color:black">${pieceMap[boardRepresentation[14]]}</div>
            <div id="e8"  style="background-color:white">${pieceMap[boardRepresentation[15]]}</div>
            <div id="f8"  style="background-color:black">${pieceMap[boardRepresentation[16]]}</div>
            <div id="g8"  style="background-color:white">${pieceMap[boardRepresentation[17]]}</div>
            <div id="h8"  style="background-color:black">${pieceMap[boardRepresentation[18]]}</div>
          </li>
          <li>
            <span class="left"> 7 </span>
            <div id="a7" style="background-color:black">${pieceMap[boardRepresentation[21]]}</div>
            <div id="b7" style="background-color:white">${pieceMap[boardRepresentation[22]]}</div>
            <div id="c7" style="background-color:black">${pieceMap[boardRepresentation[23]]}</div>
            <div id="d7" style="background-color:white">${pieceMap[boardRepresentation[24]]}</div>
            <div id="e7" style="background-color:black">${pieceMap[boardRepresentation[25]]}</div>
            <div id="f7" style="background-color:white">${pieceMap[boardRepresentation[26]]}</div>
            <div id="g7" style="background-color:black">${pieceMap[boardRepresentation[27]]}</div>
            <div id="h7" style="background-color:white">${pieceMap[boardRepresentation[28]]}</div>
          </li>
          <li>
            <span class="left"> 6 </span>
            <div id="a6" style="background-color:white">${pieceMap[boardRepresentation[31]]}</div>
            <div id="b6" style="background-color:black">${pieceMap[boardRepresentation[32]]}</div>
            <div id="c6" style="background-color:white">${pieceMap[boardRepresentation[33]]}</div>
            <div id="d6" style="background-color:black">${pieceMap[boardRepresentation[34]]}</div>
            <div id="e6" style="background-color:white">${pieceMap[boardRepresentation[35]]}</div>
            <div id="f6" style="background-color:black">${pieceMap[boardRepresentation[36]]}</div>
            <div id="g6" style="background-color:white">${pieceMap[boardRepresentation[37]]}</div>
            <div id="h6" style="background-color:black">${pieceMap[boardRepresentation[38]]}</div>
          </li>
          <li>
            <span class="left"> 5 </span>
            <div id="a5" style="background-color:black">${pieceMap[boardRepresentation[41]]}</div>
            <div id="b5" style="background-color:white">${pieceMap[boardRepresentation[42]]}</div>
            <div id="c5" style="background-color:black">${pieceMap[boardRepresentation[43]]}</div>
            <div id="d5" style="background-color:white">${pieceMap[boardRepresentation[44]]}</div>
            <div id="e5" style="background-color:black">${pieceMap[boardRepresentation[45]]}</div>
            <div id="f5" style="background-color:white">${pieceMap[boardRepresentation[46]]}</div>
            <div id="g5" style="background-color:black">${pieceMap[boardRepresentation[47]]}</div>
            <div id="h5" style="background-color:white">${pieceMap[boardRepresentation[48]]}</div>
          </li>
          <li>
            <span class="left"> 4 </span>
            <div id="a4" style="background-color:white">${pieceMap[boardRepresentation[51]]}</div>
            <div id="b4" style="background-color:black">${pieceMap[boardRepresentation[52]]}</div>
            <div id="c4" style="background-color:white">${pieceMap[boardRepresentation[53]]}</div>
            <div id="d4" style="background-color:black">${pieceMap[boardRepresentation[54]]}</div>
            <div id="e4" style="background-color:white">${pieceMap[boardRepresentation[55]]}</div>
            <div id="f4" style="background-color:black">${pieceMap[boardRepresentation[56]]}</div>
            <div id="g4" style="background-color:white">${pieceMap[boardRepresentation[57]]}</div>
            <div id="h4" style="background-color:black">${pieceMap[boardRepresentation[58]]}</div>
          </li>
          <li>
            <span class="left"> 3 </span>
            <div id="a3" style="background-color:black">${pieceMap[boardRepresentation[61]]}</div>
            <div id="b3" style="background-color:white">${pieceMap[boardRepresentation[62]]}</div>
            <div id="c3" style="background-color:black">${pieceMap[boardRepresentation[63]]}</div>
            <div id="d3" style="background-color:white">${pieceMap[boardRepresentation[64]]}</div>
            <div id="e3" style="background-color:black">${pieceMap[boardRepresentation[65]]}</div>
            <div id="f3" style="background-color:white">${pieceMap[boardRepresentation[66]]}</div>
            <div id="g3" style="background-color:black">${pieceMap[boardRepresentation[67]]}</div>
            <div id="h3" style="background-color:white">${pieceMap[boardRepresentation[68]]}</div>
          </li>
          <li>
            <span class="left"> 2 </span>
            <div id="a2" style="background-color:white">${pieceMap[boardRepresentation[71]]}</div>
            <div id="b2" style="background-color:black">${pieceMap[boardRepresentation[72]]}</div>
            <div id="c2" style="background-color:white">${pieceMap[boardRepresentation[73]]}</div>
            <div id="d2" style="background-color:black">${pieceMap[boardRepresentation[74]]}</div>
            <div id="e2" style="background-color:white">${pieceMap[boardRepresentation[75]]}</div>
            <div id="f2" style="background-color:black">${pieceMap[boardRepresentation[76]]}</div>
            <div id="g2" style="background-color:white">${pieceMap[boardRepresentation[77]]}</div>
            <div id="h2" style="background-color:black">${pieceMap[boardRepresentation[78]]}</div>
          </li>
          <li>
            <span class="left"> 1 </span>
            <div id="a1" style="background-color:black">${pieceMap[boardRepresentation[81]]}</div>
            <div id="b1" style="background-color:white">${pieceMap[boardRepresentation[82]]}</div>
            <div id="c1" style="background-color:black">${pieceMap[boardRepresentation[83]]}</div>
            <div id="d1" style="background-color:white">${pieceMap[boardRepresentation[84]]}</div>
            <div id="e1" style="background-color:black">${pieceMap[boardRepresentation[85]]}</div>
            <div id="f1" style="background-color:white">${pieceMap[boardRepresentation[86]]}</div>
            <div id="g1" style="background-color:black">${pieceMap[boardRepresentation[87]]}</div>
            <div id="h1" style="background-color:white">${pieceMap[boardRepresentation[88]]}</div>
          </li>
          <li class="bottom">
            <span class="bottom"> A </span>
            <span class="bottom"> B </span>
            <span class="bottom"> C </span>
            <span class="bottom"> D </span>
            <span class="bottom"> E </span>
            <span class="bottom"> F </span>
            <span class="bottom"> G </span>
            <span class="bottom"> H </span>
          </li>
        </ul>
      `;
    }
  }

  hasOpenSpot() {
    return (Object.keys(this.users).length < 2);
  }

  joinGame(user) {
    this.users[user.id] = {
      user: user,
      color: 'b'
    };
  }

  makeMove(user, from, to, sendMessage, render) {    
    if (this.currentTurn == user.id) {
      if (this.board.isLegalMove(posMap[from], posMap[to])) {
        this.board.makeMove(posMap[from], posMap[to]);
        this.swapTurns(this.currentTurn);
        for (let player in this.users) {
          if (this.users.hasOwnProperty(player)) {
            this.renderBoardState(this.users[player].user,render);
          }
        }
        this.board.legalMoves = this.board.findLegalMoves();
        if (this.board.legalMoves.length === 0) {
          sendMessage(`Checkmate! ${user.name} wins!`, 'gold', true, user);
        }
      } else {
        sendMessage('That is not a valid move.', 'red', false, user);
        this.renderBoardState(user,render);
      }
    } else {
      sendMessage('It is not your turn to move.', 'red', false, user);
    }
  }

  renderBoardState(user, render) {
    let html = this.generateHtml(user);
    render({
      user: user,
      html: html,
      plugin: 'chess'
    });
  }

  resetGame(user, sendMessage, render) {
    this.board = new Board();
    this.currentTurn = user.id;
    sendMessage(`${user.name} reset the game.`, 'red', true, user);
    for (let player in this.users) {
      if (this.users.hasOwnProperty(player)) {
        this.renderBoardState(this.users[player].user, render);
      }
    }
  }

  swapTurns(currentTurn) {
    let nextColor = this.users[currentTurn].color === 'w' ? 'b' : 'w';
    for (let user in this.users) {
      if (this.users.hasOwnProperty(user)) {
        if (this.users[user].color === nextColor) {
          this.currentTurn = user;
        }
      }
    }
  }

  watchGame(user) {
    this.users[user.id] = {
      user: user,
      color: 'v'
    };
  }
};