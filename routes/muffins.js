var express = require("express");
var router = express.Router();
var muffin = require("../models/Muffin");
var middleware = require("../middleware");
var Comment = require("../models/comment");


// Show all Products

router.get("/", function(req, res){
  muffin.find({}, function(err, allMuffins){
    if(err){
        console.log(err);
    } else {
      res.render("muffins/index",{muffins: allMuffins, currentUser: req.user});
    }
  });
});
  
  // CREATE - add new recipe to db
  router.post("/", middleware.isLoggedIn, function(
    req,
    res
  ) {
    var name = req.body.name;
    var image = req.body.image;
    var rec = req.body.recipe;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
      var newMuffin = {name: name, image: image, recipe: rec, price: price, author:author, currentUser: req.user}
          muffin.create(req.body.muffin, function(err, muffin) {
            if (err) {
              req.flash("error", err.message);
            } else {
                console.log(muffin)
                res.redirect("/muffins");
            }
          });
        });
  
  // NEW - show form to create new recipe
  router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("muffins/new");
  });
  
  // SHOW - shows more information about one product
  router.get("/:id", function(req, res) {
    muffin.findById(req.params.id)
      .populate("comments")
      .exec(function(err, foundMuffin) {
        if (err || !foundMuffin) {
          console.log(err);
          req.flash("error", "Sorry, that product does not exist!");
        }
        var ratingsArray = [];
  
        foundMuffin.comments.forEach(function(rating) {
          ratingsArray.push(rating.rating);
        });
        if (ratingsArray.length === 0) {
          foundMuffin.rateAvg = 0;
        } else {
          var ratings = ratingsArray.reduce(function(total, rating) {
            return total + rating;
          });
          foundMuffin.rateAvg = ratings / foundMuffin.comments.length;
          foundMuffin.rateCount = foundMuffin.comments.length;
        }
        foundMuffin.save();
        res.render("muffins/show", {
          muffin: foundMuffin
        });
      });
  });
  
  // EDIT ROUTE
  router.get(
    "/:id/edit",
    middleware.checkMuffinOwnership,
    function(req, res) {
        muffin.findById(req.params.id, function(err, foundMuffin){
            if(err){
                res.redirect("/muffins");
            } else {
                res.render("muffins/edit", {
                    muffin: foundMuffin,
                    currentUser: req.user
                  });
            }
        });
    }
  );
  
  // UPDATE ROUTE
  router.put(
    "/:id",
    middleware.checkMuffinOwnership,
    function(req, res) {
      muffin.findByIdAndUpdate(req.params.id, req.body.muffin, function(err, updatedMuffin){
        if (err) {
          req.flash("error", err.message);
          res.redirect("back");
        } else {
          muffin.save();
          req.flash("success", "Successfully updated your product!");
          res.redirect("/muffins/" + req.params.id);
        }
      });
    });
  
  // DESTROY ROUTE
  router.delete("/:id", middleware.checkMuffinOwnership, function(req, res) {
            muffin.findByIdAndRemove(req.params.id, function(err, muffin) {
              if(err) {
                  req.flash('error', err.message);
                  return res.redirect('/');
              } else {
              req.flash('error', 'deleted!');
              res.redirect('/muffins');
        }
    });
      });

module.exports = router;