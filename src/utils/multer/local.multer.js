import multer from"multer";
import path from"node:path";
import fs from"node:fs";
export const fileValidation = {
    image:["image/jpeg","image/png","image/gif"],
    document:["application/pdf","application/msword"],
}
export const  localFileUpload = ({customPath="general" ,validation=[]}={})=>{
 let basePath = `uploads/${customPath}`
 
const  storage =multer.diskStorage({
    destination : function(req, file, callback){
if (req.user?._id) {
    basePath = `uploads/${customPath}/${req.user?._id}`
}
const fullPath = path.resolve(`./src/${basePath}`)

 if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath,{recursive:true})
    }
        callback(null ,path.resolve(fullPath) )
    },
    filename:function(req, file, callback){
const uniqueFileName = Date.now() + "__"+ Math.random() +"__"+file.originalname
file.finalPath = basePath +"/"+ uniqueFileName
        callback(null ,uniqueFileName )
    }

})
const fileFilter = function (req ,file , callback) {
    // console.log(file)
    if ( validation.includes(file.mimetype)) {
return callback(null, true)
        
    }
    return callback("In-valid file format", false)
}
return multer({
    dest:"./temp",
    fileFilter,
    limits:{fileSize: 1* 1024 *1024 },//1 mb
    storage
})
}