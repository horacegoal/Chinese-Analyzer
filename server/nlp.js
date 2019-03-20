const AipNlpClient = require("baidu-aip-sdk").nlp;
const http = require('http');
const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, '../public');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
app.use(express.static(publicPath))

let APP_ID = "15772119";
let API_KEY = "Tz6YqkvE43YPsrrCyOQVhv9z";
let SECRET_KEY = "iLKd44lTfG5oL3xBC4phHbGLXHGgarGm";

let client = new AipNlpClient(APP_ID, API_KEY, SECRET_KEY);


server.listen(port, () => {
  console.log(`The app is on port ${port}`)
})
io.on('connection', (socket) => {
  console.log('client connected')
    socket.on('text', (textInput) => {
      client.sentimentClassify(textInput).then(function(result) {
      // console.log(JSON.stringify(result, null, 2));
      let sentimentResult = {
        sentiment: result.items[0].sentiment,
        confidence: result.items[0].confidence
      }
      socket.emit('sentimentClassify', sentimentResult)
    }).catch(function(err) {
        console.log(err);
    });

    client.lexer(textInput).then(function(result) {
      let length = result.items.length;
      let wordsList = [];
      socket.emit('result', result)
      for(let i = 0; i < length; i++){
        let word = result.items[i].item
        let regex1 = /^(w|r|u|d|p|c)$/;
        let regex2 = /^是$/

        if(!(regex1).test(result.items[i].pos) && !(regex2).test(word)){
          wordsList.push(`${word}`);
          // console.log(`${word} ${result.items[i].pos}`)
        }
      }
      socket.emit('wordsList', wordsList)
    }).catch(function(err) {
        console.log(err);
    });
  })
})
