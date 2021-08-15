const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("../connection");

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ 
        usernameField: 'email',
        passwordField: 'password'
        }, 
        (email, password, done) => {
            //match user
            db.query('select * from user where email= "'+ email +'" ',function(err,user){
                if(err)
                throw new Error(err)
                
                //No email match this one in our database
                if(!user.length){
                    return done(null, false, { message: 'No user with that email'});
                }
                //Match password. Here we are usince bcrypt since our password is hashed using bcrypt
                bcrypt.compare(password, user[0].password, (err, result) => {
                        //Check if there is any error
                        if(err)
                            throw new Error(err)
                            
                        // if the user is found but the password is wrong
                        if (!result)
                        return done(null, false, {message: 'Password incorrect'});
                        
                    // all is well, return successful user
                    return done(null, user);
                });
            
            });
        })
    );
    // used to serialize the user for the session
    passport.serializeUser((user, done) => {
        done(null, user[0].id);
    });
    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
		db.query("select * from user where id = "+id,function(err,rows){	
			done(err, rows[0]);
		});
    });
}