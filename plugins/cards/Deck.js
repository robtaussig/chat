const Card = require('./Card.js');

module.exports = class Deck {
  constructor(game) {
    this.game = game;
    this.cards = this.generateCards();
    this.dealtCards = [];
  }

  shuffleCards() {
    this.cards = this.cards.concat(this.dealtCards);
    let m = this.cards.length;
    let i;
    let t;

    while (m) {

      i = Math.floor(Math.random() * m--);

      t = this.cards[m];
      this.cards[m] = this.cards[i];
      this.cards[i] = t;
    }
  }

  deal(numCards) {
    let cards = [];
    for (let i = 0; i < numCards; i++) {
      let card = this.cards.pop();
      cards = cards.concat(card);
      this.dealtCards = this.dealtCards.concat(card);
    }
    return cards;
  }

  visualizeCards(cards) {
    return cards.map(el => el.representation.visual).join(' ');
  }

  generateCards() {
    let cards = [];
    const suitMap = {
      0: 'spades',
      1: 'hearts',
      2: 'clubs',
      3: 'diamonds'
    };
    for (let i = 1; i < 14; i++) {
      for (let j = 0; j < 4; j++) {
        cards.push(new Card(i, suitMap[j]));
      }
    }
    return cards;
  }
};