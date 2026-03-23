const crypto = require("crypto");

const CryptoJS = require("crypto-js");

const ALGO = "aes-256-gcm";

let secret = process.env.CRYPTO_SECRET;
const KEY = crypto.createHash("sha256").update(secret).digest(); // 32 bytes
const IV_LENGTH = 12;

// function encrypt(obj) {
//   const iv = crypto.randomBytes(IV_LENGTH);
//   const cipher = crypto.createCipheriv(ALGO, KEY, iv);
//   const json = JSON.stringify(obj);
//   const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
//   const tag = cipher.getAuthTag();

//   return Buffer.concat([iv, encrypted, tag]).toString("base64");
// }

function encrypt(obj) {
  try {
    const text = JSON.stringify(obj);

    const encrypted = CryptoJS.AES.encrypt(
      text,
      secret   // same key as frontend
    ).toString();

    return encrypted;
  } catch (err) {
    console.log(err);
  }
}

// function decrypt(base64) {

//     try{
//   const buffer = Buffer.from(base64, "base64");
//   const iv = buffer.slice(0, IV_LENGTH);
//   const tag = buffer.slice(buffer.length - 16);
//   const encrypted = buffer.slice(IV_LENGTH, buffer.length - 16);

//   const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
//   decipher.setAuthTag(tag);
//   const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
//   return JSON.parse(decrypted.toString("utf8"));
//     }

//     catch(err){
//         console.log(err)
//     }
// }



function decrypt(cipherText) {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secret);

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return JSON.parse(decrypted);
  } catch (err) {
    console.log(err);
  }
}


const body = {
	"data":"Hey Charu its a test string!"
}


const encrypted = encrypt(body?.data);

console.log("ENC",encrypted)

console.log("DSC",decrypt("U2FsdGVkX1+UBdOfI9vda66lUdTtklXF14tvKPvh7tyqMrPK8OP8djbvBO4i+aPydY61Oq+GPGTHd566s6vwKQ=="))



module.exports = {encrypt,decrypt}