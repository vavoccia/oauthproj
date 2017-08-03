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

        object.findById = function(prop, _user){
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
      
        object.findByIdAndUpdate = function(prop, _user, _obj){
            return new Promise(function(resolve,reject){
                if(instance.list() !== undefined){
                    var idx = instance.list().findIndex(x => get(x, prop) === _user);
                    if(idx >= 0){
                        var strat = prop.split('.')[0];
                        var obj = assign(instance.list()[idx][strat], _obj);
                        instance.list()[idx][strat] = obj;
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