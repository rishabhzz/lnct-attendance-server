const express = require('express');
const body_parser = require('body-parser');
const { subscribe } = require('diagnostics_channel');
const { default: axios } = require('axios');
const app = express().use(body_parser.json());
require('dotenv').config();

const port = process.env.PORT || 3000; // Set the port you want to use


const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

// Define a route to handle incoming webhook requests
app.get('/webhook', (req, res) => {
  // Handle incoming WhatsApp messages here
  console.log('Webhook received:', req.body);

  let mode = req.query["hub.mode"];
 let challenge =  req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if(mode && token){


    if(mode=="subscribe" && token == mytoken){
      res.status(200).send(challenge);
    }else{
      res.status(403); 
    }
  }
});


app.post('/webhook', (req, res) => {

  let body_param=req. body;
console.log (JSON.stringify(body_param, null,2));

if (body_param.object){
if (body_param.entry &&
body_param.entry[0].changes &&
body_param.entry[0].changes[0].value.message && 
body_param.entry[0].changes[0].value.message[0]){

  let phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
  let from = body_param.entry[0].changes[0].value.messages[0].from;
  let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

  axios({
    method: "POST",
  url:"https://graph.facebook.com/v13.0/"+phon_no_id+"/messages?access_token="+token,
  data:{
  messaging_product: "whatsapp", 
  to: from, 
  text:{
  body: "Hi.. I'm Rishabh"
  }
  },
    headers:{
      "Content-Type":"application/json"
    }

  });

  res.sendStatus(200);

}else{
  res.sendStatus(404);
}
}

  
});




app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
