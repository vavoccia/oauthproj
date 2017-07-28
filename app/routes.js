module.exports = function(app, express) {
    var router = express.Router();

    router.get('/test', (req, res) => {
        res.render('test.ejs');
    });
// app.get('/users', function(req, res) {
//   users.find().then(function(_users) {
//     res.send(_users);
//   }, function(e){
//     res.status(400).send(e);
//   });
// });



// app.post('/users', function(req, res) {
//   var user = new userModel(req.body);
//   users.save(user).then(function(doc) {
//     res.send(doc);
//   }, function(e) {
//     res.status(400).send(e);
//   });
// });

// app.patch('/users/:id', function(req, res){
//   var id = req.params.id;
//   var body = _.pick(req.body, ['pwd', 'email']);

//   users.findByIdAndUpdate(id,body).then(function(user){
//     if (!user) {
//       return res.status(404).send();
//     }

//     res.send({user});
//   }).catch(function(e){
//     res.status(400).send();
//   })
// });

// app.delete('/users/:id', function(req, res){
//   var id = req.params.id;

//   users.delete(id).then(function(user){
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.send(user);
//   }).catch(function(e){
//     res.status(400).send();
//   });
// });

// app.get('/users/:id', function(req, res){
//   var id = req.params.id;
  
//   users.findById(id).then(function(user) {
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.send(user);
//   }).catch(function(e){
//     res.status(400).send();
//   });
//});
    app.use('/', router);
}
