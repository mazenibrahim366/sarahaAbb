

import UserModels, { providerEnum } from "../../DB/models/User.model.js"
import { asyncHandler, successResponse } from "../../utils/response.js"
import { create, findOne, updateOne } from "../../DB/db.service.js"
import { compareHash,  generateHash} from "../../utils/security/hash.security.js"
import { encryptEncryption } from "../../utils/security/encryption.security.js"
import { generateLoginToken, generateToken, getSignature, signatureTypeEnum } from "../../utils/security/token.security.js"
import {OAuth2Client} from'google-auth-library'
import { sendEmail } from "../../utils/Email/send.email.js"
import {customAlphabet, nanoid} from "nanoid"
import { emailTemplate } from "../../utils/Email/email.template.js"
import { newConfirmOtp, newOtpPassword } from "../../utils/Email/newConfirmOtp.email.js"





// console.log(new Date(Date.now()+2 * 60 * 1000));

// console.log(Date.now());
// console.log(Date.now()-Date.now()+2 * 60 * 1000);
// console.log(new Date().toLocaleTimeString());
// console.log( new Date(Date.now()+1)> new Date());
// console.log( new Date().getTime() + 5 * 60 * 1000);




// helper service methods

async function verify(idToken) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID.split(","),  // Specify the WEB_CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  return payload
}




// system authentication

export const  signup = asyncHandler(
  async (req ,res ,next) => {

let dateExpired =new Date(Date.now()+2 * 60 * 1000)
    const {fullName  ,email ,password ,phone} =req.body 

  const encPhone= await encryptEncryption({message:phone})
 const   user = await  findOne({ model:UserModels , filter:{email}})

    if (user) {
        return next(new Error("Email exist",{cause:409}))
    }
    const otp = customAlphabet("0123456789",6)()
  
    const hashOto = await generateHash({plainText : otp })
    const hashPassword = await generateHash({plainText : password })

    
    await  sendEmail({to:email ,subject:"Confirm-Email" ,html:await emailTemplate(otp), res ,next})
    const [signupUser] = await create({model:UserModels ,data:[{fullName  ,email ,password:hashPassword ,phone:encPhone ,confirmEmailOtp :hashOto ,otpExpired:dateExpired,otpAttempts:{bannedUntil:null,count: 0}}]})


   return successResponse({res,status:201,data:process.env.MOOD==="DEV"? {signupUser}:undefined})
    

  
})

export const  login =asyncHandler( async (req ,res ,next) => {
    const {email ,password } =req.body
  const   user = await findOne({ model:UserModels , filter:{email,provider: providerEnum.system}})
    if (!user) {
        return next(new Error("In-valid login data or provider or email not confirmed",{cause: 404}))
    }
    if (!user.confirmEmail) {
        return next(new Error("please verify your access first ",{cause: 400}))
    }
    if (user.deletedAt) {
        return next(new Error("this account is deleted",{cause: 400}))
    }
    if (!await compareHash({plainText:password,hashValue:user.password})) {
    return next(new Error("In-valid login data",{cause:404}))
    
    }
       const data=  await generateLoginToken (user)
    return successResponse({res ,status:200 ,data}) 
}
)
export const  confirmEmail =asyncHandler( async (req ,res ,next) => {
    const {email ,otp } =req.body
  const   user = await findOne({ model:UserModels , filter:{email,provider: providerEnum.system,confirmEmail:{$exists:false},confirmEmailOtp:{$exists:true},}})
    if (!user) {
        return next(new Error("In-valid account",{cause: 404}))
    }
      if (user.otpExpired< new Date()) {
    return next( new Error(`OTP Expired `))
  }
      if (user.otpAttempts.bannedUntil > new Date()) {
    return next( new Error(`You are temporarily banned until ${user.otpAttempts.bannedUntil.toLocaleTimeString()}`))
  }

    if (!await compareHash({plainText:otp,hashValue:user.confirmEmailOtp})) {
    return next(new Error("In-valid OTP",{cause:400}))

    }

await updateOne({model:UserModels,filter:{email},data:{$set:{confirmEmail:Date.now()},$unset :{confirmEmailOtp:1,otpExpired: 1,otpAttempts:1}}})

    return successResponse({res }) 
}
)
export const  newConfirmEmail =asyncHandler( async (req ,res ,next) => {
    const {email } =req.body


await newConfirmOtp({email ,next,res})
}
)

