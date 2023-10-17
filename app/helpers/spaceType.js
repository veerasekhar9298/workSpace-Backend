const spaceTypeSchema = {
    name: {
      notEmpty: {
        errorMessage: "Space type name must be provided",
      },
    },
    quantity: {
      notEmpty: {
        errorMessage: "Quantity must be an integer",
      },
    },
    price: {
      notEmpty: {
        errorMessage: "Price must be numeric",
      },
    },
    owner: {
      notEmpty: {
        errorMessage: "Space type owner must be provided",
      },
    },
    workspace: {
      notEmpty: {
        errorMessage: "Associated workspace must be provided",
      },
    },
  };
  
  module.exports = { spaceTypeSchema };
  