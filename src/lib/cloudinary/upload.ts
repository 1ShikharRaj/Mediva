import cloudinary from './client';

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto'
): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sehatbridge/${folder}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}
