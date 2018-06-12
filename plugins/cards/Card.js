const constants = require('./constants.js');

module.exports = class Card {
  constructor(value, suit, game = constants.REGULAR) {
    this.value = value;
    this.suit = suit;
    this.game = game;
    this.representation = this.designCard();
  }

  designCard() {
    const stylingMap = {
      'hearts': 'red',
      'diamonds': 'red',
      'spades': 'black',
      'clubs': 'black'
    };

    return {
      visual: this.designValue() + this.designSuit(),
      styling: {
        color: stylingMap[this.suit]
      }
    };
  }

  designValue() {
    const valueMap = {
      '1': 'A',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '10': '10',
      '11': 'J',
      '12': 'Q',
      '13': 'K'
    };
    return valueMap[this.value];
  }

  designSuit() {
    const suitMap = {
      'hearts': '♥',
      'spades': '♠',
      'clubs': '♣',
      'diamonds': '♦'
    };

    return suitMap[this.suit];
  }
};