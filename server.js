const session = require("express-session");
const express = require("express");
const passport = require('passport');
const expressLayouts = require('express-ejs-layouts');
const flash = require("connect-flash")
const db = require("./connection");

const app = express();

const PORT = process.env.port || 5025;

//EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }))

// Passport config
require('./config/passport')(passport);

//express session
app.use(session({
    secret: "secret",
    resave: true,
    saveUnitliazed:true,    
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());


//connect flash
app.use(flash());

//global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//routers
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/user"));


//page not found
app.use((req, res, next) => {
    var err = new Error('Page not found.');
    err.status = 404;
    next(err);
});

//Handle pages that do no  exist
app.use((err, req,res,next) => {
    res.status(err.status || 500);
    res.send(err.message);
});

//start the application
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}` );
});