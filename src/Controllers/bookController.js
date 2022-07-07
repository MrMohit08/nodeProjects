const BookModel = require("../Models/bookModel")
const ReviewModel = require("../Models/reviewModel")
const UserModel = require("../Models/userModel")

const createBook = async function(req, res) {
    try {
       // we create a variable named "data" and store req.body in the variable
        let data = req.body // we passed the data through req.body in the postman
        const{title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt} = data; // object destructuring

        // validation to check if data is coming or not in request body
    if(Object.keys(data).length == 0){
        return res.status(400).send({
         status: false,
         msg : "Please provide details"
    })
}    
  // validation for userID 
  if((!userId) || (typeof(userId) != "string") || (userId.trim().length == 0)){
    return res.status(400).send({
      status:false,
      msg:"userId is Missing or has invali entry"
 })
}
  // validation for userId -userId is a valid userId
    const user = await UserModel.findById(userId)
    if(!user){
      return res.send({
          status:false,
          msg:"Enter valid USER ID"
        })
    }

 // validation for book title - It is mandatory field 
     if((!title) || (typeof(title) != "string") || (title.trim().length == 0)){
       return res.status(400).send({
         status:false,
         msg:"Title is Missing or has invali entry"
    })
}
 
 // validation for excerpt 
 if(!excerpt || (typeof(excerpt) != "string") || (excerpt.trim().length == 0) || !excerpt.match(
    /^[a-zA-Z0-9][a-zA-Z0-9\s\-,?_.]+$/)){
    return res.status(400).send({
        status:false,
        msg:"Excerpt Body is Missing or has invalid entry"
    })
}

  // validation for ISBN 
 if(!ISBN || (typeof(ISBN) != "string") || (ISBN.trim().length == 0) || !ISBN.match(
    /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/)){
    return res.status(400).send({
        status:false,
        msg:"ISBN is Missing or has invalid entry"
    })
}

 // check ISBN is unique
 const isBN = await BookModel.findOne({ ISBN : ISBN})
 if (isBN) {
     return res.status(400).send({
        status: false,
        message: "ISBN already exist"
     })
 }
 
 // validation for category
 if(!category || (typeof(category) != "string") || (category.trim().length == 0)){
    return res.status(400).send({
     status:false,
     msg:"Category is missing or has invalid entry"
    })
}

//validation for subcategory
if (!Array.isArray(subcategory)) {  // Array.isArray() method determines whether the passed value is an Array.
      return res.status(400).send({
         status: false,
         message: "SUBCATEGORY type is invalid!!!"
         })
}
// check subcategory is empty 
if (subcategory.length == 0) { 
    return res.status(400).send({
      status: false,
      message: "SUBCATEGORY cannot be empty!!!" 
  })
}
// validates elements of sub category 
 const Arr = subcategory.filter((content) => content.trim().length != 0)
        subcategory = Arr

// validation for reviews
if((typeof(reviews) != "number") || (reviews.trim().length == 0) || !reviews.match(/^[0-9]+$/)){
    return res.status(400).send({
      status:false,
      msg:"invalid entry"
 })
}

// validation for Released At
if (!releasedAt) {
    return res.status(400).send({
     status: false,
     message: "RELEASED DATE is required!!!"
 })
}
// validate date input 
var date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
if (!date_regex.test(releasedAt)) {
    return res.status(400).send({
     status: false,
     message: "date must be in format YYYY-MM-DD!!!"
  })
}

// After passing all the validations now create the data 
const book = await BookModel.create(data)
   return res.status(201).send({
     status:true,
     message:"Book created successfully",
     data:book
   })
 }
 catch (err) {
    return res.status(500).send({
     status: false,
     message: err.message
 })
 }
}

//----------------------------------------Returns all books in the collection----------------------//

const getAllBooks = async function(req, res){
    try{
        // we create a variable named "filterConditions" and store req.query in that variable
        let filterCondition = req.query // we passed the data through req.query in the postman
        filterCondition.isDeleted = false; 
        
//Validation If userId is present
  if(filterCondition.userId){
    if (!filterCondition.userId.match(/^[0-9a-f]{24}$/)){
      return res.status(400).send({
          status : false,
          msg : "Not a valid ObjectId"
      })
   }
  }

//To handle if multiple data in SubCategory
if (filterCondition.subcategory) {
    filterCondition.subcategory = {$in: filterCondition.subcategory.split(",").map(sub => sub.trim())};
} 

// get the data by filtered conditions and not deleted and also sort book name in alphabetical order 
let displayingData = await BookModel.find(filterCondition).select({_id:1, title:1, excerpt:1, userId:1, category:1, releasedAt:1, reviews:1}).sort({title:1});
   
//check data is coming or not 
    if(displayingData.length == 0){
      return res.status(404).send({
        status : false,
        msg : "No matcing document"
    })
  }
       res.status(200).send({
       status : true, 
       data : displayingData
  })

}
    catch (err) {
        res.status(500).send({
            status: false,
            message: err.message
        });
    }
}

//----------------------------------------get data by book id------------------------------------//

const getBooksById = async function (req, res) {
    try{
    //we create a variable named "bookId" here
        let bookId  = req.params.bookId //we are getting bookid from path params

    //validate if object id is entered or not 
        if(!bookId){
          return res.status(400).send({
            status:false, 
            message: "Please give book id"
        })
        }
    //check if objectId is in valid format
        let isValidbookID = mongoose.Types.ObjectId.isValid(bookId);
        if (!isValidbookID) {
            return res.status(400).send({
               status: false,
               message: "Book Id is Not Valid" 
        });
     }
    const getBookData = await BookModel.findById(bookId)
    if(!getBookData){
        return res.status(404).send({
            status : false,
            message : "book id is not present in the database"
        })
    }
    if(getBookData.isDeleted == true){
         return res.status(404).send({
          status: false,
          message: "Book not found or have already been deleted"
         })
    }     

    let getReviews = await ReviewModel.find({ bookId: getBookData._id, isDeleted: false });

         




    
    }
}