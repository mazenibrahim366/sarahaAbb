import jwt from "jsonwebtoken";
import { findById, findOne } from "../../DB/db.service.js";
import UserModels, { roleEnum } from "../../DB/models/User.model.js";
import { nanoid } from "nanoid";
import TokenModels from "../../DB/models/Token.model.js";

export const signatureTypeEnum = {system : "System" ,bearer: "Bearer"}
export const tokenTypeEnum = {access : "access" ,refresh: "refresh"}
export const logoutEnum = {signoutFromAllDevice : "signoutFromAllDevice" ,signout: "signout",stayLoggedIn: "stayLoggedIn"}

export const  generateToken = async ({payload ,signature=process.env.ACCESS_TOKEN_USER_SIGNATURE, option = {expiresIn:Number(process.env.ACCESS_EXPIRES)}}={} ) => {
return jwt.sign(payload,signature,option)
    
}
export const  verifyToken = async ({token ,signature=process.env.ACCESS_TOKEN_USER_SIGNATURE}={} ) => {
return  jwt.verify(token,signature)
    
} 


export const getSignature=async ({signatureLevel=signatureTypeEnum.bearer}={}) => {
const signature = { accessSignature: undefined ,refreshSignature: undefined}
switch (signatureLevel) {
  case signatureTypeEnum.system :
    signature.accessSignature= process.env.ACCESS_TOKEN_SYSTEM_SIGNATURE
    signature.refreshSignature= process.env.REFRESH_TOKEN_SYSTEM_SIGNATURE
    break;

  default:
    signature.accessSignature= process.env.ACCESS_TOKEN_USER_SIGNATURE
    signature.refreshSignature= process.env.REFRESH_TOKEN_USER_SIGNATURE
    break;
}


    return signature
}

export const decodedToken =async ({authorization="" ,next ,tokenType=tokenTypeEnum.access}={}) => {
    
    
        const [bearer , token] =authorization.split(" ") ||[]
    
    if (!token||!bearer ) {
    return next(new Error("missing token parts"))
    }
       if (!Object.values(signatureTypeEnum).includes(bearer)) {
      return next(new Error("Invalid bearer type"));
    }
    const signature =await getSignature({signatureLevel: bearer})
        const decoded = await verifyToken({token, signature :
             
            tokenType === tokenTypeEnum.access?signature.accessSignature:signature.refreshSignature })

        
        
            if (decoded.jti&&await findOne({model: TokenModels , filter:{jti:decoded.jti}})) {
            return next(new Error("In-valid login credentials ",{cause:401}))
            
        }
            if (!decoded?._id) {
            return next(new Error("In-valid token",{cause:400}))
            
        }
         const   user = await findById({ model:UserModels , id:decoded._id})
           if (!user) {
           return next(new Error("Not register account",{cause: 404}))
            }
           if (!user.freezeBy&&user.changeCredentialsTime?.getTime()> decoded.iat *1000) {
           return next(new Error("In-valid login credentials ",{cause: 401}))
            }



return {user , decoded}
    
    
}



export async function generateLoginToken (user) {

     const signature = await getSignature({
          signatureLevel:user.role != roleEnum.User? signatureTypeEnum.system:signatureTypeEnum.bearer

        })
        const jwtid = nanoid()
    const access_token = await generateToken({payload:{_id:user?._id},signature:signature.accessSignature,option:{expiresIn:Number(process.env.ACCESS_EXPIRES),jwtid}})
    const refresh_token = await generateToken({payload:{_id:user?._id},signature:signature.refreshSignature,option:{expiresIn:Number(process.env.REFRESH_EXPIRES),jwtid}})
  return {access_token ,refresh_token}
}

export async function createRevokeToken ({req}={}) {

        await create({model: TokenModels ,data:[{jti:req.decoded.jti,userId:req.decoded._id,expiresIn:req.decoded.iat + Number(process.env.REFRESH_EXPIRES),}]})
  return true
}
