const express = require("express");
const router = express.Router();
const Wishlist = require("../models/wishlist");
const Listing = require("../models/listing");
const { isloggedIn } = require("./middleware"); // this is correct if middleware.js is inside routes folder


router.get("/", isloggedIn, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ owner: req.user._id }).populate("listings");
    res.render("wishlist/index", { wishlist: wishlist || { listings: [] } });
  } catch (err) {
    console.error("❌ Error loading wishlist:", err);
    res.status(500).render("error", { err: { statusCode: 500, message: "Failed to load wishlist" } });
  }
});


// Toggle add/remove listing to/from wishlist
router.post('/:id', isloggedIn, async (req, res) => {
  try {
    const listingId = req.params.id;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      req.flash('error', 'Listing not found');
      return res.redirect('back');
    }

    let wishlist = await Wishlist.findOne({ owner: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ owner: req.user._id, listings: [] });
    }

    // If listing already in wishlist -> remove it, else add it
    const exists = wishlist.listings.some(l => String(l) === String(listingId));
    if (exists) {
      wishlist.listings = wishlist.listings.filter(l => String(l) !== String(listingId));
      await wishlist.save();
      req.flash('success', 'Removed from wishlist');
    } else {
      wishlist.listings.push(listingId);
      await wishlist.save();
      req.flash('success', 'Added to wishlist');
    }

    // If the request comes from the wishlist page, stay there
    const referer = req.get('Referer') || '';
    if (referer.includes('/wishlist')) {
      res.redirect('/wishlist');
    } else {
      // Otherwise go back to the listing page (when clicking from listing detail)
      res.redirect(`/listings/${listingId}`);
    }
  } catch (err) {
    console.error('❌ Wishlist toggle error:', err);
    req.flash('error', 'Could not update wishlist');
    res.redirect('back');
  }
});



module.exports=router;