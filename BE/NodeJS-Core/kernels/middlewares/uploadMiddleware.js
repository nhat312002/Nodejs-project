const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Import UUID
const responseUtils = require('utils/responseUtils');

// Helper to ensure directory exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

// --- GENERIC DISK STORAGE FACTORY ---
// This avoids copying the same storage logic 3 times
const createDiskStorage = (folderName) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), `uploads/${folderName}`);
      cb(null, ensureDir(dir));
    },
    filename: (req, file, cb) => {
      // Use UUID for posts to make them unguessable
      const ext = path.extname(file.originalname);
      const uniqueName = `${uuidv4()}${ext}`;
      cb(null, uniqueName);
    },
  });
};

const commonFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'));
  }
};

// --- CONFIGURATIONS ---

// 1. Post Images (For TinyMCE and Thumbnails)
// We save them in the same folder for simplicity, or you can split them.
const postStorage = createDiskStorage('posts');
const postUploadRaw = multer({
  storage: postStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: commonFileFilter
});

// 2. Flags (Keep your existing logic or switch to the factory)
const flagStorage = createDiskStorage('flags');
const flagUploadRaw = multer({
  storage: flagStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: commonFileFilter
});

// 3. Avatar (Keep Memory Storage if you process it later, or switch to Disk)
const avatarUploadRaw = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: commonFileFilter
});

// --- WRAPPER (Error Handling) ---
const uploadWrapper = (multerInstance, fieldName) => {
  return (req, res, next) => {
    const upload = multerInstance.single(fieldName);
    upload(req, res, (err) => {
      if (err) {
        let message = err.message || 'File upload failed.';
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') message = 'File too large (Max 5MB).';
          if (err.code === 'LIMIT_UNEXPECTED_FILE') message = `Unexpected field: ${err.field}`;
        }
        return responseUtils.error(res, message);
      }
      console.log(`Upload ${fieldName} has no error`);
      next();
    });
  };
};

module.exports = {
  // Use 'file' for TinyMCE generic uploads
  postImageUpload: uploadWrapper(postUploadRaw, 'file'), 
  
  // Use 'thumbnail' for the Cover Image in Create Post
  thumbnailUpload: uploadWrapper(postUploadRaw, 'thumbnail'),
  
  flagUpload: uploadWrapper(flagUploadRaw, 'url_flag'),
  avatarUpload: uploadWrapper(avatarUploadRaw, 'avatar'),
};