// google provider authentication
export const  signupByGmail  = asyncHandler(
  async (req ,res ,next) => {
    const {idToken} =req.body 
    const {email, email_verified ,name,picture} = await verify(idToken)

    if (!email_verified ) {
      return next(new Error("Email not verified"))
    }
    const   user = await  findOne({ model:UserModels , filter:{email}})
    if (user) {
        return next(new Error("Email exist",{cause:409}))
    }



    const [signupUser] = await create({model:UserModels ,data:[{fullName:name  ,email ,provider:providerEnum.google ,picture,confirmEmail:Date.now()}]})

   return successResponse({res,status:201,data:process.env.MOOD==="DEV"? {signupUser}:undefined})
    

  
})
export const  loginByGmail =asyncHandler( async (req ,res ,next) => {
   const {idToken} =req.body 
    const {email, email_verified} = await verify(idToken)

    if (!email_verified ) {
      return next(new Error("Email not verified"))
    }

      const   user = await  findOne({ model:UserModels , filter:{email,provider: providerEnum.google}})
    if (user) {
        return next(new Error("In-valid login data or provider"))
    }
  const data=  await generateLoginToken (user)
    return successResponse({res ,status:200 ,data}) 
}
)

// 


export const  forgotPassword =asyncHandler( async (req ,res ,next) => {
    const {email ,password ,otp } =req.body

  const   user = await findOne({ model:UserModels , filter:{email,provider: providerEnum.system,confirmEmail:{$exists:true},deletedAt:{$exists:false}}})
    if (!user) {
        return next(new Error("In-valid account",{cause: 404}))
    }
     if (user.confirmEmailOtp) {
        return next(new Error("In-valid login data or provider or email not confirmed",{cause: 404}))
    }
      if (user.otpExpired< new Date()) {
    return next( new Error(`OTP Expired `))
  }
      if (user.otpAttempts.bannedUntil > new Date()) {
    return next( new Error(`You are temporarily banned until ${user.otpAttempts.bannedUntil.toLocaleTimeString()}`))
  }

    if (!await compareHash({plainText:otp,hashValue:user.confirmPasswordOtp})) {
    return next(new Error("In-valid OTP",{cause:400}))

    }
    if (user.oldPassword?.length) {
        for (const historyPassword of user.oldPassword) {
        
    if (await compareHash({plainText:password, hashValue:historyPassword})) {
    return next( new Error("this password is used before In-valid old "))
    
    }
    }
    }
        const hashPassword = await generateHash({plainText :password })

await updateOne({model:UserModels,filter:{email},data:{$set:{updatePassword:Date.now(),changeCredentialsTime:new Date(),password:hashPassword},$unset :{confirmPasswordOtp:1,otpExpired: 1,otpAttempts:1},$inc:{__v:1},$push : {oldPassword:user.password}}})
    return successResponse({res }) 
}
)

export const  verifyForgotPassword =asyncHandler( async (req ,res ,next) => {
    const {email ,otp} =req.body

  const   user = await findOne({ model:UserModels , filter:{email,provider: providerEnum.system,confirmEmail:{$exists:true} ,deletedAt:{$exists:false},confirmPasswordOtp:{$exists:true}}})
    if (!user) {
        return next(new Error("In-valid account",{cause: 404}))
    }
     if (user.confirmEmailOtp) {
        return next(new Error("In-valid login data or provider or email not confirmed",{cause: 404}))
    }
      if (user.otpExpired< new Date()) {
    return next( new Error(`OTP Expired `))
  }
      if (user.otpAttempts.bannedUntil > new Date()) {
    return next( new Error(`You are temporarily banned until ${user.otpAttempts.bannedUntil.toLocaleTimeString()}`))
  }

    if (!await compareHash({plainText:otp,hashValue:user.confirmPasswordOtp})) {
    return next(new Error("In-valid OTP",{cause:400}))

    }


    return successResponse({res }) 
}
)





export const  newConfirmPassword  =asyncHandler( async (req ,res ,next) => {
    const {email } =req.body


await newOtpPassword({email ,subject:"Confirm Password",next,res})
}
)










// export const emailSend = asyncHandler(async (req, res, next) => {
// await  sendEmail({to:req.body.emailTo ,subject:req.body.subject ,text:req.body.text,next,res })



  
// })





