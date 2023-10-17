const bookingSchema = {
    user: {
      notEmpty: {
        errorMessage: "User must be provided",
      },
    },
    workspaceId: {
      notEmpty: {
        errorMessage: "Workspace ID must be provided",
      },
    },
    spaceId: {
      notEmpty: {
        errorMessage: "Space ID must be provided",
      },
    },
    startTime: {
      isISO8601: {
        errorMessage: "Invalid start time format. Must be in ISO8601 format.",
      },
    },
    endTime: {
      isISO8601: {
        errorMessage: "Invalid end time format. Must be in ISO8601 format.",
      },
    },
    totalPrice: {
      notEmpty: {
        errorMessage: "Total price must be numeric",
      },
    }
  };
  
  module.exports = { bookingSchema };
  