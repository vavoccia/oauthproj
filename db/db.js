var jsonList = require('./dbData');
var bcrypt   = require('bcrypt-nodejs');
var get = require('lodash.get');
var assign = require('lodash.assign');
console.log(jsonList);
var fs = require('fs');
var db = (function(){
    var instance;
    function createInstance() {
        var object = new Object();

        object.list = function(){
            return jsonList;
        }
        
        object.find = function(){
            return new Promise(function(resolve,reject){
                if(instance.list() !== undefined){
                    resolve(instance.list());
                } else {
                    reject('No Data Found!')
                }
            });
        }

        function getProp(obj, id){
            return  obj.local.email === id ? true : 
                        obj.facebook.id === id ? true : 
                            obj.google.id === id ? true :
                                obj.twitter.id === id ? true : false;
        }


        object.findById = function(id){
            return new Promise(function(resolve,reject){
                if(instance.list() !== undefined){
                    var allUsers = instance.list();
                    var obj = allUsers.find(x => x.id === id);
                    resolve(obj);
                } else {
                    reject('No ToDo List');
                }
            });
        }

        object.findOne = function(prop, _user){
            return new Promise(function(resolve,reject){
                if(instance.list() !== undefined){
                    var allUsers = instance.list();
                    var obj = allUsers.find(x => get(x, prop) === _user);
                    resolve(obj);
                } else {
                    reject('No ToDo List');
                }
            });
        }

         object.delete = function(prop, _user){
            return new Promise(function(resolve,reject){
                if(instance.list() !== undefined){
                    var idx = instance.list().findIndex(x => get(x, prop) === _user);
                    if(idx >= 0){
                       instance.list().splice(idx,1);
                        fs.writeFile('./db/dbData.json', JSON.stringify(instance.list(), null,2), (err) => {
                            if (err) {
                                throw err;
                            } else {
                                console.log('The file has been saved!');
                            }
                        });                      
                    }
                    resolve(obj);
                } else {
                    reject('No Data Found!')
                }
            });
        }
      
        object.findByIdAndUpdate = function( _id, _obj){
            return new Promise(function(resolve,reject){
                if(instance.list() !== undefined){
                    var idx = instance.list().findIndex(x => x.id === _id);
                    if(idx >= 0){
                        instance.list()[idx] = _obj;
                        fs.writeFile('./db/dbData.json', JSON.stringify(instance.list(), null,2), (err) => {
                            if (err) {
                                throw err;
                            } else {
                                console.log('The file has been saved!');
                            }
                        });                      
                    }
                    resolve(instance.list()[idx]);
                } else {
                    reject('No Data Found!')
                }
            });
        }

        object.generateHash = function(password) {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        };

        object.validPassword = function(strat, password, user) {
            return bcrypt.compareSync(password, get(user, strat));
        };

        object.save = function(user){
            return new Promise(function(resolve,reject){
                if(instance.list() !== undefined){
                    var len = instance.list().length;
                    user.id = instance.list()[len-1].id + 1;
                    instance.list().push(user);
                    fs.writeFile('./db/dbData.json', JSON.stringify(instance.list(), null,2), (err) => {
                        if (err) throw err;
                        console.log('The file has been saved!');
                    });
                    resolve(user);     
                } else {
                    reject('No Data Found!')
                }
            });
        }       

        return object;
    }
    return { create: function () {
                    if (!instance) {
                        instance = createInstance();
                    }
                    return instance;
                }
            };
})();
module.exports = {db};