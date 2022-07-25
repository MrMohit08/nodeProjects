const aws = require("aws-sdk") //load amazon web service software development kit


// aws credentials used by SDK, when the sdk loads it automatically searches the credentials 
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
        Key: "group1/profileImages/" + file.originalname, //specify the path where we want to upload object
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



module.exports.uploadFile = uploadFile

