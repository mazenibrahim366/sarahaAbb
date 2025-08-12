import { customAlphabet } from "nanoid"
import UserModels, { providerEnum } from "../../DB/models/User.model.js"
import { generateHash } from "../security/hash.security.js"
import { findOne, updateOne } from "../../DB/db.service.js"
import { sendEmail } from "./send.email.js"
import { emailTemplate } from "./email.template.js"
import { successResponse } from "../response.js"



export const newConfirmOtp = async ({email="" ,subject="Confirm-Email",next ,res}={} ) => {
  const   user = await findOne({ model:UserModels , filter:{email,provider: providerEnum.system,confirmEmail:{$exists:false},confirmEmailOtp:{$exists:true}, }})
    if (!user) {
        return next(new Error("In-valid account",{cause: 404}))
    }
          if (user.otpExpired> new Date()) {
    return    next(new Error(`wait is not expired , expireDate : ${user.otpExpired.toLocaleTimeString()}`,{cause: 401}))
  }
      if (user.otpAttempts.bannedUntil > new Date()) {
    return next( new Error(`You are temporarily banned until ${user.otpAttempts.bannedUntil.toLocaleTimeString()}`))
  }

    const otp = customAlphabet("0123456789",6)()
  
    const hashOto = await generateHash({plainText : otp })


await updateOne({model:UserModels,filter:{email},data:{confirmEmailOtp :hashOto ,otpExpired:new Date(Date.now()+2 * 60 * 1000),otpAttempts:{ count:user.otpAttempts.count+ 1 >= 5?0:user.otpAttempts.count+1,bannedUntil:user.otpAttempts.count+ 1 >= 5?new Date( new Date().getTime() + 5 * 60 * 1000):null}}})
 
  sendEmail({to:email ,subject:subject ,html:await emailTemplate(otp), res ,next})
  // console.log(otp);
  // console.log(hashOto);
    return successResponse({res}) 

}
export const newOtpPassword = async ({email="" ,subject="Confirm-Password",next ,res}={} ) => {
  const   user = await findOne({ model:UserModels , filter:{email,provider: providerEnum.system,confirmEmail:{$exists:true},deletedAt:{$exists:false} }})
    if (!user) {
        return next(new Error("In-valid account",{cause: 404}))
    }
    if (user.confirmEmailOtp) {
        return next(new Error("In-valid login data or provider or email not confirmed",{cause: 404}))
    }
          if (user.otpExpired> new Date()) {
    return    next(new Error(`wait is not expired , expireDate : ${user.otpExpired.toLocaleTimeString()}`,{cause: 401}))
  }
      if (user.otpAttempts.bannedUntil > new Date()) {
    return next( new Error(`You are temporarily banned until ${user.otpAttempts.bannedUntil.toLocaleTimeString()}`))
  }

    const otp = customAlphabet("0123456789",6)()
  
    const hashOto = await generateHash({plainText : otp })


await updateOne({model:UserModels,filter:{email},data:{confirmPasswordOtp :hashOto ,otpExpired:new Date(Date.now()+2 * 60 * 1000),otpAttempts:{ count:user.otpAttempts.count+ 1 >= 5?0:user.otpAttempts.count+1,bannedUntil:user.otpAttempts.count+ 1 >= 5?new Date( new Date().getTime() + 5 * 60 * 1000):null}}})
 
  sendEmail({to:email ,subject:subject ,html:await emailTemplate(otp), res ,next})
  // console.log(otp);
  // console.log(hashOto);
    return successResponse({res}) 

}





//   const   user = await findOne({ model:UserModels , filter:{email,provider: providerEnum.system,confirmEmail:{$exists:false},confirmEmailOtp:{$exists:true}, }})
//     if (!user) {
//         return next(new Error("In-valid account",{cause: 404}))
//     }
//           if (user.otpExpired> new Date()) {
//     return    next(new Error(`wait is not expired , expireDate : ${user.otpExpired.toLocaleTimeString()}`,{cause: 401}))
//   }
//       if (user.otpAttempts.bannedUntil > new Date()) {
//     return next( new Error(`You are temporarily banned until ${user.otpAttempts.bannedUntil.toLocaleTimeString()}`))
//   }

//     const otp = customAlphabet("0123456789",6)()
  
//     const hashOto = await generateHash({plainText : otp })


// await updateOne({model:UserModels,filter:{email},data:{confirmEmailOtp :hashOto ,otpExpired:new Date(Date.now()+2 * 60 * 1000),otpAttempts:{ count:user.otpAttempts.count+ 1 >= 5?0:user.otpAttempts.count+1,bannedUntil:user.otpAttempts.count+ 1 >= 5?new Date( new Date().getTime() + 5 * 60 * 1000):null}}})
 
//   sendEmail({to:email ,subject:"Confirm-Email" ,html:await emailTemplate(otp), res ,next})
//   console.log(otp);
//   console.log(hashOto);
//     return successResponse({res}) 


