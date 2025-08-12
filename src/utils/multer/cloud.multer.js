import multer from"multer";

export const fileValidation = {
    image:["image/jpeg","image/png","image/gif"],
    document:["application/pdf","application/msword"],
}
export const  cloudFileUpload = ({customPath="general" ,validation=[]}={})=>{
const  storage =multer.diskStorage({
})
const fileFilter = function (req ,file , callback) {
    if ( validation.includes(file.mimetype)) {
        return callback(null, true)
    }
    return callback("In-valid file format", false)
}
return multer({
    fileFilter,
    limits:{fileSize: 1* 1024 *1024 },//1 mb
    storage
})
}