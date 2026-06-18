
require("dotenv").config();  // always load .env
// replace with correct path if cloudinary.js is in a subfolder

// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cookieParser = require("cookie-parser");

// Routes
const listingRouter = require("./routes/listing");
const userRouter = require("./routes/user");
const bookingRoutes = require("./routes/booking");

const wishlistRoutes = require("./routes/wishlist");

// Models
const User = require("./models/user");

// ======================
// Database Connection
// ======================
require("dotenv").config();
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";
// mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("Mongo Connection Error:", err));

// ======================
// App Config
// ======================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({  limit: '200mb', extended: true }));
app.use(express.json({ limit: '200mb' }));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ======================
// Session + Flash + Passport
// ======================
const sessionConfig = {
  secret: process.env.SECRET || "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 }
};
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// ======================
// Global Middleware for user + flash messages
// ======================
app.use((req, res, next) => {
  res.locals.currUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.info = req.flash("info");
  next();
});

// ======================
// Routes
// ======================
app.use("/wishlist", wishlistRoutes);
app.use("/listings", listingRouter);
app.use("/", userRouter);
app.use("/bookings",bookingRoutes);



app.get("/", (req, res) => res.redirect("/listings"));
app.get("/privacy", (req, res) => res.render("privacy"));
app.get("/terms", (req, res) => res.render("terms"));



// ======================
// 404 Handler
// ======================
app.use((req, res, next) => {
  res.status(404).render("error", { err: { statusCode: 404, message: "Page Not Found" } });
});



// ======================
// Global Error Handler
// ======================
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { err: { statusCode, message } });
});

// ======================
// Start Server
// ======================
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));