// const mongoose=require("mongoose");
// const Schema=mongoose.Schema;
// const passportLocalMongoose=require("passport-local-mongoose");

// const userSchema= new Schema({
//     email:{
//      type: String,
//      required:true
//     },
  
// });

// User.plugin(passportLocalMongoose); // Username,hashing,salting add automatically

// module.exports=mongoose.model('User',userSchema);



const { required } = require("joi");
const mongoose = require("mongoose");
const { type } = require("os");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

// Define schema
const userSchema = new Schema({
  username: {
    type:String,
    required:true,
    unique:true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase:true,
    trim:true,
  },
  // ⭐ Profile Page Fields ⭐
  fullName: {
    type: String,
    default: "",
  },

  bio: {
    type: String,
    default: "",
  },

  avatar: {
    type: String, // Cloudinary URL
    default: "/images/default-user.png", // Optional
  },

  phone: {
    type: String,
    default: "",
  },

  gender: {
    type: String,
    enum: ["male", "female", "other", ""],
    default: "",
  },

  address: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Apply passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose);

// Export the model (avoid re-declaration errors)
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
