

module.exports.isloggedIn=(req,res,next)=>{
      if(!req.isAuthenticated()){
         req.session.redirectUrl = req.originalUrl; 
        req.flash("error","you must be logged in!");
     return   res.redirect("/login");
    }
    next();
}


module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};


const Review = require("../models/review");

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "🚫 You can delete only your own review!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};








