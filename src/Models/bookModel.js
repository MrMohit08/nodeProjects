const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({
    title:{
        type:String,
        required:"title is required",
        unique:true,
        trim:true
    },
    excerpt:{
        type:String,
        required:"excerpt is required",
        trim:true
    },
    userId:{
        type:ObjectId,
        ref:'User',
        required:"userId is required",
        trim:true
    },
    ISBN:{
        type:Number,
        required:"ISBN is required",
        unique:true,
        trim:true
    },
    category:{
        type:String,
        required:"category is required",
        trim:true
    },
    subcategory:{
        type:[String],
        required:"subcategory is required",
        trim:true
    },
    reviews:{
        type:Number,
        default:0,
        trim:true
    },
    deletedAt:{
        type:Date
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    releasedAt:{
        type:Date,
        required:true
    }
    
}, {timestamps:true})

module.exports = mongoose.model('Book',bookSchema)//books