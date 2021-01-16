require("dotenv").config();
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var lodash = require("lodash");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var muffin = require("./models/Muffin");
var Comment = require("./models/comment");
var User = require("./models/user");
// REQUIRING ROUTES

var commentRoutes = require("./routes/comments");
var muffinRoutes = require("./routes/muffins");
var indexRoutes = require("./routes/index");

var dbURL = "mongodb://localhost/yelp_camp" || "mongodb+srv://snape:Lily123@vannilabakes.rdmca.mongodb.net/test?retryWrites=true&w=majority";

 mongoose.connect(dbURL, 
       {useNewUrlParser: true,
        useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(`${__dirname}/public`));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("cookie-session")({
    secret: "Aditi is the best baker in the world!!",
    resave: false,
    saveUninitialized: false
}));

app.locals.moment = require("moment");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/muffins", muffinRoutes);
app.use("/muffins/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, function(){
    console.log("SERVER HAS STARTED");
});

