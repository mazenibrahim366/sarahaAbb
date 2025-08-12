import joi from "joi";

import { generalFields } from "../../middleware/validation.middleware.js";
import { logoutEnum } from "../../utils/security/token.security.js";
import { fileValidation } from "../../utils/multer/local.multer.js";

export const shareProfile ={
params:joi.object().keys({
userId:generalFields.id.required()
}).required()
}
export const logout ={
body:joi.object().keys({
flag:generalFields.flag
}).required()
}
export const updateBasicProfile ={
body:joi.object().keys({
firstName:generalFields.fullName,
lastName:generalFields.fullName,
phone:generalFields.phone,
gender:generalFields.gender
}).required()

}
export const updatePassword ={
body:joi.object().keys({
    flag:generalFields.flag,
oldPassword:generalFields.password.required(),
password:generalFields.password.not(joi.ref("oldPassword")).required(),
confirmPassword:generalFields.confirmPassword.required(),
}).required()

}
export const freezeAccount ={
params:joi.object().keys({
userId:generalFields.id,

}).required()

}
export const profileCoverImages ={
files:joi.array().min(1).items(joi.object().keys(generalFields.file).required()).required()

}
export const profileImage ={
file:joi.object().keys(generalFields.file).required()

}
export const restoreAccount =freezeAccount