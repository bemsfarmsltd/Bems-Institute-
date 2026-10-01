import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Uploads straight from a memory buffer — never touches local disk, which
// matters because Render's filesystem is ephemeral and wipes on every
// redeploy. One fixed public_id per user so a re-upload replaces the old
// photo in place instead of accumulating orphaned files in the account.
export function uploadAvatar(buffer: Buffer, userId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "bems/avatars",
        public_id: userId,
        overwrite: true,
        resource_type: "image",
        // "limit" fits within the box without cropping or upscaling, and
        // preserves animation on GIFs (unlike "fill", which would need a
        // still frame to crop against).
        transformation: [{ width: 512, height: 512, crop: "limit" }]
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Cloudinary upload failed."));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
