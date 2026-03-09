import axiosInstance from '../axiosConfig';

/**
 * Upload an image file to Cloudinary via backend API
 * POST /api/Upload
 * 
 * @param {File} file - The image file to upload
 * @returns {Promise<{success: boolean, data?: {imageUrl: string, message: string}, error?: string}>}
 */
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/Upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to upload image',
    };
  }
};
