var db = require('./db/db').db;
var users = db.create();
users.findByIdAndUpdate('local.email', 'vvoccia@google.com', {email:'vvoccia@hotmail.com', password:'abcd1234'})
.then(function(user){
    if (!user) {
      console.log("User not found!");
    }

    console.log(user);
  }).catch(function(e){
   console.log("Error");
  });
