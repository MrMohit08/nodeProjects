const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require("../Model/urlModel")
const { SET_ASYNC, GET_ASYNC } = require("../redisConfig");

//============================================Url Api's=========================================//

const createUrl = async function(req, res) {
    try{
        const data = req.body;
        const longUrl = data.longUrl.trim()
        const baseUrl = 'http://localhost:3000/'

//Check if data is coming in request body
    if(Object.keys(data).length == 0){
       return res.status(400).send({
        status: false, message: "Please enter URL"})
    }
//check if longUrl is present
    if((!longUrl) || (typeof(longUrl) != "string")){
     return res.status(400).send({
       status: false, message: "longUrl is required"})
    }
// check if long url is in valid format 
    if (!validUrl.isUri(longUrl)) {
     return res.status(400).send({
            status: false, message: "invalid URL"})
   }

   //Getting data from cache
   let CachedUrlData = await GET_ASYNC(`${longUrl}`)
   if (CachedUrlData) {
       return res.status(200).send({ 
        status: true, message: "success", data : CachedUrlData})
   }
   else{
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
        
    await SET_ASYNC(`${longUrl}`, JSON.stringify(saveUrl ))

      res.status(201).send({
     status: true, message: "Data created successfully", data : saveUrl})
 
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

