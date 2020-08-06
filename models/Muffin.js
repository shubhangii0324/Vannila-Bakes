
var mongoose = require("mongoose");

var muffinSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    imageId: String,
    recipe: String,
    phone: String,
    booking: String,
    createdAt: { type: Date, default: Date.now },
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      username: String
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
      }
    ],
    rateAvg: Number,
    rateCount: Number,
    hasRated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  });

module.exports = mongoose.model("muffin", muffinSchema);