const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl, isloggedIn } = require("./middleware");
const multer = require("multer");
const { cloudinary, storage, uploadAvatar } = require("../cloudConfig");

const upload = multer({ storage });

// ---------------- Signup ----------------
router.get("/signup", (req, res) => {
  res.render("users/signup");
});

router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);

      req.flash("success", "Welcome to Wonderlust!");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
});

// ---------------- Login ----------------
router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);

// ---------------- Profile ----------------

// View profile page
router.get("/profile", isloggedIn, async (req, res) => {
  try {
    res.render("users/profile", { user: req.user });
  } catch (err) {
    console.log("PROFILE VIEW ERROR:", err);
    req.flash("error", "Cannot load profile!");
    res.redirect("/listings");
  }
});

// Edit profile form
router.get("/profile/edit", isloggedIn, async (req, res) => {
  try {
    res.render("users/editProfile", { user: req.user });
  } catch (err) {
    console.log("EDIT PROFILE ERROR:", err);
    req.flash("error", "Cannot load edit profile page!");
    res.redirect("/profile");
  }
});

// Update Profile Route
router.post("/profile/update", isloggedIn, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    const user = req.user;

    // Delete avatar if checkbox checked
    if (req.body.deleteAvatar === "on" && user.avatar && user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
      user.avatar = { url: "/images/default-avatar.png", public_id: null };
    }

    // Update text fields
    user.fullName = req.body.fullName || user.fullName;
    user.bio = req.body.bio || user.bio;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;
    user.address = req.body.address || user.address;
    if (req.file) {
  // Delete old avatar if exists
  if (user.avatar_public_id) {
    try {
      await cloudinary.uploader.destroy(user.avatar_public_id);
    } catch (err) {
      console.log("Cloudinary delete error:", err);
    }
  }

  // Save new avatar
  user.avatar = req.file.path || req.file.location;
  user.avatar_public_id = req.file.filename || req.file.public_id;
}



    await user.save();

    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
  } catch (err) {
    console.log("PROFILE UPDATE ERROR:", err);
    req.flash("error", "Error updating profile!");
    res.redirect("/profile/edit");
  }
});

// ---------------- Logout ----------------
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "You have logged out.");
    res.redirect("/listings");
  });
});

module.exports = router;