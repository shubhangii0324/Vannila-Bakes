var express = require("express");
var router = express.Router({mergeParams: true});
var muffin = require("../models/Muffin");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Comments new
router.get("/new", middleware.isLoggedIn, function(req, res) {
    muffin.findById(req.params.id, function(err, muffin) {
      if (err) {
        console.log(err);
      } else {
        res.render("comments/new", { muffin: muffin });
      }
    });
  });
  
  // Comments create
  router.post("/", middleware.isLoggedIn, function(req, res) {
    muffin.findById(req.params.id, function(err, found) {
      if (err) {
        console.log(err);
      }
      var ratedArray = [];
      found.hasRated.forEach(function(rated) {
        ratedArray.push(String(rated));
      });
      if (ratedArray.includes(String(req.user._id))) {
        req.flash(
          "error",
          "You've already reviewed this, please edit your review instead."
        );
        res.redirect("/muffins/" + req.params.id);
      } else {
        muffin.findById(req.params.id, function(err, muffin) {
          if (err) {
            console.log(err);
            res.redirect("/muffins");
          } else {
            var newComment = req.body.comment;
            Comment.create(newComment, function(err, comment) {
              if (err) {
                req.flash("error", "Something went wrong.");
              } else {
                // add username and id to comment
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                muffin.hasRated.push(req.user._id);
                muffin.rateCount = muffin.comments.length;
                // save comment
                comment.save();
                muffin.comments.push(comment);
                muffin.save();
                req.flash("success", "Successfully added review!");
                res.redirect("/muffins/" + muffin._id);
              }
            });
          }
        });
      }
    });
  });
  
  // COMMENT EDIT ROUTE
  router.get(
    "/:comment_id/edit",
    middleware.checkCommentOwnership,
    function(req, res) {
      Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
          res.redirect("back");
        } else {
          res.render("comments/edit", {
            muffin_id: req.params.id,
            comment: foundComment
      });
    }
  });
    }
  );
  
  // COMMENT UPDATE ROUTE
  router.put("/:comment_id", middleware.checkCommentOwnership, function(
    req,
    res
  ) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
      err,
      updatedComment
    ) {
      if (err) {
        res.redirect("back");
      } else {
        req.flash("success", "Review updated!");
        res.redirect("/muffins/" + req.params.id);
      }
    });
  });
  
  // DESTROY COMMENT ROUTE
  router.delete("/:comment_id", middleware.checkCommentOwnership, function(
    req,
    res
  ) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
      if (err) {
        res.redirect("back");
      } else {
        req.flash("success", "Review deleted!");
        res.redirect("/muffins/" + req.params.id);
      }
    });
  });

module.exports = router;