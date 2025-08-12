import { Router } from "express";

import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./message.validation.js";
import { cloudFileUpload, fileValidation } from "../../utils/multer/cloud.multer.js";
import { sendMessage,getMessage, freezeMessage, hardDeleteMessage ,getAllMessage} from "./message.service.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
const router =Router()


router.post("/:receiverId",cloudFileUpload({validation:fileValidation.image}).array("attachments",2),validation({validationSchema:validators.sendMessage}),sendMessage)

router.post("/:receiverId/sender",authentication({tokenType:tokenTypeEnum.access}),cloudFileUpload({validation:fileValidation.image}).array("attachments",2),validation({validationSchema:validators.sendMessage}),sendMessage)


router.get("/",authentication({tokenType:tokenTypeEnum.access}),getAllMessage)
router.get("/:messageId/message",validation({validationSchema:validators.messageId}),getMessage)
router.delete("/:messageId/freezeMessage",authentication({tokenType:tokenTypeEnum.access}),validation({validationSchema:validators.freezeMessage}),freezeMessage)

router.delete("/:messageId/hardDeleteMessage",authentication({tokenType:tokenTypeEnum.access}),validation({validationSchema:validators.freezeMessage}),hardDeleteMessage)

export default router