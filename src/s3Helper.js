const aws = require("aws-sdk") //load the SDK for javaScript-nodejs application


// aws credential data used by SDK, when the sdk for javascipt loads it automatically searches the credentials 
aws.config.update({
    accessKeyId:"AKIAY3L35MCRVFM24Q7U",
    secretAccessKey:"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",
    region: "ap-south-1" // set the region
}) 
//create s3 service object
let s3= new aws.S3({apiVersion: '2006-03-01'});

// this function will upload file to aws and return the link
let uploadFile = ( file) =>{     

// setting up S3 upload parameter
 var uploadParams= {
        ACL: "public-read", //access control list 
        Bucket: "classroom-training-bucket", //name of the bucket
        Key: "aws-user/" + file.originalname, //specify the path where we want to upload object
        Body: file.buffer //body specifies the buffer ,typed array, blob, string data type.
    }
   // uploading files to the bucket 
    s3.upload(uploadParams, function (err, data){  //callback function
        if(err) {
            console.log("Error", err)
        }
        if (data) {
             console.log(data)
             console.log("file upload successfully", data.Location)
        }
    })
}

let bookCover = async function(req, res){
    try{
        let files = req.files //we are accessing the file data through req.files with the help of multer 
        if(files && files.length>0){  //condition to check if file data is coming or not

          let uploadedFileUrl = await uploadFile( files[0] )
            res.status(201).send({message: "file uploaded successfully", data:uploadedFileUrl})
        }
        else{
            res.status(400).send({message: "no file found"})
        }
    }
    catch(err){
         res.status(500).send({message: err})
    }
}

module.exports.bookCover= bookCover
