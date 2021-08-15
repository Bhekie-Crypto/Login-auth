const express = require("express");
const { errors } = require("pg-promise");
const router = express.Router();
const db = require("../connection");
const bcrypt = require('bcrypt');
const { reject, resolve } = require("bluebird");
const passport = require("passport");

router.get('/login', ensureNotAuthenticated, (req, res) => res.render("login"));

router.get('/register', (req, res) => res.render("register"));

router.post('/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    //check required fields
    if(!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill all fields'});
    }

    //check password match
    if(password !== password2) {
        errors.push({msg: 'Passwords do not match'});
    }

    //check pass length
    if(password.length < 3){
        errors.push({msg: 'Password shoud be at least 3 characters'});
    }

    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //Validation passed
        let sql = ('select * from user where email= ? '); 
        db.query(sql, [email], (err, result) => {
            if (err) throw err;
                if (result.length>0){
                    errors.push({msg: 'Email already registered'});
                        res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }
            else{
                const bcryptPassword =  bcrypt.hash(password, 10);
                bcrypt.hash(password, 10).then(function(hash) {
                    let query = `INSERT INTO user  (name, email, password) VALUES (?, ?, ?);`;
                    db.query(query, [name, email, hash], (err,rows,fields) => {
                        // if(err) throw err;
                        req.flash("success_msg", "You are now registered and can log in");
                        res.redirect("/users/login");
                    });
                });
            }
        });
    }
});

router.post('/login', ensureNotAuthenticated, (req, res, next) => {
passport.authenticate('local', {
    successRedirect:  '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
})(req, res, next);
});


router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login')
})

function ensureNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
     return next();
}

module.exports = router;

