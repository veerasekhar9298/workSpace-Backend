const workspaceSchema = {
    name: {
      notEmpty: {
        errorMessage: "Workspace name must be provided",
      },
    },
    description: {
      notEmpty: {
        errorMessage: "Workspace description must be provided",
      },
    },
    address: {
      notEmpty: {
        errorMessage: "Workspace location must be provided",
      },
    },
    facilities: {
      isArray: {
        errorMessage: "Facilities must be an array",
      },
    },
    images: {
      isArray: {
        errorMessage: "Images must be an array",
      },
    },
    owner: {
      notEmpty: {
        errorMessage: "Workspace owner must be provided",
      },
    }
  };
const editworkspaceSchema = {
    name: {
      notEmpty: {
        errorMessage: "Workspace name must be provided",
      },
    },
    description: {
      notEmpty: {
        errorMessage: "Workspace description must be provided",
      },
    },
    address: {
      notEmpty: {
        errorMessage: "Workspace location must be provided",
      },
    },
    facilities: {
      isArray: {
        errorMessage: "Facilities must be an array",
      },
    },
    owner: {
      notEmpty: {
        errorMessage: "Workspace owner must be provided",
      },
    }
  };
  
  module.exports = { workspaceSchema,editworkspaceSchema };
  