
function model(){
  if(this !== global){
    if(_user){
      this.local = {email : undefined, password : undefined};
      this.facebook = {id: undefined, token: undefined, email : undefined, name: undefined};
      this.twitter = {id: undefined, token: undefined, displayName : undefined, username: undefined};
      this.google = {id: undefined, token: undefined, email : undefined, name: undefined};
    }  
  }else {
    return new model(_user);
  }
}


module.exports = model;