const fs = require('fs');
const path = require('path');

const fileService = {
    /**
     * Processes the file object from Multer and returns the public URL path.
     * @param {Object} file - The file object from req.file
     * @param {String} folder - 'posts', 'avatars', 'flags'
     * @returns {String} - The relative URL string (e.g. /uploads/posts/uuid.jpg)
     */
    processUploadedFile: (file, folder = 'posts') => {
        if (!file) return null;

        // Multer has already saved the file with a UUID name (from your middleware)
        // We just need to construct the standard URL path.
        // NOTE: We store RELATIVE paths in the DB so migration is easier.
        const relativePath = `/uploads/${folder}/${file.filename}`;
        
        return relativePath;
    },

    /**
     * Deletes a file from the filesystem.
     * Useful for updating avatars (delete old one) or cleaning up.
     * @param {String} relativePath - e.g. /uploads/posts/123.jpg
     */
    deleteFile: (relativePath) => {
        if (!relativePath) return;

        try {
            // Remove the leading slash to get system path
            // e.g. "uploads/posts/123.jpg"
            const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
            const fullPath = path.join(process.cwd(), cleanPath);

            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log(`🗑️ Deleted file: ${fullPath}`);
            }
        } catch (error) {
            console.error(`❌ Error deleting file: ${error.message}`);
            // We don't throw error here to avoid breaking the main request
        }
    }
};

module.exports = fileService;