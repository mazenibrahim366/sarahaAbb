

import joi from "joi"
import { asyncHandler } from "../utils/response.js"
import {  Types } from "mongoose";
import { genderEnum } from "../DB/models/User.model.js";
import { logoutEnum } from "../utils/security/token.security.js";

export const  generalFields= {
   
    fullName:joi.string().min(2),
    email: joi.string().email({minDomainSegments:2,maxDomainSegments:2}),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
    confirmPassword: joi.string().valid(joi.ref("password")),
    phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
    id:joi.string().custom((value, helper)=>{
return Types.ObjectId.isValid(value)?true:helper.message("In-valid mongoDB ID ")

}),
gender:joi.string().valid(...Object.values(genderEnum)),
flag:joi.string().valid(...Object.values(logoutEnum)).default(logoutEnum.stayLoggedIn),
file:{


    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding:joi.string().required(),
    mimetype:joi.string().required(),
    // finalPath: joi.string().required(),
    destination:joi.string().required(),
    filename: joi.string().required(),
    path: joi.string().required(),
    size: joi.number().positive().required(),



 }


}

export const validation =({validationSchema={}}={} ) => {
return asyncHandler(async(req ,res,next)=>{

    let validationError =[]
for (const key of  Object.keys(validationSchema)) {

    const validationResult= validationSchema[key].validate(req[key] ,{abortEarly:false})

    if(validationResult.error){
        validationError.push(validationResult.error.details)
    }
    
}
    if(validationError.length){
       return res.status(400).json({error_message:"validation error",data:{validationError}})
    }

   return next()
})
}
