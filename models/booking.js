const mongoose = require('mongoose');
const { type } = require('os');

// Booking schema define karo
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true
    
   },
  email: { 
    type: String, required: true
 },
  phone: { 
    type: String, required: true
 },
  checkIn: { 
    type: Date, required: true
 },
  checkOut: {
     type: Date, required: true
     },
  guests: { 
    type: Number, required: true 
},
  totalPrice: { 
    type: Number, required: true
 },
  listing: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Listing' }, // optional reference
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'}
});

// Booking model create karo
const Booking = mongoose.model('Booking', bookingSchema);

// Export karo
module.exports = Booking;
