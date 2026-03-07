import axiosInstance from './axiosConfig';

/**
 * UPLOAD IMAGE API - /api/upload 📤
 * Public/Protected API - Tùy config backend
 */

/**
 * POST /api/upload
 * Upload hình ảnh
 * 
 * @param {File} file - File object từ input
 * @param {Object} options - Upload options
 * @param {Function} options.onProgress - Progress callback (optional)
 * 
 * @returns {Object} Response với imageUrl
 */
export const uploadImage = async (file, options = {}) => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Upload with progress tracking
    const response = await axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options.onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          options.onProgress(percentCompleted);
        }
      },
    });

    return {
      success: true,
      imageUrl: response.data.imageUrl || response.data.url,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to upload image',
    };
  }
};

/**
 * Upload multiple images
 * 
 * @param {FileList|Array} files - Files to upload
 * @param {Object} options - Upload options
 */
export const uploadMultipleImages = async (files, options = {}) => {
  try {
    const uploadPromises = Array.from(files).map((file) =>
      uploadImage(file, options)
    );

    const results = await Promise.all(uploadPromises);

    const successfulUploads = results.filter((r) => r.success);
    const failedUploads = results.filter((r) => !r.success);

    return {
      success: failedUploads.length === 0,
      imageUrls: successfulUploads.map((r) => r.imageUrl),
      errors: failedUploads.map((r) => r.error),
      uploadedCount: successfulUploads.length,
      failedCount: failedUploads.length,
    };
  } catch {
    return {
      success: false,
      error: 'Failed to upload multiple images',
    };
  }
};

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
  if (!file) {
    return {
      isValid: false,
      error: 'No file selected',
    };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPG, PNG, GIF, and WebP images are allowed',
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Compress image before upload (client-side)
 * 
 * @param {File} file - Image file
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Max width (default: 1920)
 * @param {number} options.maxHeight - Max height (default: 1080)
 * @param {number} options.quality - Quality 0-1 (default: 0.8)
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const maxWidth = options.maxWidth || 1920;
    const maxHeight = options.maxHeight || 1080;
    const quality = options.quality || 0.8;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

/**
 * Preview image before upload
 */
export const getImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};
