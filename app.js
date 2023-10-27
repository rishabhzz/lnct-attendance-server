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

  if(msg_body == 'login'){


              admin
              .database()
              .ref(`user/${from}`)
              .once('value')
              .then(snapshot => {
                const userData = snapshot.val();

                if (userData) {
                  const id = userData.id;

              const data = {
              messaging_product: "whatsapp", 
            to: from, 
            text:{
            body: "Your whatsapp number is already registered with this Accsoft id : "+"\n" + id + "\n" + "If this is not you then reply with *delete* command to unlink your WhatsApp Number"
            }
            };
            const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';
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
                console.log('error while calling wa api using login command having user');
                
              });

                        
              } else {

                const otp = Math.floor(Math.random() * 900000) + 100000;

                const admin = admin.database();
                const ref = db.ref('/codes/'+from);
                const data2 = {
                 
                  otp: otp
                };
                
                ref.set(data2)
                  .then(() => {
                    console.log('Data added to Realtime Database');
                  })
                  .catch(error => {
                    console.error('Error adding data:', error);
                  });
                  const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';
                const data = {
                  messaging_product: "whatsapp", 
                to: from, 
                text:{
                body: "Visit https://vibrlabs.web.app/ and use this OTP " + otp + "to link your whatsapp number with your accsoft account!"
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
                    console.log('error while calling wa api using login command w/o user');
                    
                  });


              }
              res.sendStatus(200); // Respond to the webhook request
            })
            .catch(error => {
              console.error('Firebase database error:', error);
              res.sendStatus(500); // Respond with an error status
            });



  }else if(msg_body == 'at'){


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
                    body: total + "\n" + resp.total + "\n" + resp.present + "\n" + resp.absent 
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
                        console.log('error while calling wa api using at command normally');
                        
                      });
                              
                            


                              
                            })
                            .catch(error => {
                              // Handle API call error
                              const data = {
                                messaging_product: "whatsapp", 
                              to: from, 
                              text:{
                              body: "There was an error fetching your attendance." + "\n" + "Please verify if you're able to check your attendance through your browser. If you can then check your ID" + id + " & Pass" + pass + "\n" + "Please use *update command to update your credentials*" 
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
                                  console.log('error while calling wa api using at command eith user but not able to fetch data');
                                  
                                });
                              console.error('API Error', error);
                            });

                        
                        } else {
                          console.log('User not found in the database.');
                          const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';
                    
                          const data = {
                            messaging_product: "whatsapp", 
                          to: from, 
                          text:{
                          body: "Your whatsapp number is not linked with any Accsoft id" + "\n" + "To link your account reply with *login* command" 
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
                              console.log('error while calling wa api using at command w/o user');
                              
                            });

                        }
                        res.sendStatus(200); // Respond to the webhook request
                      })
                      .catch(error => {
                        console.error('Firebase database error:', error);
                        res.sendStatus(500); // Respond with an error status
                      });



  }else if(msg_body == 'update'){



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
                          
                     const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';

                    const data = {
                      messaging_product: "whatsapp", 
                    to: from, 
                    text:{
                    body: "Use this url https://vibrlabs.webapp to update your Accsoft ID and Password"
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
                        console.log('error while calling wa api using udate command with users');
                        
                      });
                        

                        
                        } else {
                          console.log('User not found in the database.');
                          const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';

                          const data = {
                            messaging_product: "whatsapp", 
                          to: from, 
                          text:{
                          body: "No account found." + "\n" + "Follow this url to link your whatsapp number with your Accsoft ID"
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
                              console.log('error while calling wa api using update command without users');
                              
                            });

                        }
                        res.sendStatus(200); // Respond to the webhook request
                      })
                      .catch(error => {
                        console.error('Firebase database error:', error);
                        res.sendStatus(500); // Respond with an error status
                      });


  }else if(msg_body == 'delete'){

    const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';

    const data = {
      messaging_product: "whatsapp", 
    to: from, 
    text:{
    body: "Your account has been successfully deleted"
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
        console.log('error while calling wa api using delete command');
        
      });

      res.sendStatus(200);

  }else{

    const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';

    const data = {
      messaging_product: "whatsapp", 
    to: from, 
    text:{
    body: "Use following commands and help yourself"
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
        console.log('error while calling wa api using else command');
        
      });

      res.sendStatus(200);

  }




}else{
  
  res.sendStatus(404);
}
}

  
});




app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});