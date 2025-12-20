const responseUtils = require("../../../utils/responseUtils");
const fileService = require("../services/fileService");

const fileController = {
    // POST /api/media/upload
    uploadImage: (req, res) => {
        try {
            if (!req.file) {
                return responseUtils.error(res, "No file uploaded", 400);
            }

            // 1. Get the standard path string
            const fileUrl = fileService.processUploadedFile(req.file, 'posts');

            // 2. Return the format TinyMCE expects
            // TinyMCE needs: { "location": "url" }
            return responseUtils.ok(res, { location: fileUrl });

        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    }
};

module.exports = fileController;