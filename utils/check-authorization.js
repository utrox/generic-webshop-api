const CustomError = require("./customError");

// throws an error if the current user's not an admin AND their IDs dont match.
const checkAuthorization = (userID, reqUserObj) => {
  if (userID !== reqUserObj.userID && reqUserObj.role !== "admin") {
    throw new CustomError("You are unauthorized to access this route.", 403);
  }
};

module.exports = { checkAuthorization };
