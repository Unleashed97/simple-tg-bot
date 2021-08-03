process.env.NTBA_FIX_319 = 1

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
                            callback_data: 'TossTheCoin',
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
