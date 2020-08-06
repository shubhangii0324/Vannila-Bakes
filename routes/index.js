var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var muffin = require("../models/Muffin");

// root route
router.get("/", function(req, res) {
  res.render("landing");
});

router.get("/about", function(req, res) {
  res.render("about");
});

router.get("/muffins", function(req, res){
  muffin.find({}, function(err, allMuffins){
    if(err){
      console.log(err);
    } else {
      res.render("muffins/index", {muffins: allMuffins});
    }
  });
});

// show register form
router.get("/register", function(req, res) {
  res.render("register", {page: 'register'}); 
});

// handle sign up logic
router.post("/register", function(req, res) {
    var newUser = new User({
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      fullName: req.body.fullName,
      image: ""
    });
    if(req.body.adminCode === 'Nowhere/123'){
      newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user) {
      if (err) {
        return res.render("register", {
          error: err.message
        });
      }
      passport.authenticate("local")(req, res, function() {
        req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
        res.redirect("/muffins");
      });
    });
  }
    );

// show login form
router.get("/login", function(req, res) {
   res.render("login", {page: 'login'});
});

// handle login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/muffins",
    failureRedirect: "/login",
    failureFlash: true
  }),
  function(req, res) {}
);

// logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/muffins");
});

// user profile
router.get("/users/:user_id", function(req, res) {
  User.findById(req.params.user_id, function(err, foundUser) {
    if (err || !foundUser) {
      req.flash("error", "This user doesn't exist");
    }
    muffin.find()
      .where("author.id")
      .equals(foundUser._id)
      .exec(function(err, muffins) {
        if (err) {
          req.flash("error", "Something went wrong");
        }
        Comment.find()
          .where("author.id")
          .equals(foundUser._id)
          .exec(function(err, ratedCount) {
            if (err) {
              req.flash("error", "Something went wrong");
            }
            res.render("users/show", {
              user: foundUser,
              muffins: muffins,
              reviews: ratedCount
            });
          });
      });
  });
});

// edit profile
router.get(
  "/users/:user_id/edit",
  middleware.isLoggedIn,
  middleware.checkProfileOwnership,
  function(req, res) {
    res.render("users/edit", {
      user: req.user
    });
  }
);

// update profile
router.put(
  "/users/:user_id",
  middleware.checkProfileOwnership,
  function(req, res) {
    User.findByIdAndUpdate(req.params.user_id, async function(err, user) {
      if (err) {
        req.flash("error", err.message);
      } else {
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.fullName = req.body.fullName;
        user.save();
        req.flash("success", "Updated your profile!");
        res.redirect("/users/" + req.params.user_id);
      }
    });
  }
);

// delete user
router.delete("/users/:user_id",  middleware.checkProfileOwnership, function(
  req,
  res
) {
  User.findByIdAndRemove(req.params.id, async function(err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
      else {
        req.flash('error', 'deleted!');
        res.redirect('/muffins');
  }

  });
});
module.exports = router;