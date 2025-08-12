
// error handler
export const globalErrorHandler = (error,req ,res ,next)=>{
  return res.status(error.cause||400).json({error_message : error.message,stack : process.env.MOOD==="DEV"? error.stack:undefined})
}
export const asyncHandler =  (fn) => {
 return  async (req ,res ,next) => {

  await fn(req ,res ,next).catch((error)=> {
next(error,error.cause=500)
})
}
  
}
// success handler
export const successResponse =  ({res , message= "Done" ,status= 200 ,data = {}}={}) => {
  return res.status(status).json({message ,data})
}
