


import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  content : {type: String, required:function () {
    return this.attachments?.length? false:true
    
  } ,minLength:2,maxLength:200000},
  attachments: [{public_id :String,secure_url:String}],
  receiverId: {type:mongoose.Schema.Types.ObjectId , ref:"User", required:true},
  senderId: {type:mongoose.Schema.Types.ObjectId , ref:"User"},
     changeCredentialsTime:{type: Date}, 
        deletedAt:{type: Date},
         freezeBy:{type:mongoose.Schema.Types.ObjectId , ref:"User"},
},{  
  timestamps:true,



});


const MessageModels=  mongoose.Model.Message||mongoose.model("Message", messageSchema)
//  mongoose.Model.Message  ||
MessageModels.syncIndexes()

export default MessageModels;