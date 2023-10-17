
const usernameSchema = {
    notEmpty: {
      errorMessage: "username must be provided",
    },
  };
  const passwordSchema = {
    notEmpty: {
      errorMessage: "password must be provided",
    },
  };
  const emailSchema = {
    notEmpty: {
      errorMessage: "email must be provided",
    },
    isEmail:{
      errorMessage:"valid email must be provided"
    }
  };
  
  
  
  const registerSchema = {
      username:usernameSchema,
      password:passwordSchema,
      email:emailSchema,
      firstName: {
        notEmpty: {
          errorMessage: "First name must be provided",
        },
      },
      lastName: {
        notEmpty: {
          errorMessage: "Last name must be provided",
        },
      },
      mobile: {
        notEmpty: {
          errorMessage: "Phone number must be provided",
        },
      }
  }
  
  const loginSchema = {
      email:emailSchema,
      password:passwordSchema
  }
  
  const updateProfileSchema = {
    firstName: {
        notEmpty: {
          errorMessage: "First name must be provided",
        },
      },
      lastName: {
        notEmpty: {
          errorMessage: "Last name must be provided",
        },
      },
      mobile: {
        notEmpty: {
          errorMessage: "Phone number must be provided",
        },
      },
      username:usernameSchema,
      email:emailSchema
  }


  
  module.exports = {registerSchema,loginSchema,updateProfileSchema}