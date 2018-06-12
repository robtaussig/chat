const adjectives = [
  'Tiny',
  'Huge',
  'Silly',
  'Curious',
  'Determined',
  'Funny',
  'Quirky',
  'Intergalactic',
  'Crazy',
  'Bossy'
];

const nouns = [
  'Dog',
  'Alligator',
  'Unicorn',
  'Hamburger',
  'Banana',
  'Muffin',
  'Potato',
  'Mustache',
  'Catnip',
  'Boot'
];

module.exports = class RandomNameGenerator {
  static generateRandomName() {
    let randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    let randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return randomAdjective + randomNoun;
  }
};