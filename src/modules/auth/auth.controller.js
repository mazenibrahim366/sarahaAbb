import { Router } from "express";
import { confirmEmail,    login, loginByGmail, newConfirmEmail, newConfirmPassword, signup, signupByGmail, forgotPassword ,verifyForgotPassword } from "./auth.service.js";

import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./auth.validation.js";
const router =Router()


router.post("/signup",validation({validationSchema:validators.signup}),signup)
router.post("/signup/gmail",validation({validationSchema:validators.signupByGmail}),signupByGmail)
router.post("/login",validation({validationSchema:validators.login}),login)
router.post("/login/gmail",validation({validationSchema:validators.loginByGmail}),loginByGmail)
router.patch("/confirmEmail",validation({validationSchema:validators.confirmEmail}),confirmEmail)
router.patch("/newConfirmEmail",validation({validationSchema:validators.confirmEmailOtp}),newConfirmEmail)
router.patch("/forgotPassword",validation({validationSchema:validators.updatePassword}),forgotPassword )
router.patch("/verifyForgotPassword",validation({validationSchema:validators.verifyForgotPassword}),verifyForgotPassword )
router.patch("/newConfirmPasswordOtp",validation({validationSchema:validators.confirmPasswordOtp}),newConfirmPassword )

export default router