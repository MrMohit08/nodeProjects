const BookModel = require("../Models/bookModel")
const ReviewModel = require("../Models/reviewModel")
const moment = require("moment")
const mongoose = require("mongoose");



const createReview = async function(req,res){
    try{
        // we create a variable named "data" and store req.body into  that variable
        let data = req.body // we passed the data through req.body in the postman
       //check for empty body
       if(Object.keys(data).length == 0) {
          return res.status(400).send({
            status: false, message: "please provide review data" })
    }
        let bookid = req.params.bookId // pass book id in path params
        if (!bookid) {
            return res.status(400).send({
               status: false, message: "bookId is required!!!" })
        }
    // check if book id is valid or not 
    let isValidbookID = mongoose.Types.ObjectId.isValid(bookid);
        if (!isValidbookID) {
            return res.status(400).send({
              status: false, message: "Book Id is Not Valid" });
        }

    data.bookId = bookid

    //check bookId exist in our database
    const book = await BookModel.findOne({ _id: bookid, isDeleted: false })//check id exist in book model
    if (!book){
        return res.status(404).send({ status: false, message: "BookId dont exist" })    
    }

    // validations for reviewedBy
    let reviewedBy = data.reviewedBy
    if(reviewedBy){

      if(!reviewedBy || (typeof(reviewedBy) != "string") || (reviewedBy.trim().length == 0) || !reviewedBy.match(
        /^[a-zA-Z0-9][a-zA-Z0-9\s\-,?_.]+$/)){
          return res.status(400).send({
            status:false, message:"reviewedBy is missing or it should contains only alphabets"})
         }
   }
   //validation for reviewedAt
   data.reviewedAt = moment(new Date()).format("YYYY-MM-DD")
    
   //validation for rating
    let rating = data.rating
    if (!rating) {
        return res.status(400).send({ 
          status: false, message: "please give the ratings!!!" })
  }
    let ratingvalidate = /^[0-5]{1}$/.test(rating)
    if (!ratingvalidate) {
        return res.status(400).send({ 
          status: false, message: "please provide rating in single digit from 0 to 5 only"})
    }
    
     const reviewData = await ReviewModel.create(data)
     let reviewDetails = await ReviewModel.find({_id: reviewData._id}).select({isDeleted:0,__v:0})
     //updated book document with reviews data
     let updateDetails = await BookModel.findOneAndUpdate({ _id: bookid }, { $inc: { reviews: 1 } }, { new: true }).select({__v: 0})
     let {...bookData} = updateDetails
       bookData._doc.reviewsData = reviewDetails // it return inserted data in _doc object
       res.status(201).send({
         status: true, message: "Success", data: bookData._doc })
    }
    catch (err) {
        res.status(500).send({ message: "Error", error: err.message })
    }
}

//=============================================update review===================================//

const updateReview = async function(req, res){
    try{
     
     let getID = req.params// accessing id from params
     let updateRequest = req.body // we passed the data through req.body in the postman
    //check valid book id
    let isValidbookID = mongoose.Types.ObjectId.isValid(getID.bookId);
    if (!isValidbookID) {
        return res.status(400).send({
          status: false, message: "Book Id is Not Valid" });
    }
    //check book data is exist or not
    let book = await BookModel.findOne({ _id: getID.bookId, isDeleted: false }).select({__v:0})
    if (!book) {
        return res.status(404).send({ status: false, message: "bookId is not matching with any existing bookId or it is deleted " })
    }
    //check valid review id
    let isValidreviewID = mongoose.Types.ObjectId.isValid(getID.reviewId);
    if (!isValidreviewID) {
        return res.status(400).send({
          status: false, message: "review Id is Not Valid" });
    }
    //checking review data is exist or not
    let reviewData = await ReviewModel.findOne({ _id: getID.reviewId, isDeleted: false }).select({isDeleted:0,__v:0})
        if (!reviewData) {
            return res.status(404).send({
             status: false, message: `reviewId dont exist or this reviews is not for ${book.title} book`})
        }
    
    // validation to check if data is coming or not in request body
    if(Object.keys(updateRequest).length == 0){
        return res.status(400).send({
         status: false, message : "Please provide details"})
}    
    const { reviewedBy, rating, review } = updateRequest  //object destructuring
    let updatedReview

    //validation for rating
    if(rating && (typeof(rating) == "number")){
        updatedReview = await ReviewModel.findOneAndUpdate({_id : getID.reviewId},{rating : rating},
            {new : true})  // set the new option to true to return the document after update was applied
      }
    let ratingvalidate = /^[0-5]{1}$/.test(rating)
    if (!ratingvalidate) {
        return res.status(400).send({ 
          status: false, message: "please provide rating in single digit from 0 to 5 only " })
    }
    //validation for reviewedBy
   if(reviewedBy && (typeof(reviewedBy) == "string") && (reviewedBy.trim().length != 0) && reviewedBy.match(
        /^[a-zA-Z0-9][a-zA-Z0-9\s\-,?_.]+$/)){
        updatedReview = await ReviewModel.findOneAndUpdate({_id : getID.reviewId},{reviewedBy : reviewedBy},{new : true})  // set the new option to true to return the document after update was applied
          }
    //validation for review
     if(review && (typeof(review) == "string") && (review.trim().length != 0) && review.match(
        /^[a-zA-Z0-9][a-zA-Z0-9\s\-,?_.]+$/)){
        updatedReview = await ReviewModel.findOneAndUpdate({_id : getID.reviewId},{review : review},{new : true})  // set the new option to true to return the document after update was applied
    }
    // check if update review is not created
    if(!updatedReview){
        return res.status(400).send({
          status : false,message :" No data updated due to invalid request"})
    }
     res.status(200).send({
       status: true, message: "Review updated successfully", data : updatedReview})
}
catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
}

//========================================Delete Review==============================//

const deleteReview = async function(req, res){
    try{
        let getID = req.params// accessing id from params
        //check valid book id
       let isValidbookID = mongoose.Types.ObjectId.isValid(getID.bookId);
       if (!isValidbookID){
        return res.status(400).send({status: false, message: "Book Id is Not Valid" });}

    //check book data is exist or not
       let book = await BookModel.findOne({ _id: getID.bookId, isDeleted: false })
       if (!book) {
           return res.status(404).send({ status: false, message: "bookId not found or it is deleted"})}

    //check valid review id
       let isValidreviewID = mongoose.Types.ObjectId.isValid(getID.reviewId);
       if (!isValidreviewID) {
           return res.status(400).send({status: false, message: "review Id is Not Valid" });}

    //checking review data is exist or not
       let reviewData = await ReviewModel.findOne({ _id: getID.reviewId, isDeleted: false })
           if (!reviewData) {
               return res.status(404).send({status: false, message: "reviewId should be present in params"})}

    //deleted data
     await ReviewModel.findOneAndUpdate({ _id: getID.reviewId, isDeleted: false }, { $set: { isDeleted: true} })
     await BookModel.findOneAndUpdate({ _id: getID.bookId }, { $inc: { reviews: -1 }})

          res.status(200).send({ Status: true, message: "Success" })
    
    }
 catch (err) {
        res.status(500).send({ message: "Error", error: err.message })
}
}


module.exports.createReview = createReview
module.exports.updateReview = updateReview
module.exports.deleteReview = deleteReview
