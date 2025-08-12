import joi from "joi";

import { generalFields } from "../../middleware/validation.middleware.js";

export const signup ={
body:joi.object().keys({
fullName:generalFields.fullName.required(),
email:generalFields.email.required(),
password: generalFields.password.required(),
confirmPassword: generalFields.confirmPassword.required(),
phone: generalFields.phone.required()


}).required()



}
export const login={
body:joi.object().keys({

email:generalFields.email.required(),
password: generalFields.password.required()
}).required()

}
export const confirmPasswordOtp={
body:joi.object().keys({

email:generalFields.email.required(),
}).required()

}
export const confirmEmailOtp=confirmPasswordOtp
export const confirmEmail={
body:joi.object().keys({
email:generalFields.email.required(),
otp: generalFields.otp.required()
}).required()



}
export const updatePassword={
body:joi.object().keys({

email:generalFields.email.required(),
otp: generalFields.otp.required(),
password: generalFields.password.required(),
confirmPassword: generalFields.confirmPassword.required(),



}).required()



}

export const loginByGmail ={
body:joi.object().keys({
idToken :joi.string().required()
}).required()



}

export const signupByGmail =loginByGmail


export const verifyForgotPassword ={
body:joi.object().keys({
email:generalFields.email.required(),
otp: generalFields.otp.required(),
}).required()



}