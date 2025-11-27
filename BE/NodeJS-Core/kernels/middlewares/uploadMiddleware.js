const multer = require('multer');
const path = require('path');
const fs = require('fs');
const responseUtils = require('utils/responseUtils');

const avatarStorage = multer.memoryStorage();

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type for avatar'));
    }
  },
}).single('avatar');


const flagsUploadDir = path.join(process.cwd(), 'uploads/flags');
if (!fs.existsSync(flagsUploadDir)) {
  fs.mkdirSync(flagsUploadDir, { recursive: true });
}

const flagStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, flagsUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const flagUpload = multer({
  storage: flagStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type for flag'));
    }
  },
}).single('url_flag');

const uploadWrapper = (multerUpload) => {
  return (req, res, next) => {
    multerUpload(req, res, (err) => {
      // Nếu có lỗi từ Multer (file size, file type, field name mismatch, etc.)
      if (err) {
        let message = err.message || 'File upload failed.';

        // Xử lý các lỗi cụ thể của Multer
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size is too large. Maximum 5MB allowed.';
          } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = `Unexpected field: ${err.field}`;
          }
          // Các lỗi khác của Multer (ví dụ: LIMIT_FIELD_COUNT) sẽ dùng message mặc định
        }
        // Xử lý lỗi từ fileFilter (ví dụ: 'Invalid file type...')
        // message đã được gán là err.message ở trên

        // 2. GỬI PHẢN HỒI LỖI TRỰC TIẾP TỪ MIDDLEWARE
        return responseUtils.error(res, message);
      }

      // Không có lỗi, tiếp tục chuỗi middleware
      next();
    });
  };
};

module.exports = {
  avatarUpload: uploadWrapper(avatarUpload),
  flagUpload: uploadWrapper(flagUpload),
};