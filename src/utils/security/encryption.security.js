import CryptoJs from "crypto-js"
export const encryptEncryption = async ({message = '',secretKey=process.env.ENC_SECRET}={}) => {
  return  CryptoJs.AES.encrypt(message,secretKey).toString()
    
}

export const decryptEncryption = async ({cipherText = '',secretKey=process.env.ENC_SECRET}={}) => {
 
    return   CryptoJs.AES.decrypt(cipherText,secretKey).toString(CryptoJs.enc.Utf8)
    
}
