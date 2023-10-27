const express = require('express');
const body_parser = require('body-parser');

const admin = require('firebase-admin');
const serviceAccount = require('./keys.json');


const { subscribe } = require('diagnostics_channel');
const { default: axios } = require('axios');
const app = express().use(body_parser.json());
require('dotenv').config();

const port = process.env.PORT || 3000; // Set the port you want to use
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lnct-attendxnce-default-rtdb.asia-southeast1.firebasedatabase.app"
});


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
//console.log (JSON.stringify(body_param));

if (body_param.object){
if (body_param.entry &&
body_param.entry[0].changes &&
body_param.entry[0].changes[0].value.messages && 
body_param.entry[0].changes[0].value.messages[0]){

  let phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
  let from = body_param.entry[0].changes[0].value.messages[0].from;
  let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
  console.log("phone number: " + phon_no_id);
  console.log("message: " + msg_body);
  console.log("from: " + from);


  admin
    .database()
    .ref(`user/${from}`)
    .once('value')
    .then(snapshot => {
      const userData = snapshot.val();

      if (userData) {
        // User exists in the database
        const id = userData.id;
        const pass = userData.pass;

        // Use the childId and childApiToken to make an API call


         axios
          .get('https://lnct-attendance-adtm.onrender.com/attendance', {
            params: {
             username: id,
            password: pass,
              
            }
          })
          .then(response => {
            // Handle the API response
             let resp=response.data;
             let total = resp.percentage;

              const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';
  
  const data = {
    messaging_product: "whatsapp", 
  to: from, 
  text:{
  body: total + " " + resp.total + " " + resp.present + " " + resp.absent 
  }
  };
  
  const config = {
    headers: {
      Authorization: `Bearer EAASs6XgWjPMBO7tbfcpr9VmL3CL4wCU6bZBltw6prO7TN6BmoEJn906tuL1AOEPtnWlBhkyabNj6oz2hBSlK53pzqwN8eBhdsZB77KU6otGa1FBC98FyvcbPBBqyHrbH7sIzfbc7ctETia0cplaPIdLgExpjJmL51paLFQpHBIVCmgBuPZBPyoZBWQxyI1l5xlnM53I0zDD0nng35bSsisj0SmKZCw2AQYa8ZD`,
      'Content-Type': 'application/json'
    }
  };
  
  axios.post(url, data, config)
    .then(response => {
      console.log('Response:', success);
    })
    .catch(error => {
      
    });
            
            //console.log('API Response: ***********', response.data);


            
          })
          .catch(error => {
            // Handle API call error
            console.error('API Error', error);
          });

       
      } else {
        console.log('User not found in the database.');

      }
       res.sendStatus(200); // Respond to the webhook request
    })
    .catch(error => {
       console.error('Firebase database error:', error);
      res.sendStatus(500); // Respond with an error status
    });



 




  // const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';
  
  // const data = {
  //   messaging_product: "whatsapp", 
  // to: from, 
  // text:{
  // body: "Hi.. I'm Rishabh"
  // }
  // };
  
  // const config = {
  //   headers: {
  //     Authorization: `Bearer EAASs6XgWjPMBOZB4vjHN1vMn8Gdt0oSWZAaRr5mCvfXmcrJPWa9xOvOIZCZApJm54tUuFMic1lSchMgzbDbokZAfs1K9cg5ZA48rkZCuMZA86gxXyzlmAN3i5BVdwRGTqV77IJECggONeq68fc485uEWZBoxTmr57A63pZC048n0EHScBJ7xCB5J6qKYXvZB38Gmm4c0OtQgfRJgQyiPc2oXAYoVWQW2niLq0MgCYFS`,
  //     'Content-Type': 'application/json'
  //   }
  // };
  
  // axios.post(url, data, config)
  //   .then(response => {
  //     console.log('Response:', success);
  //   })
  //   .catch(error => {
      
  //   });
  

 // res.sendStatus(200);

}else{
  
  res.sendStatus(404);
}
}

  
});




app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
