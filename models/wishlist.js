const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
  image:String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  listings: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing"
    }
  ]
});

module.exports = mongoose.model("Wishlist", wishlistSchema);