const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema({
    bookId:{
        type:ObjectId,
        ref:'Book',
        required:"bookId is required"
    },
    reviewedBy:{
        type:String,
        required:true,
        default:"Guest",
        value: String
    },
    reviewedAt:{
        type:Date,
        required:true
    },
    rating:{
        type:Number,
        required:true,
        minlength:1,
        maxlength:5
    },
    review:String,
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

module.exports = mongoose.model('Review',reviewSchema)  //reviews