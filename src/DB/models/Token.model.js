


import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  jti: {type: String, required:true ,unique :true},
  expiresIn: {type: Number, required:true }, 
  userId: {type: mongoose.Schema.Types.ObjectId,ref:"User", required:true }, 

},{
  timestamps:true,



});

const TokenModels=  mongoose.Model.Token  || mongoose.model("Token", tokenSchema)
//  mongoose.Model.User  ||
TokenModels.syncIndexes()

export default TokenModels;