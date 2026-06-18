const axios = require("axios");

const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/review");
const { listingSchema, reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");
const { isloggedIn, isReviewAuthor } = require("./middleware");
const multer = require("multer");
const { cloudinary, storage } = require("../cloudConfig");
const upload = multer({ storage });
// const upload = multer({
//   storage: multer.diskStorage({}),
//   limits: { fileSize: 200 * 1024 * 1024 }  // 200 MB
// });

const Booking = require("../models/booking");
const Wishlist = require("../models/wishlist");


// ==============================
// Validation Middleware
// ==============================
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else next();
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const ratingError = error.details.find(el => el.path.includes('rating'));
    if (ratingError) {
      req.flash('error', '⚠️ Please rate first!');
    } else {
      const errMsg = error.details.map((el) => el.message).join(', ');
      req.flash('error', errMsg);
    }
    const { id } = req.params;
    return res.redirect(`/listings/${id}`);
  }
  next();
};


// ==============================
// ROUTES
// ==============================

// INDEX - show all listings
router.get("/", wrapAsync(async (req, res) => {
  const listings = await Listing.find({}).populate("owner");
  res.render("listings/index", { listings, currentUser: req.user });
}));

// NEW - show form to create listing
router.get("/new", isloggedIn, (req, res) => {
  res.render("listings/new");
});



// Again check for map
router.post(
  "/",
  isloggedIn,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  validateListing,
  wrapAsync(async (req, res) => {

    // ⭐ LOCATION TEXT → COORDINATES (OpenStreetMap)
    const geoRes = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: req.body.listing.location,
          format: "json",
          limit: 1
        },
        headers: {
          "User-Agent": "your-app-name" // ⚠️ REQUIRED by Nominatim
        }
      }
    );

    if (!geoRes.data.length) {
      req.flash("error", "Location not found");
      return res.redirect("/listings/new");
    }

    const lat = parseFloat(geoRes.data[0].lat);
    const lng = parseFloat(geoRes.data[0].lon);

    const newListing = new Listing({
      ...req.body.listing,
      geometry: {
        type: "Point",
        coordinates: [lng, lat] // ⭐ IMPORTANT
      }
    });

    newListing.owner = req.user._id;

    if (req.files["images"]) {
      newListing.images = req.files["images"].map(f => ({
        url: f.path,
        filename: f.filename,
      }));
    }

    if (req.files["video"]) {
      newListing.video = {
        url: req.files["video"][0].path,
        filename: req.files["video"][0].filename,
      };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  })
);



// ==============================
// SEARCH & FILTER ROUTES
// ==============================
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim() || "";
    let listings;

    if (query) {
      const regex = new RegExp(query, "i");
      listings = await Listing.find({
        $or: [
          { title: regex },
          { category: regex },
          { description: regex },
          { location: regex },
          { country: regex },
        ],
      });
    } else {
      listings = await Listing.find({});
    }

    if (!listings.length) {
      return res.render("listings/index", {
        listings: [],
        query,
        message: "No listings found matching your search.",
      });
    }

    console.log(listings.map(l => l.images));
    res.render("listings/index", { listings, query });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong while searching");
  }
});

router.get("/filter", async (req, res) => {
  const { category } = req.query;
  try {
    const listings = category
      ? await Listing.find({ category: new RegExp(category, "i") })
      : await Listing.find({});
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ==============================
// SHOW SINGLE LISTING
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("owner")
      .populate({
        path: "reviews",
        populate: { path: "author" },
      });

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // Wishlist logic
    let wishlist = { listings: [] };
    if (req.user) {
      const foundWishlist = await Wishlist.findOne({ owner: req.user._id }).populate("listings");
      if (foundWishlist) wishlist = foundWishlist;
    }

    res.render("listings/show", { listing, wishlist });
  } catch (err) {
    console.error("❌ Error in show route:", err);
    res.status(500).render("error", { message: "Server error" });
  }
});


// ==============================
// EDIT - show edit form
// ==============================
router.get("/:id/edit", isloggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this listing.");
    return res.redirect(`/listings/${id}`);
  }

  res.render("listings/edit", { listing });
}));


// ==============================
// UPDATE LISTING
// ==============================
router.put(
  "/:id",
  isloggedIn,
  upload.array("images", 10),
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You do not have permission to update this listing.");
      return res.redirect(`/listings/${id}`);
    }

    // 1️⃣ Update text fields
    const updateData = { ...req.body.listing };
    await Listing.findByIdAndUpdate(id, updateData);

    // 2️⃣ Update geometry if lat & lng provided
    if (req.body.listing.lat && req.body.listing.lng) {
      const lat = parseFloat(req.body.listing.lat);
      const lng = parseFloat(req.body.listing.lng);
      listing.geometry = {
        type: "Point",
        coordinates: [lng, lat],
      };
      await listing.save();
    }

    // 3️⃣ Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
      listing.images = listing.images.concat(newImages);
      await listing.save();
    }

    // 4️⃣ Delete selected images (safe for single/multiple or empty)
    let deleteImages = req.body.deleteImages || [];
    deleteImages = Array.isArray(deleteImages) ? deleteImages : [deleteImages];
    deleteImages = deleteImages.filter(f => f); // remove empty strings

    if (deleteImages.length > 0) {
      for (let filename of deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      listing.images = listing.images.filter(img => !deleteImages.includes(img.filename));
      await listing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
  })
);



// ==============================
// DELETE LISTING
// ==============================
router.delete("/:id", isloggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // ✅ Safe permission check
  if (!listing.owner || !listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete this listing!");
    return res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}));


// ==============================
// REVIEWS ROUTES
// ==============================
router.post("/:id/reviews", isloggedIn, validateReview, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  await newReview.save();
  listing.reviews.push(newReview);
  await listing.save();
  req.flash("success", "New review Created!");
  res.redirect(`/listings/${listing._id}`);
}));

router.delete("/:id/reviews/:reviewId", isloggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "🗑️ Review deleted successfully!");
  res.redirect(`/listings/${id}`);
}));


module.exports = router;