const constants = require('./constants.js');

module.exports = class BlackJack {
  constructor(deck, user, commands, reply, userCoins) {
    this.deck = deck;
    this.users = [user];
    this.dealer = {
      hand: [],
      name: 'dealer'
    };
    this.currentBets = {};
    this.hands = {};
    this.userCoins = userCoins;
    this.reply = reply;
    this.initiate(user);
    this.phase = constants.GAME_STARTING;
    this.actionOn = 0;
  }

  adduser(user) {
    if (this.users.find(el => el.id === user.id)) {
      this.sendMessage(`You have already joined the table`, 'red', false, user);
    } else {
      this.users.push(user);
      this.hands[user.id] = this.hands[user.id] || [];
      this.sendMessage(`${user.name} has joined the Blackjack table.`, 'gold', true);
      this.sendMessage(`Thanks for joining! Type \'/cards -bj -bet --amount [amount]\' to bet and \'/cards -bj -deal\' to deal.`, user.color, false, user);
    }
  }

  analyzeTurn(user, card) {
    let points = this.countPoints(user);

    if (points > 21) {
      this.bust(user, card);
    } else if (points === 21) {
      this.sendMessage(`${user.name} draws ${card.representation.visual} for 21.`, user.color, true);
      this.stand(user);
    } else {
      this.sendMessage(`${user.name} hits ${card.representation.visual}, for a total of ${points}`,'gold', true);
      this.displayAction();
    }
  }

  blackjack(user) {
    let winnings = Math.round(this.currentBets[user.id] * (3 / 2));
    this.sendMessage(`${user.name} got a blackjack and won ${winnings}!`, 'gold', true);
    this.userCoins[user.id] += winnings;
    this.hands[user.id] = [];
  }

  bust(user, card) {
    this.sendMessage(`${user.name} hits ${card.representation.visual} and busts!`, 'gold', true);
    this.actionOn++;
    this.displayAction();
  }

  countPoints(user) {
    let total = 0;
    this.hands[user.id].forEach(card => {
      total += Math.min(card.value, 10);
    });

    if (this.hands[user.id].find(el => el.value === 1)) {

      if (total + 10 === 21) {
        return 21;
      }
      else if (total + 10 > 21) {
        return total;
      }
      else {
        return `${total} or ${total + 10}`;
      }
    } else {
      return total;
    }
  }

  dealCardsToUser(user) {

    if (this.userCoins[user.id] > 50) {
      this.currentBets[user.id] = this.currentBets[user.id] || 50;
      let cards = this.deck.deal(2);
      this.hands[user.id] = cards;
      let cardVisuals = this.deck.visualizeCards(cards);

      this.sendMessage(`Your cards are ${cardVisuals}`, user.color, false, user);
    } else {
      this.currentBets[user.id] = 0;
      let cards = this.deck.deal(2);
      this.hands[user.id] = cards;
      let cardVisuals = this.deck.visualizeCards(cards);

      this.sendMessage(`You don't have enough coins to make a bet, so your current bet is 0`, 'red', false, user);
      this.sendMessage(`Your cards are ${cardVisuals}`, user.color, false, user);
    }

    this.userCoins[user.id] -= this.currentBets[user.id];
    
  }

  dealCardsToTable() {
    this.deck.shuffleCards();
    this.dealer.hand = this.deck.deal(2);

    this.users.forEach(user => {
      this.dealCardsToUser(user);
    });
    this.phase = constants.CARDS_DEALT;

    this.displayTableState();
    this.displayAction();
  }

  dealerTurn() {
    let points = 0;

    this.dealer.hand.forEach(card => {

      if (card.value === 1) {
       points += 11;
      }
      else {
        points += Math.min(card.value, 10);
      }
    });

    let card;
    while (points < 17) {
      card = this.deck.deal(1)[0];
      this.dealer.hand.push(card);

      this.sendMessage( `Dealer hits ${card.representation.visual}.`, 'gold', true);
      
      points += Math.min(card.value,10);

      if (card.value === 1 && points < 12) {
        points += 10;
      }
    }

    if (points > 21) {
      this.sendMessage( `The dealer busts!`, 'gold', true);
    } else {
      this.sendMessage( `The dealer stands with ${points}.`, 'gold', true);
    }

    this.resolveGame();
  }

  displayAction() {
    switch (this.phase) {
      case constants.CARDS_DEALT:
        if (this.actionOn < this.users.length) {
          this.getDecisionFrom(this.users[this.actionOn]);
        }
        else {
          this.dealerTurn();
        }
        break;
    
      default:
        break;
    }
  }

  displayTableState() {
    this.sendMessage(`Dealer: ${this.deck.visualizeCards(this.dealer.hand)}`, 'gold', true);
  
    this.users.forEach(user => {
      this.sendMessage(`--${user.name}: ${this.deck.visualizeCards(this.hands[user.id])}--`, 'gold', true);
      this.sendMessage(`--${user.name} | Bet / Total: $${this.currentBets[user.id]} / $${this.userCoins[user.id]}`, user.color, true);
    });

    this.sendMessage('Available actions: \'/cards -bj [-hit/-stand/-double]\'.', 'red', true);
  }

  findBestHand(hand) {
    let aceCount = 0;
    let points = 0;

    hand.forEach(card => {
      if (card.value === 1) {
        points += 11;
        aceCount++;
      }
      else {
        points += Math.min(card.value, 10);
      }
    });

    while (points > 21 && aceCount > 0) {
      points -= 10;
      aceCount--;
    }

    if (points > 21) {
      return false;
    } else {
      return points;
    }
  }

  getDecisionFrom(user) {
    let points = this.countPoints(user);
    
    if (points === 21 && this.hands[user.id].length === 2) {
      this.blackjack(user);
      this.actionOn++;
      this.displayAction();
    } else {
      this.sendMessage(`Action on ${user.name}.`, 'deepskyblue', true);
    }
  }

  hit(user) {

    if (this.users[this.actionOn].id === user.id) {
      let card = this.deck.deal(1);
      this.hands[user.id].push(card[0]);
      this.analyzeTurn(user, card[0]);
    } else {
      this.sendMessage(`It is not your turn to hit.`, 'red', false, user);
    }
  }

  initiate(user) {
    this.sendMessage(`${user.name} has started a game of Blackjack. Type \'/cards --join bj\' to join.`, 'gold', true);
    this.sendMessage(`Thanks for joining! Type \'/cards -bj -bet --amount [amount]\' to bet and \'/cards -bj -deal\' to deal.`, user.color, false, user);
  }

  payOutWinners(dealerHand, winners, pushes) {
    pushes.forEach(push => {
      this.userCoins[push.user.id] += (this.currentBets[push.user.id]);
      this.sendMessage(`${push.user.name} pushes with a score of ${push.points} and gets their money back`, push.user.color, true);
    });
    if (winners.length > 0) {
      winners.forEach(winner => {
        this.userCoins[winner.user.id] += (this.currentBets[winner.user.id] * 2);
        this.sendMessage(`${winner.user.name} wins $${this.currentBets[winner.user.id]} with a score of ${winner.points}`, winner.user.color, true);
      });
    } else {
        this.sendMessage(`No one beat the dealer.`, 'gold', true);
    }
    
  }

  placeBet(user, commands) {
    if (!commands.amount || commands.amount >>> 0 !== parseFloat(commands.amount)) {
      this.sendMessage(`You must use an integer as an amount, and without square brackets. Example: \'/cards -bj -bet --amount [amount]\'`, 'red', false, user);
    } else if (this.userCoins[user.id] > commands.amount) {
      this.currentBets[user.id] = commands.amount;
      this.sendMessage(`${user.name} placed a bet of $${commands.amount}.`, user.color, true);
    } else {
      this.currentBets[user.id] = 0;
      this.sendMessage(`You don't have enough coins to make the minimum bet, so your current bet is zero.`, 'red', false, user);
    }
  }

  receiveCommand(user, commands) {

    if (commands.deal && this.phase === constants.GAME_STARTING) {
      this.dealCardsToTable();
    } else if (commands.hit && this.phase === constants.CARDS_DEALT) {
      this.hit(user);
    } else if (commands.stand && this.phase === constants.CARDS_DEALT) {
      this.stand(user);
    } else if (commands.double && this.phase === constants.CARDS_DEALT) {
      
    } else if (commands.bet && this.phase === constants.GAME_STARTING) {
      this.placeBet(user, commands);
    } else if (commands.reset) {
      this.sendMessage(`${user.name} reset the game.`, 'red', true);
      this.resetGame();
    } else {
      this.sendMessage(`That command is not valid right now`, 'red', false, user);
    }
  }

  resetGame() {
    this.phase = constants.GAME_STARTING;
    this.sendMessage(`Cards shuffled. Type \'/cards -bj -deal\' to deal.`, 'gold', true);

    this.actionOn = 0;
    this.hands = {};
    this.dealer.hand = [];
  }

  resolveGame() {
    let busts = [];
    let nonBusts = [];
    let winners = [];
    let pushes = [];
    let dealerPoints = this.findBestHand(this.dealer.hand);

    this.users.forEach(user => {
      let points = this.findBestHand(this.hands[user.id]);

      if (points) {
        nonBusts.push({
          user: user,
          points: points
        });
      }
      else {
        busts.push(user);
      }
    });

    if (dealerPoints) {
      nonBusts.forEach(hand => {
        if (hand.points > dealerPoints) {
          winners.push(hand);
        }
        else if (hand.points === dealerPoints) {
          pushes.push(hand);
        }
      });
    } else {
      winners = nonBusts;
    }

    this.payOutWinners(dealerPoints, winners, pushes);
    this.resetGame();
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
    } else {
      this.reply({
        user: user,
        message: message,
        styling: {
          color: color
        }
      });
    }
  }

  stand(user) {

    if (this.users[this.actionOn].id === user.id) {
      let points = this.countPoints(user);

      if (points >>> 0 !== parseFloat(points)) {
        points = points.split(' or ')[1];
      }

      this.sendMessage(`${user.name} stands with ${points}`, 'gold', true);
      
      this.actionOn++;
      this.displayAction();
    } else {
      this.sendMessage(`It is not your turn to stand.`, 'red', false, user);
    }
  }
};