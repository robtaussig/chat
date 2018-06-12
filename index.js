let http;
let https;
let io;
let ioServer;
let options = {};
const env = process.env.NODE_ENV || 'development';
const config = require('../../../sensitive/config.js')[env];
const express = require('express');
const app = express();
const fs = require('fs');    

if (env === 'production') {
  https = require('https');
  options.key = fs.readFileSync("/etc/letsencrypt/live/robtaussig.com/fullchain.pem");
  options.cert = fs.readFileSync("/etc/letsencrypt/live/robtaussig.com/privkey.pem");
  options.rejectUnauthorized = false;
  ioServer = https.createServer(options, app).listen(5000);
  io = require('socket.io').listen(ioServer, options);
} else {
  http = require('http').createServer();
  io = require('socket.io')(http);
}

const RockPaperScissors = require('./plugins/rps/RockPaperScissors.js');
const Cards = require('./plugins/cards/Cards.js');
const Chess = require('./plugins/chess/Chess.js');
const RandomNameGenerator = require('./plugins/misc/RandomNameGenerator.js');
const crypto = require('crypto');
const { TeamText } = require('../teamText/index.js');
const tt = new TeamText();
const { Emailer, verificationEmail, generateVerificationToken } = require('../emailer.js');
const { MysqlHelper } = require('../mysqlHelper.js');
const db = new MysqlHelper();
let users = {

};

let currentUserId = 0;
let currentMessageId = 0;
let activeSockets = {

};
const reply = (payload) => {
  if (payload.message) {
    if (!payload.styling) {
      payload.styling = {color: 'green'};
    }
    if (payload.broadcast) {
      io.emit('plugin', payload);
    } else if (payload.user && payload.user.socketId) {
      let socket = activeSockets[payload.user.socketId];
      socket.emit('plugin', payload);      
    }
  }
  else {
    throw "Payload must at least contain a message";
  }
};

const allCommands = (basicCommands) => {
  Object.keys(plugins).forEach(plugin => {
    basicCommands = basicCommands.concat(plugins[plugin].availableCommands);
  });
  return basicCommands;
};

const render = (payload) => {
  if (payload && payload.user && payload.user.socketId) {
    let socket = activeSockets[payload.user.socketId];    
    socket.emit('render', payload);    
  } else {
    throw "ui must contain a key for 'users', and a key for 'payload'";
  }
};

let basicCommands = [
  '\'/name [name]\' - change your name.', 
  '\'/color [color]\' - change your font color.', 
  '\'/users\' - List users in room.', 
  '\'/whisper [name] [message]\' - Directly message everyone with that name.',
  '\'/save [key1] [key2]...\' - Save user information to local storage. Available keys are \'name\', \'id\', and \'color.\'',
  '\'/delete [key1] [key2]...\' - Delete user information saved on local storage. Available keys are \'name\', \'id\', and \'color.\'',
  '\'/close\' - Close any active windows.',
  '\'/cipher [key]\' - Set a cipher key to encrypt outgoing messages.',
  '\'/decipher [key]\' - Set a decipher key to decrypt incoming messages.',
  '\'/uncipher\' - Remove cipher from outgoing messages.',
  '[ArrowUp] or [ArrowDown] - cycle through input history.'
];

/* PLUGIN CONTRACT
  Integration: Add plugin to plugins object as follows:
    [key]: {
      availableCommands: ['\'/key [command]\' - [what happens]', etc],
      plugin: new Plugin((payload) => reply(key, payload))
    }
    
    Replace each occurrence of 'key' with a shorthand for your plugin, and anything inside square brackets with anything you want (not to confuse with the outer square brackets, indicating an array)
    Replace 'Plugin' with the plugin class
  Initialization: Initialized with a function that takes a payload and sends it to the channel.
    Payload schema: { message: required String, styling: optional Object, user: optional Object, broadcast: optional Boolean }
      payload.styling must follow jQuery syntax ({camelCase: 'string'})
      payload.user is used to filter the message to a specific user
      payload.broadcast bypasses the above and displays the message to the channel
  Receiving inputs: Commands will be issued through a class method Plugin.receiveCommand(user, command).
    The first argument will be a user object with the following: {name: String, id: String, color: String, socketId: String}
    The second argument will be an array of commands, space delimited. E.g., the command '/plugin start game for 5 players' would yield an array of ['start', 'game', 'for', '5', 'players']
*/

const plugins = {
  rps: {
    availableCommands: [
      '\'/rps [number]\' - Initiates a game of \'Rock, Paper, Scissors\' with [number] open spots.', 
      '\'/rps [action]\' - If a game has started, declare your action with \'rock\',\'paper\',\'scissors\',\'r\',\'p\', or \'s\'.',
      '\'/rps reset\' - Reset an ongoing session.',
    ],
    plugin: new RockPaperScissors((payload) => reply(payload))
  },
  cards: {
    availableCommands: [
      '\'/cards --help all\' - Display all available commands for Cards.'
    ],
    plugin: new Cards((payload) => reply(payload), (ui) => render(ui))
  },
  chess: {
    availableCommands: [
      '\'/chess --vs [gameId]\' - Create an open challenge with id of [gameId]',
      '\'/chess --join [gameId]\' - Accept a challenge with id [gameId].',
      '\'/chess --resign\' - Resign the current game.',
      '\'/chess -[from] -[to] \' - e.g., \'/chess -e2 -e4\'',
      '\'/chess --reset\' - Reset your current game',
    ],
    plugin: new Chess((payload) => reply(payload), (ui) => render(ui))
  }
};

