


const Joi = require("joi");


module.exports.reviewSchema=Joi.object({
    review:Joi.object({
     rating:Joi.number().required().min(1).max(5).required(),
     comment:Joi.string().required(),

    }).required(),
});


const reviewSchema = Joi.object({
  comment: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required()
});


module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.object({
      url: Joi.string().allow(null, ""),
      filename: Joi.string().allow(null, ""),
    }),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    category: Joi.string()
      .valid(
        "Trending",
        "Rooms",
        "Iconic cities",
        "Mountain city",
        "Castles",
        "Boat",
        "Camping",
        "Farms",
        "Dome",
        "Igloo",
        "Bath",
        "Hills",
      )
      .default("Rooms"),
  }).required(),

  // Add this to allow deleteImages array
   deleteImages: Joi.array().items(Joi.string().allow(""))  
});
