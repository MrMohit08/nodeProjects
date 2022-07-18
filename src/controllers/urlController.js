const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require("../Model/urlModel")

//===========================================Validation=========================================//

const isValid=function(value){
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value !== 'string' || value.trim().length === 0) return false
    return true;
} 

//============================================Url Api's=========================================//

const createUrl = async function(req, res) {
    try{
        const data = req.body;
        const baseUrl = 'http://localhost:3000/'

    //Check if data is coming in request body
    if(Object.keys(data).length == 0){
       return res.status(400).send({
        status: false, message: "Please Provide details"})
    }
    //check longUrl is present or not
    if(!data.longUrl){
     return res.status(400).send({
       status: false, message: "longUrl is required"})
    }
    //check if longurl is in valid format
    if(!isValid(data.longUrl)){
        return res.status(400).send({
        status: false, message: 'It can not be null or undefined'})
     }   

    // check if baseurl is valid or not
    if(!validUrl.isUri(baseUrl)){
        return res.status(400).send({
           status: false, message: "baseurl is not valid format"}) 
    }
    
  // check long url is valid or not 
  if (validUrl.isUri(data.longUrl)) {
    let url = await urlModel.findOne({ longUrl: data.longUrl })
    if (url) {
        console.log("Already exists...");
        return res.status(409).send({
            status: false, message: "It is Already exists", data: url})
  }
   else {
    let urlCode = shortid.generate().toLowerCase(); // generating the url code in lowercase 
   //condition if urlCode is not generated
    if (!urlCode) {
        return res.status(400).send({
        status: false, message: "urlCode not generated"})
  }
 
// check if urlCode is present in database
let checkedUrlCode = await urlModel.findOne({urlCode:urlCode})
if (checkedUrlCode) {
    return res.status(409).send({
      status: false, message: "urlCode is already exist in our database"})}

let shortUrl = baseUrl + urlCode; // creating the short url 
   //check if short url is present or not
    if(!shortUrl){
        return res.status(400).send({
          status: false, message: "shorturl is not created"})
    }
    data.urlCode = urlCode
    data.shortUrl = shortUrl

    //creating a document in database
    let newUrl = await urlModel.create(data)
    if(!newUrl){
      return res.status(400).send({
        status : false,message :" No data found due to invalid request"})
  }

  let finalUrl = { ...newUrl.toObject() }
  delete finalUrl._id
  delete finalUrl.__v
  delete finalUrl.createdAt
  delete finalUrl.updatedAt  
     res.status(201).send({
     status: true, message: "Data created successfully", data : finalUrl})
    }
}
}
catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false, error: err.message});
  }
}


//==================================================get Url==========================================//

const getUrl = async function(req, res){
    try{
    const url = await urlModel.findOne({ urlCode: req.params.urlCode});
      if (url) {
          console.log("Redirecting to original url.....");
          return res.status(302).redirect(url.longUrl);
    } else {
          return res.status(404).send({ message: "No url found" });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({
          status : false, message: "Some error has occurred" });
      }
}





module.exports.createUrl = createUrl
module.exports.getUrl = getUrl

