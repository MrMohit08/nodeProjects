const mongoose = require("mongoose");

//this validation will check the type of values--
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
};

//this validbody checks the validation for the empty body
const isValidBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};
//checks wheather object id is valid or not
const isValidObjectId = function (ObjectId) {
    if (!mongoose.Types.ObjectId.isValid(ObjectId)) {
         return false;
    }
    return true;
  };
//valid type of name
const isValidName = function (value) {
    if (!(/^[A-Za-z ]+$/.test(value.trim()))) {
        return false
    }
    return true
};
//valid type of phone no
const isValidMobileNo = function (mobile) {
    return /((\+91)?0?)?[6-9]\d{9}$/.test(mobile);
  };
//validation for password
const isValidPassword = function (value) {
    if (!(/^[a-zA-Z0-9'@&#.\s]{8,15}$/.test(value))) {
        return false
    }
    return true
};


  module.exports.isValid = isValid
  module.exports.isValidBody = isValidBody
  module.exports.isValidObjectId = isValidObjectId
  module.exports.isValidName = isValidName 
  module.exports.isValidMobileNo = isValidMobileNo
  module.exports.isValidPassword = isValidPassword
