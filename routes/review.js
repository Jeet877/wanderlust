const express = require("express");
const router = express.Router({ mergeParams: true }); // access :id from parent route
const mongoose = require("mongoose");
const Review = require("../models/review");
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const { isloggedIn } = require("../middleware");




//CREATE review
router.post("/:id",isloggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;

  // Validate listing ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid listing ID.");
    return res.redirect("/listings");
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const review = new Review(req.body.review);

  if (!req.user) {
  req.flash("error", "You must be logged in to add a review.");
  return res.redirect(`/listings/${id}`);
}
  review.author = req.user._id;
  try {
    await review.save();
  } catch (err) {
    if (err.name === "ValidationError") {
      req.flash("error", `Validation Error: ${err.message}`);
      return res.redirect(`/listings/${id}`);
    }
    throw err; // re-throw if other error
  }

  listing.reviews.push(review._id);
  await listing.save();

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${id}`);
}));



// Review ni dikh rha esliye test
// router.post("/", isloggedIn, async (req, res) => {
//     const listing = await Listing.findById(req.params.id);
//     const review = new Review(req.body.review);
//     review.author = req.user._id; // ✅ Author set karna zaruri hai
//     listing.reviews.push(review);

//     await review.save();
//     await listing.save();
//     req.flash("success", "New review added!");
//     res.redirect(`/listings/${listing._id}`);
// });

// POST review route

router.post("/:id/reviews", isloggedIn, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id; // logged in user ko author set karo
    await review.save();

    listing.reviews.push(review);
    await listing.save();

    req.flash("success", "New review added!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while adding the review.");
    res.redirect("/listings");
  }
});



// TRY
router.get("/:id", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: { path: "author", select: "username" }   // 🔥 ye line user ka naam dikhayegi
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    console.log("Listing with reviews:", listing.reviews); // check karne ke liye

    res.render("listings/show", { listing });
}));









module.exports = router;
