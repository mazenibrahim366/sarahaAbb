import { create, deleteOne, findById, findOne, findOneAndUpdate, updateOne } from "../../DB/db.service.js"
import TokenModels from "../../DB/models/Token.model.js"
import UserModels, { roleEnum } from "../../DB/models/User.model.js"
import { cloud,deleteFolderByPrefix,deleteResources,destroyFile,uploadFile, uploadFiles } from "../../utils/multer/cloudnairy.js"
import { asyncHandler, successResponse } from "../../utils/response.js"
import { decryptEncryption, encryptEncryption } from "../../utils/security/encryption.security.js"
import { compareHash, generateHash } from "../../utils/security/hash.security.js"
import { createRevokeToken, generateLoginToken, logoutEnum} from "../../utils/security/token.security.js"



export const  logout =asyncHandler( async (req ,res ,next) => {
const { flag } = req.body
let status = 200
switch (flag) {
    case logoutEnum.signoutFromAllDevice:
    
        await updateOne({model: UserModels , filter:{_id : req.decoded._id} ,data:{changeCredentialsTime:new Date()} })
        break;

    default:
        await createRevokeToken({req})        
        status=201
        break;
}
 

            // console.log(req.decoded);

        return successResponse({res,status})
}
)
export const  getUser =asyncHandler( async (req ,res ,next) => {
const user = await findById({model: UserModels ,id:req.user._id,populate:[{path :"messages"}] })
    req.user.phone=  decryptEncryption({cipherText:req.user.phone})
        return successResponse({res ,data: user})
}
)

export const  shareProfile =asyncHandler( async (req ,res ,next) => {
const {userId}= req.params
const user = await findOne({model:UserModels ,filter:{_id:userId},select:"-password -role"})

        return user?successResponse({res ,data:{user}}):next(new Error("In-valid user id ",{cause:404}))
}
)


export const  refreshToken =asyncHandler( async (req ,res ,next) => {

  const data= await generateLoginToken(req.user)
    // const access_token = await generateToken({payload:{_id:req.user._id}})
    // const refresh_token = await generateToken({payload:{_id:req.user._id},signature:process.env.REFRESH_SIGNATURE,option:{expiresIn:process.env.REFRESH_EXPIRES}})
    return successResponse({res ,status:200 ,data}) 
}
)

