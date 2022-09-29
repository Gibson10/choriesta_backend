// Upload audio file into lc_storage/user_id/[audio_files]
require("dotenv").config()
import AWS from "aws-sdk";
const s3 = new AWS.S3({
    accessKeyId: process.env.CHORIESTA_AWS_ACCESS_ID,
    secretAccessKey: process.env.CHORIESTA_AWS_SECRET_KEY,
});
/**
 * S3
 * 232323232/profile.png
 * 242424242/profile.png
 */
export default class AwsUpload {
    static async upload( file, userId ) {
        const fileName = `${userId}/${new Date().getTime()}_${file.name}`;
        const params = {
            Bucket: process.env.BUCKET_NAME, // pass your bucket name
            Key: fileName, // file will be saved as testBucket/contacts.csv
            Body: file.data,
            ContentType: file.mimeType,
        };
        const res = await new Promise((resolve, reject) => {
            s3.upload(params, (s3Err, data) => s3Err == null ? resolve(data) : reject(s3Err));
        });
        return { fileUrl: res.Location }
    }
}

