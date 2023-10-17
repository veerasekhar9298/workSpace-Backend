const reviewSchema = {
    rating: {
      notEmpty: {
        errorMessage: "Rating must be an integer",
      },
    },
    comment: {
      notEmpty: {
        errorMessage: "Review comment must be provided",
      },
    },
  };
  
  module.exports = { reviewSchema };
  