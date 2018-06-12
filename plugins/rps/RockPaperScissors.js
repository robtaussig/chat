module.exports = class RockPaperScissors {
  constructor(reply) {
    this.currentGame = false;
    this.players = {

    };
    this.numPlayers = 0;
    this.reply = reply;
  }

  categorizePlayers() {
    let results = {

    };

    results.rock = Object.keys(this.players).filter(el => {
      return this.players[el].action === 'rock' || this.players[el].action === 'r';
    })
    .map(el => this.players[el].name);

    results.paper = Object.keys(this.players).filter(el => {
      return this.players[el].action === 'paper' || this.players[el].action === 'p';
    })
    .map(el => this.players[el].name);

    results.scissors = Object.keys(this.players).filter(el => {
      return this.players[el].action === 'scissors' || this.players[el].action === 's';
    })
    .map(el => this.players[el].name);

    return results;
  }

  constructMessagePart(category) {
    let messagePart = "";

    for (let i = 0; i < category.length; i++) {

      if (category.length === 1) {
        messagePart += category[i];
      }
      else if (i === category.length - 1) {
        messagePart += `and ${category[i]}`;
      }
      else if (category.length > 2) {
        messagePart += `${category[i]}, `;
      }
      else {
        messagePart += `${category[i]} `;
      }
    }

    return messagePart;
  }

  generateMessage(categories) {
    let message = "The results are in! ";
    let paperPlayers = this.constructMessagePart(categories.paper)|| "nobody";
    let rockPlayers = this.constructMessagePart(categories.rock)|| "nobody";
    let scissorsPlayers = this.constructMessagePart(categories.scissors)|| "nobody";

    message += `Playing rock, ${rockPlayers} beat ${scissorsPlayers}. Playing paper, ${paperPlayers} beat ${rockPlayers}. And playing scissors, ${scissorsPlayers} beat ${paperPlayers}.`;
    return message;
  }

  isGameOver() {
    return this.numPlayers === Object.keys(this.players).length;
  }

  isValidAction(action) {
    return ['rock', 'paper', 'scissors', 'r', 'p', 's'].includes(action);
  }

  receiveCommand(user, command) {
    command = command[0];
    if (this.currentGame) {
      if (this.isValidAction(command)) {
        this.setPlayerAction(user, command);     
      } else if (command === 'reset') {
        this.resetGame();
      } else {
        this.sendMessage('Invalid action. Valid inputs are \'rock\',\'paper\',\'scissors\',\'r\',\'p\', or \'s\'', 'red', false, user);
      }
      if (this.isGameOver()) {
        this.resolveGame();
      } else if (this.isValidAction(command)) {
        this.sendMessage(`${user.name} has submitted their decision. ${this.numPlayers - Object.keys(this.players).length} spot(s) left.`, 'magenta', true);
      }
    } else if (command >>> 0 === parseFloat(command)) {
      this.startGame(command);
      this.sendMessage(`${user.name} has started a game of \'Rock, Paper, Scissors\', and initiated it to ${command} player(s). The game will resolve once ${command} player(s) have submitted their choice. Type \'/commands\' for instructions.`, 'magenta', true);
    } else {
      this.sendMessage('The game has either already been initiated or you didn\'t enter a positive integer', 'red', false, user);
    }
  }

  resetGame() {
    this.currentGame = false;
    this.players = {};
    this.numPlayers = 0;
  }

  resolveGame() {
    let categories = this.categorizePlayers();
    let message = this.generateMessage(categories);
    
    this.resetGame();
    
    this.sendMessage(message, 'magenta', true);
  }

  sendMessage(message, color, broadcast = true, user = false) {
    if (broadcast) {
      this.reply({
        broadcast: true,
        message: message,
        styling: {
          color: color
        }
      });
    }
    else {
      this.reply({
        user: user,
        message: message,
        styling: {
          color: color
        }
      });
    }
  }

  setPlayerAction(user, action) {
    this.players[user.id] = this.players[user.id] || {};
    this.players[user.id].action = action;
    this.players[user.id].name = user.name;
  }

  startGame(numPlayers) {
    this.currentGame = true;
    this.numPlayers = parseInt(numPlayers);
  }
};