const { cloudinary } = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

class CloudinaryService {
  async uploadImage(file, folder = 'fam/rooms') {
    if (!file) {
      throw ApiError.badRequest('No file provided');
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  async uploadImages(files, folder = 'fam/rooms') {
    if (!files || files.length === 0) {
      throw ApiError.badRequest('No files provided');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId) {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  }

  async deleteImages(publicIds) {
    if (!publicIds || publicIds.length === 0) return;

    const deletePromises = publicIds.map((id) => this.deleteImage(id));
    await Promise.all(deletePromises);
  }
}

module.exports = new CloudinaryService();
