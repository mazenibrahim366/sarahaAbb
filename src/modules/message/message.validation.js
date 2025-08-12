import joi from "joi";

import { generalFields } from "../../middleware/validation.middleware.js";

export const sendMessage ={
params:joi.object().keys({
receiverId:generalFields.id.required(),




}
).required(),
body:joi.object().keys({
  content :joi.string().min(2).max(200000) ,



//   senderId: generalFields.id,
 

}
),
files:joi.array().items(joi.object().keys(generalFields.file)).min(0).max(2)



}
export const freezeMessage ={
params:joi.object().keys({
messageId:generalFields.id.required(),
}).required()
}
export const messageId ={
params:joi.object().keys({
messageId:generalFields.id.required(),




}
).required(),




}
