import EventEmitter from "node:events"
import { sendEmail } from "../Email/send.email.js"
import { emailTemplate } from "../Email/email.template.js"
export const emailEvent = new EventEmitter()
 emailEvent.on("sendConfirmEmail",async (email,subject ,html, res ,next )=>{

await sendEmail({to:email ,subject,html, res ,next})


})