export const  updateBasicProfile =asyncHandler( async (req ,res ,next) => {
if (req.body.phone) {
    req.body.phone = await encryptEncryption({message:req.body.phone})
}
const user = await findOneAndUpdate ({model:UserModels ,data:{$set:req.body,$inc:{__v:1}},filter:{_id:req.user._id}})

        return user?successResponse({res ,data:process.env.MOOD==="DEV"? {user}:undefined}):next(new Error("not register account  ",{cause:404}))

}
)
export const  profileCoverImages =asyncHandler( async (req ,res ,next) => {

  const   attachments =await uploadFiles({files :req.files, path:`/user/${req.user._id}/cover`})
 const user  = await findOneAndUpdate({model:UserModels,filter:{_id:req.user._id},data:{pictureCover:attachments},option:{new:false}})
         if (user?.pictureCover.length) {
        await deleteResources({public_ids:user.pictureCover.map(ele=>ele.public_id)})
        
     }
return successResponse({res ,data:process.env.MOOD==="DEV"? {user}:undefined})

}
)
export const  profileImage =asyncHandler( async (req ,res ,next) => {

const {public_id,secure_url}= await uploadFile({file:req.file , path : `/user/${req.user._id}/`})


     const user  = await findOneAndUpdate({model:UserModels,filter:{_id:req.user._id},data:{picture:{public_id,secure_url}},option:{new:false}})
     if (user?.picture?.public_id) {
        await destroyFile({public_id:user.picture.public_id})
        
     }
        return successResponse({res ,data:process.env.MOOD==="DEV"? {user}:undefined})

}
)
export const  updatePassword =asyncHandler( async (req ,res ,next) => {
const { password ,oldPassword,flag} =req.body

if (!oldPassword&&!password) {
return next( new Error("old password or new password not exist"))

    // req.body.phone = await encryptEncryption({message:req.body.phone})
}

if (!await compareHash({plainText:oldPassword, hashValue:req.user.password})) {
return next( new Error("In-valid old password "))

}
let updatedData = {}
switch (flag) {
    case logoutEnum.signoutFromAllDevice:
    
updatedData.changeCredentialsTime=new Date()
        break;
    case logoutEnum.signout:
   await createRevokeToken({req})   

        break;

    default:

        break;
}
 
if (req.user?.oldPassword?.length) {
    for (const historyPassword of req.user?.oldPassword) {
    
if (await compareHash({plainText:password, hashValue:historyPassword})) {
return next( new Error("this password is used before In-valid old "))

}
}
}
const user = await findOneAndUpdate ({model:UserModels ,data:{$set:{password:await generateHash({plainText:password})},$inc:{__v:1},...updatedData,$push : {oldPassword:req.user.password}},filter:{_id:req.user._id}})

        return user?successResponse({res ,data:process.env.MOOD==="DEV"? {user}:undefined}):next(new Error("not register account  ",{cause:404}))

}
)
export const  freezeAccount =asyncHandler( async (req ,res ,next) => {



if (req.params.userId&& req.user.role !== roleEnum.Admin) {
    return next(new Error("regular user cannot freeze other users account ",{cause:403}))

}
const user = await updateOne ({model:UserModels ,data:{$set:{deletedAt:Date.now(),changeCredentialsTime:new Date(),freezeBy:req.user._id},$unset:{restoreBy:1},$inc:{__v:1}},filter : { _id :req.params.userId||req.user._id, deletedAt:{$exists  : false}}})

        return  user.matchedCount? successResponse({res ,data:process.env.MOOD==="DEV"? {user}:undefined}):next(new Error("not register account ",{cause:404}))

}
)
export const  restoreAccount =asyncHandler( async (req ,res ,next) => {



if (req.params.userId&& req.user.role !== roleEnum.Admin) {
    return next(new Error("regular user cannot restore other users account ",{cause:403}))

}
const user = await updateOne ({model:UserModels ,data:{$set:{ restoreBy:req.user._id},$unset:{deletedAt:1,freezeBy:1},$inc:{__v:1}},filter : { _id :req.params.userId||req.user._id, deletedAt:{$exists  : true}}})

        return user.matchedCount? successResponse({res ,data:process.env.MOOD==="DEV"? {user}:undefined}):next(new Error("not register account ",{cause:404}))

}
)



export const hardDeleteAccount = asyncHandler(async (req, res, next) => {
  const targetUserId = req.params.userId || req.user._id;

 
  if (req.params.userId && req.user.role !== roleEnum.Admin) {
    return next(new Error("Regular users cannot hard delete other users' accounts", { cause: 403 }));
  }

  const user = await deleteOne({
    model: UserModels,
    filter: { _id: targetUserId, deletedAt: { $exists: true } }
  });

  if (!user.deletedCount) {
    return next(new Error("User not found or account is not frozen", { cause: 404 }));
  }


  await deleteFolderByPrefix({ prefix: `user/${targetUserId}` });

  return successResponse({
    res,
    data: { message: "Account permanently deleted",user: process.env.MOOD==="DEV"? {user}:undefined }
  });
});


// export const  hardDeleteAccount =asyncHandler( async (req ,res ,next) => {



// if (req.params.userId&& req.user.role !== roleEnum.Admin) {
//     return next(new Error("regular user cannot hard delete other users account ",{cause:403}))

// }
// const user = await deleteOne ({model:UserModels ,filter : { _id :req.params.userId||req.user._id, deletedAt:{$exists  : true}}})
// if (user.deletedCount) {
//    await deleteFolderByPrefix({prefix:`user/${req.params.userId||req.user._id}`}) 
// }
//         return user.deletedCount? successResponse({res ,data:{user}}):next(new Error("not register account or not freezed account ",{cause:404}))

// }
// )
