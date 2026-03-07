/**
 * VALIDATION UTILITIES
 * Các hàm validate theo yêu cầu của API
 */

/**
 * Validate Username
 * - Không được trùng trong hệ thống (check ở server)
 * - Từ 3-50 ký tự
 * - Không chứa khoảng trắng
 */
export const validateUsername = (username) => {
  const errors = [];
  
  if (!username) {
    errors.push('Username is required');
  } else {
    if (username.length < 3 || username.length > 50) {
      errors.push('Username must be between 3-50 characters');
    }
    if (/\s/.test(username)) {
      errors.push('Username cannot contain spaces');
    }
  }
  
  return errors;
};

/**
 * Validate Email
 * - Format email hợp lệ
 * - Không được trùng trong hệ thống (check ở server)
 */
export const validateEmail = (email) => {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  return errors;
};

/**
 * Validate Password
 * - Ít nhất 1 chữ HOA
 * - Ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
 * - Không chứa khoảng trắng
 * - Độ dài từ 6-50 ký tự
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 6 || password.length > 50) {
      errors.push('Password must be between 6-50 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least 1 uppercase letter');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least 1 special character (!@#$%^&*...)');
    }
    if (/\s/.test(password)) {
      errors.push('Password cannot contain spaces');
    }
  }
  
  return errors;
};

/**
 * Validate Confirm Password
 * - Phải khớp với password
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  const errors = [];
  
  if (!confirmPassword) {
    errors.push('Please confirm your password');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return errors;
};

/**
 * Validate Full Name
 * - Tên đầy đủ người dùng
 */
export const validateFullName = (fullName) => {
  const errors = [];
  
  if (!fullName) {
    errors.push('Full name is required');
  } else if (fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }
  
  return errors;
};

/**
 * Validate toàn bộ form đăng ký
 */
export const validateRegistrationForm = (formData) => {
  const allErrors = {
    username: validateUsername(formData.username),
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
    confirmPassword: validateConfirmPassword(formData.password, formData.confirmNewPassword),
    fullName: validateFullName(formData.fullName),
  };
  
  // Check if có lỗi nào không
  const hasErrors = Object.values(allErrors).some(errors => errors.length > 0);
  
  return {
    isValid: !hasErrors,
    errors: allErrors,
  };
};

/**
 * Validate login form
 */
export const validateLoginForm = (usernameOrEmail, password) => {
  const errors = {};
  
  if (!usernameOrEmail) {
    errors.usernameOrEmail = ['Username or email is required'];
  }
  
  if (!password) {
    errors.password = ['Password is required'];
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate reset code/token
 * - Mã 6 số (100000-999999)
 */
export const validateResetToken = (token) => {
  const errors = [];
  
  if (!token) {
    errors.push('Reset code is required');
  } else {
    // Remove spaces and check if it's 6 digits
    const cleanToken = token.replace(/\s/g, '');
    if (!/^\d{6}$/.test(cleanToken)) {
      errors.push('Reset code must be 6 digits');
    }
  }
  
  return errors;
};

/**
 * Validate reset password form (2-step forgot password)
 */
export const validateResetPasswordForm = (formData) => {
  const allErrors = {
    email: validateEmail(formData.email),
    token: validateResetToken(formData.token),
    newPassword: validatePassword(formData.newPassword),
    confirmPassword: validateConfirmPassword(formData.newPassword, formData.confirmNewPassword),
  };
  
  const hasErrors = Object.values(allErrors).some(errors => errors.length > 0);
  
  return {
    isValid: !hasErrors,
    errors: allErrors,
  };
};

/**
 * Validate forgot password step 1 (email only)
 */
export const validateForgotPasswordEmail = (email) => {
  const errors = validateEmail(email);
  
  return {
    isValid: errors.length === 0,
    errors: { email: errors },
  };
};
