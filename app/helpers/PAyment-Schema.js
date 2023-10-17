const paymentSchema = {
    totalPrice: {
      notEmpty: {
        errorMessage: "Price must be provided",
      },
    },
    booking: {
      notEmpty: {
        errorMessage: "Booking information must be provided",
      },
    },
    amount: {
      isNumeric: {
        errorMessage: "Amount must be numeric",
      },
    },
    paymentMethod: {
      notEmpty: {
        errorMessage: "Payment method must be provided",
      },
    },
    transactionId: {
      notEmpty: {
        errorMessage: "Transaction ID must be provided",
      },
    },
    status: {
      notEmpty: {
        errorMessage: "Payment status must be provided",
      },
    },
  };
  
  module.exports = { paymentSchema };
  