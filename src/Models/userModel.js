const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    title:{
        type:String,
        required:"title is required",
        enum:["Mr","Mrs","Miss"],
       
    },
    name:{
        type:String,
        required:"name is required field",
        trim:true
        
    },
    phone:{
        type:String,
        required:"phone is required field",
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:"email is required field",
        unique:true
        
    },
    password:{
        type:String,
        required:"password is required field",
        trim:true,
        min:8,
        max:15
    },
    address: {
        street: { type: String },
        city: { type: String },
        pincode: { type: Number }
    }

}, {timestamps:true})

module.exports = mongoose.model('User',userSchema)  //users