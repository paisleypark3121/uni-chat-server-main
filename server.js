const express = require('express');
require('@tensorflow/tfjs-node');
const fs = require('fs');
const qna = require('@tensorflow-models/qna');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const port = 3001
let loading = false;

let model = undefined;
let passage = undefined;

const ANSWER_ERROR = "Non ho trovato la risposta";
const STANDARD_LOADING = "LOADING";
const STANDARD_SUCCESS = "SUCCESS";
const STANDARD_ERROR = "ERROR";

app.post('/question', async (req, res) => {
    if(!passage){
      console.log('missing passage')
      res.send(createResponse(ANSWER_ERROR));
      return;
    }
    else if(loading){
      console.log('loading')
      res.send(createResponse(STANDARD_LOADING));
      return;
    }
    else{
      console.log('question')
      const question = req.body.QUESTION;
      if(!question){
        res.send(createResponse(ANSWER_ERROR));
        return;
      }
      loading = true;
      console.log(`this is my question`);
      console.log(question);
      const answers = await model.findAnswers(question, passage);
      loading = false;
      if(answers[0]){
        res.send(createResponse(answers[0].text));
        return;
      }
      res.send(createResponse(ANSWER_ERROR));
      return;
    }
});

app.post('/uploadPassage', async (req, res) => {
  if(loading){
    res.send(createResponse(STANDARD_LOADING));
    return;
  } 
  else {
    passage = req.body.PASSAGE;
    if(!passage){
      res.send(createResponse(STANDARD_ERROR));
      return;
    }
    res.send(createResponse(STANDARD_SUCCESS));
    
    return;
  } 
});


// Start the server
app.listen(port, async () => {
  loading = true;
  model = await qna.load();
  console.log(`uni-chat-server is listening on port ${port}\nBy Sabino Picariello`);
  loading = false;
})


function createResponse(obj){
  return {
    response: obj
  }
}


