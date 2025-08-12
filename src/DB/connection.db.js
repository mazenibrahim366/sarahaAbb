import mongoose from "mongoose";




export default async function ConnectionDB(params) {
const uri = process.env.DB_URL
    try {
        await mongoose.connect(uri);
          console.log("Connected successfully to server");
    } catch (error) {
        console.log("Connected is felid",error);
        
    }
    
}