const BookModel = require("../Models/bookModel")
const ReviewModel = require("../Models/reviewModel")
const UserModel = require("../Models/userModel")

const createBook = async function(req, res) {
    try {
       // we create a variable named "data" and store req.body into  that variable
        let data = req.body // we passed the data through req.body in the postman
        const{title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt} = data; // object destructuring

        // validation to check if data is coming or not in request body
    if(Object.keys(data).length == 0){
        return res.status(400).send({
         status: false, message : "Please provide details"})
}    
  // validation for userID 
  if((!userId) || (typeof(userId) != "string") || (userId.trim().length == 0)){
    return res.status(400).send({
      status:false,
      message:"userId is Missing or has invali entry"
 })
}
  // check if user id is exist in database
    const user = await UserModel.findById(userId)
    if(!user){
      return res.send({
          status:false,
          message:"user id is not found in our database"
        })
    }
// validation for book title - It is mandatory field 
     if((!title) || (typeof(title) != "string") || (title.trim().length == 0)){
       return res.status(400).send({
         status:false,
         message:"Title is Missing or has invali entry"
    })
}
//check if title is unique
 const titles = await BookModel.findOne({ title : title })
 if (titles) {
     return res.status(400).send({
        status: false,
        message: "title already exist"
     })
 }
// validation for excerpt 
 if(!excerpt || (typeof(excerpt) != "number") || (excerpt.trim().length == 0) || !excerpt.match(
    /^[a-zA-Z0-9][a-zA-Z0-9\s\-,?_.]+$/)){
    return res.status(400).send({
        status:false,
        message:"Excerpt Body is Missing or has invalid entry"
    })
}

  // validation for ISBN 
 if(!ISBN || (typeof(ISBN) != "string") || (ISBN.trim().length == 0) || !ISBN.match(
    /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/)){
    return res.status(400).send({
        status:false,
        message:"ISBN is Missing or has invalid entry, please provide 10 or 13 "
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
     message:"Category is missing or has invalid entry"
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
      message:"invalid entry"
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
     let isValidbookID = mongoose.Types.ObjectId.isValid(filterCondition.userId);
        if (!isValidbookID) {
            return res.status(400).send({
              status: false, message: "user Id is Not Valid" });
        }

   //To handle if multiple data in SubCategory
    if (filterCondition.subcategory) {
    filterCondition.subcategory = {$in: filterCondition.subcategory.split(",").map(sub => sub.trim())};
} 

   // get the data by filtered conditions and not deleted and also sort book name in alphabetical order 
  let displayingData = await BookModel.find(filterCondition).select({_id:1, title:1, excerpt:1, userId:1, category:1, releasedAt:1, reviews:1}).sort({title:1});
   if (!displayingData.length) {
       return res.status(404).send({ status: false, message: "No books found with requested query"})
      }
        res.status(200).send({
        status: true, message : "Book list", data : displayingData})
    

   //get all books in alphabetical order
      let allbooks = await BookModel.find({ isDeleted: false }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).sort({ title: 1 })
        if (!allbooks.length){
            return res.status(404).send({ status: false, message: "Book does not exist" })}
        res.status(200).send({ status: true, message: "Book list", data: allbooks })
        }
    
 catch (err) {
        res.status(500).send({
            status: false, message: err.message});
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
    // find book id in review model
    let getReviews = await ReviewModel.find({ bookId: getBookData._id, isDeleted: false }).select({isDeleted:0,__v:0});
    getBookData._doc.reviewsData = getReviews ////adding new property inside book object
         res.status(200).send({
         status: true, count: getReviews.length,
         message: "Books list",data: getBookData
    })
}
catch (err) {
    res.status(500).send({
      status: false,
      message: err.message
     })
  }
}

//--------------------------------------------update book-----------------------------------------------//

const updateBook = async function(req, res){
    try{
      // we create a variable named "requestBookId" here
      let requestBookId = req.params.bookId // we are getting bookid from path params
      let updateRequest = req.body 

      if(!requestBookId){
        return res.status(400).send({
          status:false,
          message: "Please give book id"
        })
    }
    //check if id is valid or not 
      let isValidbookID = mongoose.Types.ObjectId.isValid(requestBookId); // here we use method mongoose "isValid" method
        if (!isValidbookID) {
             return res.status(400).send({
              status: false,
              message: "Book Id is Not Valid"
         });
    }
    //check id exist in book model 
    let updateId = await BookModel.findById(requestBookId)
    if(!updateId || (updateId.isDeleted == true)){
        return res.status(404).send({
            status : false,
            message : "Book Id not Found"
        })         
    }
      
      let newTitle = updateRequest.title
      let newExcerpt = updateRequest.excerpt
      let newReleased = updateRequest.releasedAt
      let newISBN = updateRequest.ISBN

      //Checks if any condition is coming in request for updation
     if(Object.keys(updateRequest).length == 0){
        return res.status(400).send({
            status: false, message: "Mention the fields to be updated" })
      }

      let updatedBook
      //validation for newTitle
      if(newTitle && (typeof(newTitle) == "string") && (newTitle.trim().length != 0)){
        updatedBook = await BookModel.findOneAndUpdate(
            {_id : requestBookId}, 
            {title : newTitle},
            {new : true})  // set the new option to true to return the document after update was applied
      }

      // check if it unique
        const title = await BookModel.findOne({ title: newTitle })
            if (title) {
                return res.status(409).send({
                    status: false,
                    message: `title ${newTitle} already taken`
                 })
            }
           
        

      //validation for excerpt
      if(newExcerpt && (typeof(newExcerpt)== "string") && (newExcerpt.trim().length != 0)){
        updatedBook = await BookModel.findOneAndUpdate(
            {_id : requestBookId}, 
            {excerpt : newExcerpt},
            {new : true}) //set the new option to true to return the document after update was applied
    }

     // validation for ISBN
     if(newISBN && (typeof(newISBN)== "string") && (newISBN.trim().length != 0) && newISBN.match(
        /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/)){
        updatedBook = await BookModel.findOneAndUpdate({_id : requestBookId},{ISBN : newISBN},{new : true})
        }

    // check if ISBN is unique 
    const iisBN = await BookModel.findOne({ ISBN : newISBN})
    if (iisBN) {
        return res.status(409).send({
           status: false,
           message: `ISBN ${newISBN} already exist`
        })
    }
   // validation for releasedAt
   if (newReleased) {

    let validateDate = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/gm
    if (!validateDate.test(newReleased)) {
        return res.status(400).send({
            status: false,
            message: "date must be in format  YYYY-MM-DD or invalid!!!" })
       }
       updatedBook = await BookModel.findOneAndUpdate({_id : requestBookId},{releasedAt : newReleased},{new : true})
    }
    // check if update book is not created
    if(!updatedBook){
        return res.status(400).send({
          status : false,message :" No data updated due to invalid request"})
    }
     res.status(200).send({
       status: true, data : updatedBook})
}
catch(err){
    console.log("Error is from update book", err.message)
      res.status(500).send({
         status : false, msg : err.message})
}
}

//-------------------------------------------delete book by id------------------------//

const deleteBooks = async function(req , res){
    try{
        // we create a variable named "requestbookid" here
        let requestBookId = req.params.bookId //getting book id from path param
        
        if(!requestBookId){
            return res.status(400).send({
              status:false , message: "Please give book id"})
        }
    //check if id is valid or not 
       let isValidbookID = mongoose.Types.ObjectId.isValid(requestBookId); // here we use method mongoose "isValid" method
      if (!isValidbookID) {
           return res.status(400).send({
            status: false, message: "Book Id is Not Valid"});
  }
    //check id exist in book model 
    let deleteId = await BookModel.findById(requestBookId)
    if(!deleteId || (deleteId.isDeleted == true)){
        return res.status(404).send({
            status : false, message : "Book Id is not found in our database"})         
    }
    await BookModel.findOneAndUpdate({_id : requestBookId},{isDeleted : true, deletedAt : Date.now()},{new : true, upsert : true})
    await ReviewModel.updateOne({bookId:requestBookId, isDeleted:false},{ $set: {isDeleted:true}})
        res.status(200).send({
            status: true,
            message: "Book deleted successfully"});
}
    catch(err){
        res.status(500).send({
         status: false,
         error: err.message
})
           
    }
}

module.exports.createBook = createBook
module.exports.getAllBooks = getAllBooks
module.exports.getBooksById = getBooksById
module.exports.updateBook = updateBook
module.exports.deleteBooks = deleteBooks
