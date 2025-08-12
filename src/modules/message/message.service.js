

import UserModels from "../../DB/models/User.model.js"
import { asyncHandler, successResponse } from "../../utils/response.js"
import { create, deleteOne, find, findById, findOne, updateOne } from "../../DB/db.service.js"

import { deleteFolderByPrefix, uploadFiles } from "../../utils/multer/cloudnairy.js"
import MessageModels from "../../DB/models/Message.model.js"






export const sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId } = req.params;
  const { content } = req.body;


  if (!content && (!req.files || req.files.length === 0)) {
    return next(new Error("Message content or attachments are required"));
  }


  const recipient = await findOne({
    model: UserModels,
    filter: {
      _id: receiverId,
      deletedAt: { $exists: false },
      confirmEmail: { $exists: true }
    }
  });
  if (!recipient) {
    return next(new Error("Invalid recipient account", { cause: 404 }));
  }


  let [message] = await create({
    model: MessageModels,
    data: [{ content, receiverId,attachments:[], senderId: req.user?._id }]
  });



  
  if (req.files && req.files.length > 0) {
    const attachments = await uploadFiles({
      files: req.files,
      path: `message/${receiverId}${message._id}`
    });

 
    await updateOne({
      model: MessageModels,
      filter: { _id: message._id },
      data: { $set:  {attachments } }
    });

    message.attachments = attachments;
  }

  return successResponse({
    res,
    data:process.env.MOOD==="DEV"? {message}:undefined,
    status: 201
  });
});


export const  getMessage  =asyncHandler( async (req ,res ,next) => {


  
    const {messageId } =req.params
const message = await findById({model : MessageModels ,id:messageId})
if (!message ) {
  return next(new Error ("not  message exist" ,{cause:404}) )
}


return successResponse({res ,data:{message}})
}
)


export const  getAllMessage  =asyncHandler( async (req ,res ,next) => {


  

const messages  = await find({model : MessageModels ,filter:{receiverId:req.user._id},
    options: {
      sort: { createdAt: -1 }, 
    }})
if (!messages?.length ) {
  return next(new Error ("No messages found" ,{cause:404}) )
}


return successResponse({res ,data:{messages }})
}
)






export const  freezeMessage =asyncHandler( async (req ,res ,next) => {

  const {messageId } =req.params
const message = await findById({model : MessageModels ,id:messageId})
if (!message ) {
  return next(new Error ("not  message exist" ,{cause:404}) )
}


if ( req.user._id.toString() !== message.receiverId.toString()) {
    return next(new Error("can't freezed message , it isn't receiver  ",{cause:403}))

}
const updateMessage = await updateOne ({model:MessageModels ,data:{$set:{deletedAt:Date.now(),changeCredentialsTime:new Date(),freezeBy:req.user._id},$inc:{__v:1}},filter : { _id :messageId,receiverId:req.user._id , deletedAt:{$exists  : false}}})

        return  updateMessage.matchedCount? successResponse({res ,data:{updateMessage}}):next(new Error("message not found or already frozen ",{cause:404}))

}
)




export const hardDeleteMessage = asyncHandler(async (req, res, next) => {
  const {messageId } =req.params
const message = await findById({model : MessageModels ,id:messageId})
  if (!message) {
    return next(new Error("Message does not exist", { cause: 404 }));
  }


  if (req.user._id.toString() !== message.receiverId.toString()) {
    return next(new Error("Can't delete message, you are not the receiver", { cause: 403 }));
  }

  const deletedMessage = await deleteOne({
    model: MessageModels,
    filter: {_id :messageId,receiverId:req.user._id, deletedAt: { $exists: true } }
  });

  if (!deletedMessage.deletedCount) {
    return next(new Error("Message not found or not frozen", { cause: 404 }));
  }


  await deleteFolderByPrefix({ prefix:  `message/${req.user._id}${messageId}`});

 return successResponse({
    res,
    data: {
      message: "Message permanently deleted",
      deletedCount: deletedMessage.deletedCount
    }
  });
});
