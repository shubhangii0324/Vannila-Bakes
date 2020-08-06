var muffin = require("../models/Muffin");
var Comment = require("../models/comment");
var User = require("../models/user");

//all the middleware goes here

var middlewareObj = {

};

middlewareObj.checkMuffinOwnership = function(req, res, next) {
  if(req.isAuthenticated()) {
    if(req.user.isAdmin) {
      muffin.findById(req.params.id, function(err, foundMuffin) {
        if (err || !foundMuffin) {
          req.flash("error", "Sorry, that recipe does not exist");
          res.redirect("/muffins");
        } else   {
         req.muffin = foundMuffin;
         next();
        }
      });
    }
  };
}

  middlewareObj.isAdmin = function(req, res, next) {
    if(req.isAuthenticated()) {
    if(req.user.isAdmin) {
      next();
    } else {
      req.flash('error', 'This site is now read only thanks to spam and trolls.');
      res.redirect('back');
    }
  }
}

  middlewareObj.checkProfileOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
    User.findById(req.params.user_id, function(err, foundUser) {
      if (err || !foundUser) {
        req.flash("error", "Sorry, that user doesn't exist");
        res.redirect("/muffins");
      } else if (foundUser._id.equals(req.user._id) || req.user.isAdmin) {
        req.user = foundUser;
        next();
      } else {
        req.flash("error", "You don't have permission to do that!");
        res.redirect("/muffins/" + req.params.user_id);
      }
    });
  };
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to login first!");
    res.redirect("/login");
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
  if(req.isAuthenticated()) {
  Comment.findById(req.params.comment_id, function(err, foundComment) {
    if (err || !foundComment) {
      req.flash("error", "Sorry, that comment does not exist!");
      res.redirect("/muffins");
    } else if (
      req.user.isAdmin
    ) {
      req.comment = foundComment;
      next();
    } else {
      req.flash("error", "You don't have permission to do that!");
      res.redirect("/muffins/" + req.params.id);
    }
  });
};
}

module.exports = middlewareObj;