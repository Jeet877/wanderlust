const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { type } = require("os");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  
    // 🆕 MULTIPLE images support
    images: [
      {
        url: String,
        filename: String,
      },
    ],
    video:{
      url:String,
      filename:String,
    },
//  Agar kahin error ho toh mutiple image support delete kar dena 

  image: {
    url: {
      type: String,
      default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs3k7eNa599g4WMXtdlM0TcDnhkeMGjtPXqw&s",
      set: v => (v === "" ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs3k7eNa599g4WMXtdlM0TcDnhkeMGjtPXqw&s" : v),
    },
    filename: {
      type: String,
      default: "",
    },
  },

  price: {
    type: Number,
    default: 0,
  },


  geometry: {
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // [lng, lat]
    required: true
  }
},
  location: String,
  country: String,
    
  views:{
    type:Number,
    default:0
  },


  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  category: {
    type:String,
    enum:["Trending","Rooms","Iconic cities","Mountain city","Castles","Boat","Camping","Farms","Dome","Igloo","Bath"],
    default: "Rooms",
  },
    bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }], // ← Booking references
},

{timestamps:true});

// Middleware: delete reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);
