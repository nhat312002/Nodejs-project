const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

module.exports = {
  avatarUpload,
  flagUpload,
};