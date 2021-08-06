const express = require('express')

const app = express();
 
app.listen(process.env.PORT);
 
module.exports = bot =>{
    app.post('/' + bot.token, (req, res) => {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    });
}