const {v4:uuidv4} = require('uuid')
const {S3} = require('aws-sdk')

require('dotenv').config()


const s3Uploadv2 = async (file) =>{
    const s3 = new S3 ()
    const params = {
        Bucket:process.env.BUCKET_NAME,
        Key:`${uuidv4()}-${file.originalname}`,
        Body:file.buffer
    }
    return await s3.upload(params).promise()
}
module.exports = s3Uploadv2