const express = require('express');
const body_parser = require('body-parser');

const admin = require('firebase-admin');
const serviceAccount = require('./keys.json');


const { subscribe } = require('diagnostics_channel');
const { default: axios } = require('axios');
const app = express().use(body_parser.json());
require('dotenv').config();




const port = process.env.PORT || 3000; // Set the port you want to use


const rateLimitWindowMs = 30 * 1000; // 1 minute
const maxRequestsPerWindow = 1;

const requestCount = {}; // In-memory data store to track request counts



// Rate limiting middleware
app.use((req, res, next) => {
 
   let body_param=req.body;
  if (body_param.object){
    if (body_param.entry &&
    body_param.entry[0].changes &&
    body_param.entry[0].changes[0].value.messages && 
    body_param.entry[0].changes[0].value.messages[0]){

      let phone = body_param.entry[0].changes[0].value.messages[0].from;
      let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
      msg_body = msg_body.toLowerCase();


     
      const now = Date.now();
      if (!requestCount[phone]) {
        requestCount[phone] = [];
      }
  
      // Remove requests older than the rate limit window
      requestCount[phone] = requestCount[phone].filter((timestamp) => timestamp > now - rateLimitWindowMs);
  if(msg_body == 'at'){

       if (requestCount[phone].length < maxRequestsPerWindow) {
        // If the request count is within the limit, allow the request
        requestCount[phone].push(now);
        next();
      } else {
        console.log("multiple requess stopped");
      //  If the request count exceeds the limit, return an error response
       
        const data = {
          messaging_product: "whatsapp", 
        to: phone, 
        text:{
        body: "Too many requests, Please wait for a request to complete then send another message."
        }
        };
        const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';
        const config = {
              headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
            };
        
        axios.post(url, data, config)
          .then(response => {
            console.log('Response:', response);
          })
          .catch(error => {
            console.log('error while calling wa api using login command having user');
            
          });

         res.status(200).json({ error: 'Rate limit exceeded' });

      }
      
     }else{

   next();
   
     }
     
     
    
    
    }else{
     // requestCount[phone].push(now);
        next();

    }
    }else{
     
      next();

    }









});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lnct-attendxnce-default-rtdb.asia-southeast1.firebasedatabase.app"
});


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
  msg_body = msg_body.toLowerCase();
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
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
            };
            
            axios.post(url, data, config)
              .then(response => {
                console.log('Response:', response);
              })
              .catch(error => {
                console.log('error while calling wa api using login command having user');
                
              });

                        
              } else {

                const otp = Math.floor(Math.random() * 900000) + 100000;

                const admin2 = admin.database();
                const ref = admin2.ref('/codes/'+from);
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
                body: "Visit https://lnct-attendxnce.web.app/#accsoft and use this OTP *" + otp + "* to link your whatsapp number with your accsoft account!"
                }
                };
                
                const config = {
                  headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
                };
                
                axios.post(url, data, config)
                  .then(response => {
                    console.log('Response:', response);
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

                              
                              


                             if (total.includes("%")) {


                                 const data = {
                      messaging_product: "whatsapp", 
                    to: from, 
                    text:{
                    body: "📝 \n" + total + "\n" + resp.total + "\n" + resp.present + "\n" + resp.absent 
                    }
                    };
                    const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';                    
                    const config = {
                      headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
                    };
                    
                    axios.post(url, data, config)
                      .then(response => {
                        console.log('Response:', response);
                      })
                      .catch(error => {
                        console.log('error while calling wa api using at command normally',error);
                        
                      });
                              
                              
                              } else {
                                      console.log("No, 'total' does not contain a percentage sign.");
                                                  const data = {
                                                        messaging_product: "whatsapp", 
                                                        to: from, 
                                                        text:{
                                                        body: "📝 \n No attendance data found. \n It is maybe due to there is no attendance data present in your Accsoft Account. \n or you're in *final year* ( there's no attendance data for final year students)."
                                                        }
                                                        };

                              
                    const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';
                    
                    
                    
                    const config = {
                      headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
                    };
                    
                    axios.post(url, data, config)
                      .then(response => {
                        console.log('Response:', response);
                      })
                      .catch(error => {
                        console.log('error while calling wa api using at command normally',error);
                        
                      });
                                                                  
                                    }
                          

                              
                            


                              
                            })
                            .catch(error => {
                              // Handle API call error
                              const data = {
                                messaging_product: "whatsapp", 
                              to: from, 
                              text:{
                              body: "There was an error fetching your attendance." + "\n" + "Incorrect credentials do check your ID : " + id + " & Pass : " + pass + "\n" + "👉🏻 Use *check*  or *update* command to check or update your credentials" 
                              }
                              };
                              
                              const config = {
                                headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
                              };
                              const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';
                              
                              axios.post(url, data, config)
                                .then(response => {
                                  console.log('Response:', response);
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
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
                          };
                          
                          axios.post(url, data, config)
                            .then(response => {
                              console.log('Response:', response);
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
      const db = admin.database();
const keyToDelete = from; // Replace with the specific key you want to delete

const ref = db.ref(`/user/${keyToDelete}`);

ref.remove() // or ref.set(null) to delete
  .then(() => {
    console.log('Data deleted from Realtime Database using update command');
    const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';

    const data = {
      messaging_product: "whatsapp", 
    to: from, 
    text:{
    body: "Your old account is deleted. \n Reply with *LOGIN* command to link your number with updated ID and Password."
    }
    };

    const config = {
      headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
    };

    axios.post(url, data, config)
      .then(response => {
        console.log('Response:', response);
      })
      .catch(error => {
        console.log('error while calling wa api using delete command');
        
      });
  })
  .catch(error => {
    console.error('Error deleting data:', error);
    const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';

    const data = {
      messaging_product: "whatsapp", 
    to: from, 
    text:{
    body: "Please try again after some time. There was an error encoutered during updating your account. or it is maybe due to the reason that no Accsoft account is linked to this WA number, Check this by using *at* command"
    }
    };

    const config = {
      headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
    };

    axios.post(url, data, config)
      .then(response => {
        console.log('Response:', response);
      })
      .catch(error => {
        console.log('error while calling wa api using delete command');
        
      });
  });

    


}else{


    const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';

    const data = {
      messaging_product: "whatsapp", 
    to: from, 
    text:{
    body: "No account found. \n Use *Login* command to link your Accsoft account."

     
    }
    };

    const config = {
      headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
    };

    axios.post(url, data, config)
      .then(response => {
        console.log('Response:', response);
      })
      .catch(error => {
        console.log('error while calling wa api using update command');
        
      });




    }
    res.sendStatus(200); 
  })
  .catch(error => {
    console.error('Firebase database error:', error);
    res.sendStatus(500); // Respond with an error status
  });


  }else if(msg_body == 'delete'){


    admin
    .database()
    .ref(`user/${from}`)
    .once('value')
    .then(snapshot => {
      const userData = snapshot.val();

      if (userData) {
      const db = admin.database();
const keyToDelete = from; // Replace with the specific key you want to delete

const ref = db.ref(`/user/${keyToDelete}`);

ref.remove() // or ref.set(null) to delete
  .then(() => {
    console.log('Data deleted from Realtime Database');
    const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';

    const data = {
      messaging_product: "whatsapp", 
    to: from, 
    text:{
    body: "Your account has been successfully deleted."
    }
    };

    const config = {
      headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
    };

    axios.post(url, data, config)
      .then(response => {
        console.log('Response:', response);
      })
      .catch(error => {
        console.log('error while calling wa api using delete command');
        
      });
  })
  .catch(error => {
    console.error('Error deleting data:', error);
    const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';

    const data = {
      messaging_product: "whatsapp", 
    to: from, 
    text:{
    body: "There was an error encoutered during deleting your account. or it is maybe due to the reason that no Accsoft account is linked to this WA number, Check this by using *at* command"
    }
    };

    const config = {
      headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
    };

    axios.post(url, data, config)
      .then(response => {
        console.log('Response:', response);
      })
      .catch(error => {
        console.log('error while calling wa api using delete command');
        
      });
  });

    


}else{


    const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';

    const data = {
      messaging_product: "whatsapp", 
    to: from, 
    text:{
    body: "No account found. \n Use *Login* command to link your Accsoft account."

     
    }
    };

    const config = {
      headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
    };

    axios.post(url, data, config)
      .then(response => {
        console.log('Response:', response);
      })
      .catch(error => {
        console.log('error while calling wa api using delete command');
        
      });




    }
    res.sendStatus(200); 
  })
  .catch(error => {
    console.error('Firebase database error:', error);
    res.sendStatus(500); // Respond with an error status
  });

  }else if(msg_body == 'check'){





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
  body: "Your Accsoft login id :" + id + "\n" + "Your Accsoft Password is : "+pass
  }
  };

  const config = {
    headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
  };

  axios.post(url, data, config)
    .then(response => {
      console.log('Response:', response);
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
        body: "No account found." + "\n" + "Reply to this message with *HELP* to get the list of all the commands."
        }
        };

        const config = {
          headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
        };

        axios.post(url, data, config)
          .then(response => {
            console.log('Response:', response);
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






  }else{

    const url = 'https://graph.facebook.com/v17.0/167707166417060/messages';

    const data = {
      messaging_product: "whatsapp", 
    to: from, 
    text:{
    body: "Hola Users!👋🏻 \n Thank you for being a part! \n You can use following commands : \n 1. *Login* - To connect your WhatsApp number with your Accsoft Account. \n 2. *AT* - Use this command to get your current attendance. \n 3. *Update* - To update your ID or Pass. \n 4. *Delete* - To remove and unlink your account. \n 5. *check* - To check your credentials. \n . \n Loving this? Do let me know your feedback: https://instagram.com/lifeofrishxbh/" 
    }
    };

    const config = {
      headers: {
                Authorization: process.env.TOKEN,
                'Content-Type': 'application/json'
              }
    };

    axios.post(url, data, config)
      .then(response => {
        console.log('Response:', response);
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
