import { Router } from "express";
import { freezeAccount, getUser,updatePassword,logout, hardDeleteAccount, refreshToken, restoreAccount, shareProfile,profileImage, updateBasicProfile,profileCoverImages} from "./user.service.js";


import { authentication, authorization } from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
import { endPoint } from "./authorization.user.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js";
import { fileValidation, localFileUpload } from "../../utils/multer/local.multer.js";
import { cloudFileUpload } from "../../utils/multer/cloud.multer.js";
const router =Router()


router.get("/",authentication({tokenType:tokenTypeEnum.access }),authorization(endPoint.profile),getUser)
router.get("/:userId/profile",validation({validationSchema:validators.shareProfile}),shareProfile)
router.post("/logout",authentication({tokenType:tokenTypeEnum.access}),validation({validationSchema:validators.logout}),logout)
router.post("/refreshToken",authentication({tokenType:tokenTypeEnum.refresh}),refreshToken)
router.patch("/",authentication({tokenType:tokenTypeEnum.access}),validation({validationSchema:validators.updateBasicProfile}),updateBasicProfile)
router.patch("/updatePassword",authentication({tokenType:tokenTypeEnum.access}),validation({validationSchema:validators.updatePassword}),updatePassword)
router.delete("{/:userId}/freeze",authentication({tokenType:tokenTypeEnum.access}),validation({validationSchema:validators.freezeAccount}),freezeAccount)
router.patch("{/:userId}/restore",authentication({tokenType:tokenTypeEnum.access}),validation({validationSchema:validators.restoreAccount}),restoreAccount)
router.patch("/profileImage",authentication({tokenType:tokenTypeEnum.access}),cloudFileUpload({validation:fileValidation.image}).single("image"),validation({validationSchema:validators.profileImage}),profileImage)
router.patch("/profileCoverImages",authentication({tokenType:tokenTypeEnum.access}),cloudFileUpload({validation:fileValidation.image}).array("images",5),validation({validationSchema:validators.profileCoverImages}),profileCoverImages)

router.delete("{/:userId}/hardDelete",authentication({tokenType:tokenTypeEnum.access}),validation({validationSchema:validators.freezeAccount}),hardDeleteAccount)


export default router