process.env.NTBA_FIX_319 = 1

const { default: axios } = require('axios')
const TelegramBot = require('node-telegram-bot-api')

const token = process.env.TOKEN

let bot

if(process.env.NODE_ENV === 'production'){
    bot = new TelegramBot(token)
    bot.setWebHook(process.env.HEROKU_URL + bot.token)
}else{
    bot = new TelegramBot(token, {polling: true})
}

console.log(`Bot server started in the ${process.env.NODE_ENV} mode`)

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
                            callback_data: 'reminder',
                        }
                    ],
                    [
                        {
                            text: 'Currency Rate',
                            callback_data: 'currencyRate',
                        }
                    ]
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
    },
    reminder:{
        title: 'Reminder',
        menu: {
            reply_markup: {
                inline_keyboard:[
                    [
                        {
                            text: 'Add new reminder',
                            callback_data: 'reminderNew',
                        }
                    ],
                    [
                        {
                            text: 'List of reminders',
                            callback_data: 'reminderList',
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
const command_currency = 'currency'
const command_reminder = 'reminder'
const command_help = 'help'

// help
const help_message = 'This bot can do some simple things like tossing the coin (it helps to make a difficult choice), getting the random number in your range, generating the password, also Im gonna add the opportunity of setting the reminders.\n\nThere are all avaliable commands:\n\n/start - shows list of features\n/coin - shortcut for tossing the coin\n/random - gives you random number in your range\n/password - generates the password\n/reminder - set a reminder\n/help - help menu';

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
            bot.sendMessage(chat.id, `Result of tossing the coin: \n\n ${tossTheCoin()}`)
            break
        case command_random_number:
            randomNumber(chat.id)
            break
        case command_reminder:
            bot.sendMessage(chat.id, 'reminder')
            break
        case command_help:
            bot.sendMessage(chat.id, help_message)
            break
        case command_currency:
            getCurrencyRate(chat.id)
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
            randomNumber(chat.id)
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
            break
        case 'pasStrong':
            bot.sendMessage(chat.id, `Here is your strong password:\n\n ${generatePassword('strong')}`)
            break
        case 'currencyRate':
            getCurrencyRate(chat.id)
            break
        case 'reminder':
            bot.editMessageText(`${text}\n\n<b>${menu.reminder.title}</b>`, {
                chat_id: chat.id,
                message_id: message_id,
                parse_mode: 'HTML',
                ...menu.reminder.menu,
                })
            break
        case 'reminderNew':
            createReminder(chat.id)
            break
        case 'reminderList':
            showReminderList(chat.id)
            break
        case 'back':
            bot.editMessageText(menu.main.title, {
                message_id: message_id,
                chat_id: chat.id,
                ...menu.main.menu
            })
            break
    }
})

function getRandomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// random number
function randomNumber(chatId){
    let flag = false
    bot.sendMessage(chatId, 'Input MIN and MAX values separated by the space like this "1 3".');
    
    bot.on('message', msg =>{
        if(flag === false){
            const [min, max] = msg.text.split(' ')
            if(!min || !max) {
                bot.sendMessage(chatId,'Input both values in the following format: "number1 number2".\nTry again: /random')
            }
            else if(Number.isNaN(+min) || Number.isNaN(+max)){
                bot.sendMessage(chatId, 'There are only numbers allowed.\nTry again: /random')
            }
            else {
                const randomNumber = getRandomNumber(+min, +max)
                bot.sendMessage(chatId, `Here is your random number:\n\n ${randomNumber}`)
            }
            flag = true
        }
    })
}

// tossing the coin
function tossTheCoin(){
    const randomNumber = getRandomNumber(0, 1)
    if(randomNumber) return 'head'
    else return 'tail'
}


// password
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

// generatiion of the password
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

// currency rate
function getCurrencyRate(chatId){
    axios.get('https://www.cbr-xml-daily.ru/daily_json.js').then(response =>{
        let usd = response.data.Valute.USD.Value
        let euro = response.data.Valute.EUR.Value

        let usdChange = usd - response.data.Valute.USD.Previous
        let euroChange = euro - response.data.Valute.EUR.Previous

        bot.sendMessage(chatId, `Exchange rate: \n\n <b>USD: ${usd.toFixed(2)}(${usdChange.toFixed(3)})\n EURO: ${euro.toFixed(2)}(${euroChange.toFixed(3)})</b>`, {parse_mode: 'HTML'})
    }).catch(error =>{
        bot.sendMessage(chatId, 'This feature doesnt available now, please, try again later')
    })
    
}

// reminder
const reminders = {}

// creation of reminder
function createReminder(chatId) {
    bot.sendMessage(chatId, 'Send me your reminder text and time (E.g: Call mom in 3 hours)')
}

bot.on('polling_error', console.log)

module.exports = bot