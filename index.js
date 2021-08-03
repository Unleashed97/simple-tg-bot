process.env.NTBA_FIX_319 = 1

const { random } = require('lodash')
const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const bot = new TelegramBot(config.token, {polling: true})

// menu
const menu = {
    main: {
        title: 'Here are all avaliable features:',
        menu: {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Toss the coin',
                            callback_data: 'tossTheCoin',
                        }
                    ],
                    [
                        {
                            text: 'Random number',
                            callback_data: 'randomNumber',
                        }
                    ],
                    [
                        {
                            text: 'Create password',
                            callback_data: 'createPassword',
                        }
                    ],
                    [
                        {
                            text: 'Set a reminder',
                            callback_data: 'setReminder',
                        }
                    ],
                ]
            }
        }
    },
    password:{
        title: 'Password',
        menu:{
            reply_markup:{
                inline_keyboard:[
                    [
                        {
                            text: 'Weak password (6 characters)',
                            callback_data: 'pasWeak',
                        }
                    ],
                    [
                        {
                            text: 'Good password (10 characters)',
                            callback_data: 'pasGood',
                        }
                    ],
                    [
                        {
                            text: 'Strong password (15 characters)',
                            callback_data: 'pasStrong',
                        }
                    ],
                    [
                        {
                            text: 'back',
                            callback_data: 'back',
                        }
                    ]
                ]
            }
        }
    }
}

// commands
const command_start = 'start'
const command_password = 'password'
const command_toss_coin = 'coin'
const command_random_number = 'random'
const command_reminder = 'reminder'
const command_help = 'help'

// help
const help_message = 'This bot can do some simple things like tossing the coin (it helps to make a difficult choice), getting the random number in your range, generating the password, also Im gonna add the opportunity of setting of notification.\n\nThere are all avaliable commands:\n\n/start - shows list of features\n/coin - shortcut for tossing the coin\n/random - gives you random number in your range\n/password - generates the password\n/help - help menu';

// commands handler
bot.onText(new RegExp(`/(.*)`), (msg, [source, match]) =>{
    const { chat } = msg
    switch(match){
        case command_start:
            bot.sendMessage(chat.id, menu.main.title, menu.main.menu)
            break
        case command_password:
            bot.sendMessage(chat.id, `${menu.main.title}\n\n<b>${menu.password.title}</b>`, {
                parse_mode: 'HTML',
                ...menu.password.menu
            })
            break
        case command_toss_coin:
            bot.sendMessage(chat.id, 'toss the coin')
            break
        case command_random_number:
            bot.sendMessage(chat.id, 'random number')
            break
        case command_reminder:
            bot.sendMessage(chat.id, 'reminder')
            break
        case command_help:
            bot.sendMessage(chat.id, help_message)
            break
        default:
            bot.sendMessage(chat.id, 'Sorry, bot doesnt know this command, try one more or use /help command')
            break
    }
})

// btn click handler
bot.on('callback_query', query =>{
    const {message: { chat, message_id, text }} = query

    switch(query.data){
        case 'tossTheCoin':
            bot.sendMessage(chat.id, `Result of tossing the coin: \n\n ${tossTheCoin()}`)
            break
        case 'randomNumber':
            bot.sendMessage(chat.id, 'random number');
            break
        case 'createPassword':
            bot.editMessageText(`${text}\n\n <b>${menu.password.title}</b>`, {
                message_id: message_id,
                chat_id: chat.id,
                parse_mode: 'HTML',
                ...menu.password.menu
            })
            break
        case 'pasWeak':
            bot.sendMessage(chat.id, `Here is your weak password:\n\n ${generatePassword('weak')}`)
            break
        case 'pasGood':
            bot.sendMessage(chat.id, `Here is your good password:\n\n ${generatePassword('good')}`)
            break;
        case 'pasStrong':
            bot.sendMessage(chat.id, `Here is your strong password:\n\n ${generatePassword('strong')}`)
            break;
        case 'back':
            bot.editMessageText(menu.main.title, {
                message_id: message_id,
                chat_id: chat.id,
                ...menu.main.menu
            })
            break;
    }
})

function getRandomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function tossTheCoin(){
    const randomNumber = getRandomNumber(0, 1)
    if(randomNumber) return 'head'
    else return 'tail'
}

const LETTERS_CHAR_CODES = createArray(65, 90).concat(createArray(97, 122))
const NUMBERS_CHAR_CODES = createArray(48, 57)
const SYMBOLS_CHAR_CODES = createArray(33, 33).concat(createArray(35, 38))

function createArray(first, last){
    const array = []

    for(let i = first; i<= last; i++){
        array.push(i)
    }

    return array
}

function generatePassword(passwordStrength){
    let charCodes = []
    let characterAmount = null;
    if(passwordStrength === 'weak') {
        charCodes = LETTERS_CHAR_CODES.concat(NUMBERS_CHAR_CODES)
        characterAmount = 6
    }
    if(passwordStrength === 'good'){
        charCodes = LETTERS_CHAR_CODES.concat(NUMBERS_CHAR_CODES)
        characterAmount = 10
    }
        
    if(passwordStrength === 'strong'){
        charCodes = LETTERS_CHAR_CODES.concat(NUMBERS_CHAR_CODES, SYMBOLS_CHAR_CODES)
        characterAmount = 15
    } 

    let passwordCharacters = []

    for(let i =0; i< characterAmount; i++){
        const characterCode = charCodes[Math.floor(Math.random() * charCodes.length)]
        passwordCharacters.push(String.fromCharCode(characterCode))
    }

    return passwordCharacters.join('')
}

bot.on('polling_error', console.log)