io.on('connection', function(socket) {
  currentUserId++;
  socket.id = currentUserId;
  socket.emit('receive id', {
    id: currentUserId
  });

  socket.on('user connected', function(payload) {
    if (!payload.user.name) {
      payload.user.name = RandomNameGenerator.generateRandomName();
    }
    users[payload.user.id] = {
      name: payload.user.name,
      socketId: payload.user.id,
      color: payload.user.color,
      id: payload.user.id
    };
    activeSockets[payload.user.id] = socket; 
    io.emit('update users', {
      users: users,
      message: `${payload.user.name} connected`,
      styling: {
        color: payload.user.color
      },
      broadcast: true
    });
  });

  socket.on('disconnect', function(){    
    let userName = 'Someone';
    let userId;
    for (let user in users) {
      if (users.hasOwnProperty(user)) {
        if (users[user].socketId === socket.id) {
          userName = users[user].name;
          userId = user;
          delete activeSockets[userId];
          delete users[user];
        }
      }
    }
    const teamTextResult = tt.castUserNames(tt.disconnectUser(socket.id));

    io.emit('on leave team text room', {
      roomCode: teamTextResult.roomCode,
      users: teamTextResult.users
    });

    io.emit('update users', {
      users: users,
      message: `${userName} disconnected`,
      styling: {
        color: 'red'
      },
      broadcast: true
    });
  });

  socket.on('send message', function(payload, completionCallback) {   
    if (!guaranteeUserMatch(payload.user)) {
      return false;
    }
    if (payload.message.startsWith('/')) {
      handleCommand(payload, socket);
      if (completionCallback) {
        completionCallback({
          result: 'success'
        });
      }
    } else if (payload.message !== '') {
      currentMessageId++;     
      if (users[payload.user.id].cipher) {
        let cipheredMessage = payload.message.split(' ')
          .filter(el => el.length < 16)
          .map(el => {
            return cipher(createCipher(users[payload.user.id].cipher), el);
          })
          .join(' ');
        io.emit('chat message', {
          message: users[payload.user.id].name + ': (encrypted) ' + cipheredMessage,
          styling: {
            color: payload.user.color
          },
          id: currentMessageId,
          broadcast: true
        });
        for (let user in users) {
          if (users.hasOwnProperty(user) && users[user].decipher) {
            let decipheredMessage = cipheredMessage.split(' ')
              .map(el => {
                return decipher(createDecipher(users[user].decipher), el);
              })
              .join(' ');
            io.emit('chat message', {
              message: `Deciphered: ${decipheredMessage}`
            });
          }
        }
      } else {
        io.emit('chat message', {
          message: users[payload.user.id].name + ': ' + payload.message,
          styling: {
            color: payload.user.color
          },
          id: currentMessageId,
          broadcast: true
        });
      }
      if (completionCallback) {
        completionCallback({
          result: 'success'
        });
      }
    }    
  });

  socket.on('verify identity', function(payload) {
    return generateVerificationToken(db, payload.email, payload.currentLocation)
      .then(verificationToken => {
        const options = {
          verificationLink: `${config.location}api/verify/${verificationToken}`
        };
        global.sockets[verificationToken] = socket;
        return Emailer.sendEmail('verify@robtaussig.com', payload.email, 'Verification Link', verificationEmail(options));
      })
      .catch(error => {
        console.log(error);
      });
  });

  socket.on('get team text', function(payload, completionCallback) {
    const { roomCode } = payload;
    const { text } = tt.castUserNames(tt.getTextFromRoomCode(roomCode));
    if (completionCallback) {
      completionCallback({
        result: 'success',
        text
      });
    }
  });

  socket.on('join team text room', function(payload, completionCallback) {
    const { roomCode } = payload;
    const { users, text } = tt.castUserNames(tt.joinRoom(socket.id, roomCode));
    io.emit('on set name team text', {
      roomCode,
      users
    });
    if (completionCallback) {
      completionCallback({
        result: 'success',
        users,
        userId: socket.id,
        text
      });
    }
  });

  socket.on('leave team text room', function(payload, completionCallback) {
    const { roomCode } = payload;    
    const { users } = tt.castUserNames(tt.leaveRoom(socket.id, roomCode));
    io.emit('on leave team text room', {
      roomCode,
      users
    });
    if (completionCallback) {
      completionCallback({
        result: 'success',
        users
      });
    }
  });

  socket.on('set name team text' , function(payload, completionCallback) {
    const { name } = payload;    
    const { users, roomCode } = tt.castUserNames(tt.setName(socket.id, name));
    io.emit('on set name team text', {
      roomCode,
      users
    });
    if (completionCallback) {
      completionCallback({
        result: 'success',
        users
      });
    }
  });

  socket.on('input team text', function(payload, completionCallback) {
    const { roomCode, teamText } = payload;
    const text = tt.inputText(socket.id, teamText, roomCode);
    io.emit('on input team text', {
      text,
      roomCode,
      userId: socket.id
    });
    if (completionCallback) {
      completionCallback({
        result: 'success',
        text
      });
    }
  });

  socket.on('user typing', function(payload) {
    guaranteeUserMatch(payload.user);
    io.emit('user typing', {
      user: payload.user
    });
  });
});

