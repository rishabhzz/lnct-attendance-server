const express = require('express');
const body_parser = require('body-parser');
const { subscribe } = require('diagnostics_channel');
const { default: axios } = require('axios');
const app = express().use(body_parser.json());
require('dotenv').config();

const port = process.env.PORT || 3000; // Set the port you want to use



const mytoken = 'rishabh';

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

  let body_param=req.body;
console.log (JSON.stringify(body_param));

if (body_param.object){
if (body_param.entry &&
body_param.entry[0].changes &&
body_param.entry[0].changes[0].value.message && 
body_param.entry[0].changes[0].value.message[0]){

  let phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
  let from = body_param.entry[0].changes[0].value.messages[0].from;
  let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
  console.log("phone number: " + phon_no_id);
  console.log("message: " + msg_body);



  const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';
  
  const data = {
    messaging_product: "whatsapp", 
  to: from, 
  text:{
  body: "Hi.. I'm Rishabh"
  }
  };
  
  const config = {
    headers: {
      Authorization: `Bearer EAASs6XgWjPMBOZB4vjHN1vMn8Gdt0oSWZAaRr5mCvfXmcrJPWa9xOvOIZCZApJm54tUuFMic1lSchMgzbDbokZAfs1K9cg5ZA48rkZCuMZA86gxXyzlmAN3i5BVdwRGTqV77IJECggONeq68fc485uEWZBoxTmr57A63pZC048n0EHScBJ7xCB5J6qKYXvZB38Gmm4c0OtQgfRJgQyiPc2oXAYoVWQW2niLq0MgCYFS`,
      'Content-Type': 'application/json'
    }
  };
  
  axios.post(url, data, config)
    .then(response => {
      console.log('Response:', success);
    })
    .catch(error => {
      console.error('inside if error');
    });
  

  res.sendStatus(200);

}else{
  console.log('outside');
  res.sendStatus(404);
}
}

  
});




app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
