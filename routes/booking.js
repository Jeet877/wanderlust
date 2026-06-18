const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const Booking = require("../models/booking"); // Booking model import karna zaroori hai
const {isloggedIn}=require("./middleware");
const wrapAsync = require("../utils/wrapAsync");


//---------- wrapsyn can delete if u got any error
// Show logged-in user's bookings
// router.get("/", wrapAsync(async (req, res) => {
//   if (!req.user) {
//     req.flash("error", "You must be logged in to view bookings.");
//     return res.redirect("/login");
//   }

//   const bookings = await Booking.find({ user: req.user._id }).populate("listing");
//   res.render("bookings/index", { bookings, currentUser: req.user });
// }));



// 📍 INDEX – show all bookings of current user
router.get("/", isloggedIn, wrapAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
                                .populate("listing").populate('user');

                                if(bookings.length===0){
                                    req.flash( "BookingInfo","You haven't booked any listings yet.");
                                }
  res.render("bookings/index", { bookings, currentUser: req.user });
}));




// 📍 DELETE – cancel booking
router.delete("/:id", isloggedIn, wrapAsync(async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  req.flash("success", "Booking cancelled successfully!");
  res.redirect("/bookings");
}));



// Booking create karne ke liye
router.post("/listings/:id/bookings", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash('error', 'Listing not found');
      return res.redirect('back');
    }

    const { name, email, phone, checkIn, checkOut, guests, totalPrice } = req.body;

    // Booking create karo aur user + listing dono link karo
    const bookingData = {
      name,
      email,
      phone,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      listing: listing._id,
    };

    // Agar user logged in hai to booking me uska id daal do
    if (req.isAuthenticated() && req.user) {
      bookingData.user = req.user._id;
    }

    const booking = new Booking(bookingData);
    await booking.save();

    // Listing me booking ka reference add karo
    listing.bookings = listing.bookings || [];
    listing.bookings.push(booking._id);
    await listing.save();

    req.flash('success', 'Booking successful!');
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.log(err);
    req.flash('error', 'Something went wrong!');
    res.redirect('back');
  }
});


router.get("/listings/:id/bookings/new", isloggedIn, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("back");
    }
    res.render("bookings/bookingForm", { listing });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong!");
    res.redirect("back");
  }
});



module.exports = router;