if (env !== 'production') {
  http.listen(process.env.PORT || 5000, function() {
    console.log('listening on *:' + (process.env.PORT || 5000));
  });
}

function handleCommand(payload, socket) {
  let operation = payload.message.split(' ')[0];
  let args = payload.message.substring(operation.length + 1).split(' ');
  let userList, previousName;
  switch (operation) {

  case '/name':
    previousName = users[payload.user.id].name;
    users[payload.user.id].name = args[0];
    io.emit('update users', {
      users: users,
      message: `${previousName} changed their name to ${args.join(' ')}.`,
      styling: {
        color: payload.user.color
      },
      broadcast: true
    });
    break;

  case '/color':
    users[payload.user.id].color = args[0];
    io.emit('update users', {
      users: users,
      message: `${users[payload.user.id].name} changed their color to ${args[0]}.`,
      styling: {
        color: args[0]
      },
      broadcast: true
    });
    break;

  case '/whisper':
    if (payload.message.indexOf(payload.message.split(' ')[2]) > 0) {
      let sender = users[payload.user.id].name;
      let message = args.slice(1).join(' ');
      Object.keys(users).forEach(el => {
        if (users[el] && users[el].name === args[0]) {
          if (activeSockets[el]) {
            activeSockets[el].emit('chat message', {
              message: sender + ' > ' + args[0] + ': ' + message,
              styling: {
                color: 'red'
              }
            });
          }
        }        
      });
      socket.emit('chat message', {
        message: sender + ' > ' + args[0] + ': ' + message,
        styling: {
          color: '#7e838e'
        }
      });
    }

    break;

  case '/users':
    userList = Object.keys(users).map( (el,idx) => {
      if (idx < Object.keys(users).length - 1) {
        return users[el].name + ',';
      }
      else {
        return users[el].name + '.';
      }
    }).join(' ');
    
    socket.emit('chat message', {
      message: 'Users in room: ' + userList,
      user: payload.user,
      styling: {
        color: 'red'
      }
    });
    break;

  case '/commands':
    socket.emit('list commands', {
      commands: allCommands(basicCommands),
      user: payload.user,
      styling: {
        marginLeft: '10px'
      }
    });
    break;

  case '/save':
    socket.emit('save data', {
      keys: args,
      user: payload.user
    });
    break;

  case '/delete':
    socket.emit('delete data', {
      keys: args,
      user: payload.user
    });
    break;

  case '/close':
    io.emit('close sliding window', {
      user: payload.user
    });
    break;

  case '/cipher':
    users[payload.user.id].cipher = args[0];
    socket.emit('chat message', {
      message: 'Cipher set',
      styling: {
        color: `red`
      }
    });
    break;

  case '/decipher':
    users[payload.user.id].decipher = args[0];
    socket.emit('chat message', {
      message: 'Decipher set',
      styling: {
        color: `red`
      }
    });
    break;

  case '/uncipher':
    users[payload.user.id].cipher = false;
    socket.emit('chat message', {
      message: 'Cipher unset',
      styling: {
        color: `red`
      }
    });
    break;

  default:
    for (let plugin in plugins) {
      if (plugins.hasOwnProperty(plugin)) {
        if (operation.substring(1) === plugin) {
          plugins[plugin].plugin.receiveCommand(payload.user, args);
          return false;
        }
      }
    }
  }
}

function guaranteeUserMatch(user) {
  if (user && !users[user.id]) {
    users[user.id] = user;
  } else if (!user) {
    return false;
  }
  return true;
}

function createCipher(key) {
  return crypto.createCipher('aes192', key);
}

function cipher(userCipher, text) {
  let encrypted = userCipher.update(text);
  encrypted += userCipher.final('hex');
  return encrypted;
}

function createDecipher(key) {
  return crypto.createDecipher('aes192', key);
}

function decipher(userDecipher, encrypted) {
  let decrypted;
  try {
    decrypted = userDecipher.update(encrypted, 'hex', 'utf8');
    decrypted += userDecipher.final('utf8');
  } catch (ex) {
    decrypted = "*";
  }
  return decrypted;
}

let exported;
if (env === 'production') {
  exported = ioServer;
} else {
  exported = io;
}
module.exports = exported;