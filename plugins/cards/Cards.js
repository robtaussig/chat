const BlackJack = require('./BlackJack.js');
const Deck = require('./Deck.js');
const constants = require('./constants.js');

module.exports = class Cards {
  constructor(reply) {
    this.games = {};
    this.reply = reply;
    this.userCoins = {};
    this.availableCommands = [
      '\'/cards --start [game]\' - Start an instance of [game]. (example: \'/cards --start bj\'',
      '\'/cards --join [game]\' - Join a current instance of [game]. (example: \'/cards --join bj\'',
      '\'/cards --reset [game]\' - Reset a current instance of [game]. (example: \'/cards --reset bj\'',
      'Available games: [bj] (Blackjack)'
    ];
  }

  extractCommands(commands) {
    let parsedCommands = {};
    
    for (let i = 0; i < commands.length; i++) {

      if (commands[i].startsWith('--')) {
        parsedCommands[commands[i].slice(2)] = commands[i + 1];
        i++;
      } else if (commands[i].startsWith('-')) {
        parsedCommands[commands[i].slice(1)] = true;
      }
      else {
        return {
          isValid: false,
          reason: this.parseReason(commands[i])
        };
      }
    }
    
    if (this.isValidCommands(parsedCommands)) {
      parsedCommands.isValid = true;
      return parsedCommands;
    }
    else {
      return {
        isValid: false,
        reason: 'That is not a valid command. Please input \'/cards --help all\' for more information.'
      };
    }
  }

  getHelp(user, parsedCommands) {

    if (parsedCommands.help === 'all') {
      this.availableCommands.forEach(command => {
        this.sendMessage(`${command}`, 'red', false, user);
      });
    } else if (parsedCommands.help === 'bj') {
      [
        `\'/cards -bj -bet --amount [amount]\' - Place bet (without square brackets).`,
        `\'/cards -bj -deal\' - Start a game with existing users`,
        `\'/cards -bj -hit\' - Hit to draw another card`,
        `\'/cards -bj -stand\' - Stand to keep your current card total`,
        `\'/cards -bj -double\' - Double your bet and draw exactly once more (feature still in development)`,
      ].forEach(command => {
        this.sendMessage(`${command}`, 'red', false, user);
      });
    } else {
      this.sendMessage('Valid options for help: \'/cards --help all\' and \'/cards --help bj\' (Blackjack)', 'red', false, user);
    }
  }

  isValidCommands(parsedCommands) {
    return true;
  }

  joinGame(user, parsedCommands) {
    this.userCoins[user.id] = this.userCoins[user.id] || 1000;
    this.sendMessage(`You have ${this.userCoins[user.id]} coins`, user.color, false, user);

    switch (parsedCommands.join.toLowerCase()) {
      case 'bj':
        if (this.games.bj) {
          this.games.bj.adduser(user);
        }
        else {
          this.sendMessage('There is no open game of blackjack. Type /cards --start blackjack to start one.', 'red', false, user);
        }
        break;
    
      default:
        break;
    }
  }

  parseReason(command) {
    return `\'${command}\' is not a valid command. Please input \'/cards --help all\' for more information.`;
  }

  receiveCommand(user, command) {

    const parsedCommands = this.extractCommands(command);

    if (parsedCommands.isValid) {
      if (parsedCommands.start) {
        this.startGame(user, parsedCommands);
      } else if (parsedCommands.help) {
        this.getHelp(user, parsedCommands);
      } else if (parsedCommands.join) {
        this.joinGame(user, parsedCommands);
      } else if (parsedCommands.bj && this.games.bj) {
        this.games.bj.receiveCommand(user, parsedCommands);
      } else {
        this.sendMessage('You must issue one of the following commands: \'/cards --start [game] -[#users]\',\'/cards --join [game]\', or \'--help [game]/all\'', 'red', false, user);
      }
    }
    else {
      this.sendMessage(parsedCommands.reason, 'red', false, user);
    }
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

  startGame(user, parsedCommands) {
    this.userCoins[user.id] = this.userCoins[user.id] || 1000;
    this.sendMessage(`You have ${this.userCoins[user.id]} coins`, user.color, false, user);

    switch (parsedCommands.start.toLowerCase()) {
      case 'bj':
        if (!this.games.bj) {
          let cards = new Deck(constants.BLACKJACK);
          this.games.bj = new BlackJack(cards, user, parsedCommands, this.reply, this.userCoins);
        } else {
          this.sendMessage('A game of blackjack is already in progress. Type /cards --join bj to join.', 'red', false, user);
        }
        break;
    
      default:
        break;
    }
  }
};