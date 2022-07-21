const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require("../Model/urlModel")
const { SET_ASYNC, GET_ASYNC } = require("../redisConfig");

//=======================================Validation========================================//

const isValid = function (value) {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value !== 'string' || value.trim().length === 0) return false
  return true;
}

//============================================Url Api's=========================================//

const createUrl = async function(req, res) {
    try{
        const data = req.body;
        const longUrl = data.longUrl
        const baseUrl = 'http://localhost:3000/'

//Check if data is coming in request body
    if(Object.keys(data).length == 0){
       return res.status(400).send({
        status: false, message: "Please enter URL"})
    }
//check if longUrl is not null or undefined
if (!isValid(longUrl)) {
  return res.status(400).send({
     status: false, message: "long url is required and it should be null or undefined"
  })
}
// check if long url is in valid format 
    if (validUrl.isUri(longUrl)) {
    let urlCode = shortid.generate().toLowerCase(); // generating the url code in lowercase 

// check if urlCode is present in database
    let checkedUrlCode = await urlModel.findOne({urlCode:urlCode})
      if (checkedUrlCode) {
         return res.status(409).send({
             status: false, message: "urlCode is already exist in our database"})}

    let shortUrl = baseUrl + urlCode; // generating the short url 
  
//Saving data in database
    let saveData = { longUrl, shortUrl, urlCode }
    let saveUrl = await urlModel.create(saveData)
    let finalUrl = { ...saveUrl.toObject() }
         delete finalUrl._id
         delete finalUrl.__v
         delete finalUrl.createdAt
         delete finalUrl.updatedAt
    
    await SET_ASYNC(`${longUrl}`, JSON.stringify(finalUrl))

    res.status(201).send({
      status: true, message: "Data created successfully", data : finalUrl})

    return  res.status(400).send({status: false, message: "Enter a valid Url"});
    }  
   }
    catch (err) {
      return res.status(500).send({
       status: false, error: err.message});
  }
}


//==================================================get Url==========================================//

const getUrl = async function(req, res){
    try{
    //getting the data from cache if present
    let cacheData = await GET_ASYNC(`${req.params.urlCode}`)
       console.log("cacheData=" , cacheData)
    //converting from string to JSON
    let url = JSON.parse(cacheData)
    if(url){
         return res.status(302).redirect(url.longUrl) // redirecting to original url
    }else{
        let code = await urlModel.findOne({urlCode: req.params.urlCode}) 
        if(!code){
           return res.status(400).send({status: false, message:"Url-code not Found"})
        }
        //if already exist then setting the document in the cache
        await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(code))

        //redirecting to the original url
        return res.status(302).redirect(code.longUrl);
}
    }
    catch(err){
      return res.status(500).send({status: false, Error: err.message})
  }
  }





module.exports.createUrl = createUrl
module.exports.getUrl = getUrl

