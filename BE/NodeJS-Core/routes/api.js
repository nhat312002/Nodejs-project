require("express-router-group");
const express = require("express");
const { middlewares, authenticated, role , avatarUpload, flagUpload} = require("kernels/middlewares");
const { validate } = require("kernels/validations");
const commentController = require("modules/comments/controllers/commentController");
const { getCommentsByPost, createComment, updateComment, deleteComment } = require("modules/comments/validations/commentValidation");
const exampleController = require("modules/examples/controllers/exampleController");
const postController = require("modules/posts/controllers/postController");
const { getPostById, getPosts, createPost, updatePost, disablePost, setPostStatus } = require("modules/posts/validations/postValidation")
const roleController = require("modules/roles/controllers/roleController");
const { createRole, getAllRoles, getRoleById, updateRole } = require("modules/roles/validations/roleValidation");
const userController = require("modules/users/controllers/userController");
const { createUser, getAllUsers, getUserById, updateUser, updateProfile, changePassword } = require("modules/users/validations/userValidation");
const categoryController = require("modules/categories/controllers/categoryController");
const { createCategory, getAllCategories, getCategoryById, updateCategory, toggleCategoryStatus} = require("modules/categories/validations/categoryValidation");
const languageController = require("modules/languages/controllers/languageController");
const { createLanguage, getAllLanguages, getLanguageById, updateLanguage, toggleLanguageStatus } = require("modules/languages/validations/languageValidation");
const authController = require("modules/auth/controllers/authController");
const { register, login, refresh } = require("modules/auth/validations/authValidation");
const router = express.Router({ mergeParams: true });

// ===== EXAMPLE Request, make this commented =====
// router.group("/posts",middlewares([authenticated, role("owner")]),(router) => {
//   router.post("/create",validate([createPostRequest]),postsController.create);
//   router.put("/update/:postId",validate([updatePostRequest]),postsController.update);
//   router.delete("/delete/:postId", postsController.destroy);
// }
// );

router.group("/example", validate([]), (router) => {
  router.get("/", exampleController.exampleRequest);
});

// Guest routes
router.group("/auth", null, (router) => {
  router.post("/register", validate([register]), authController.register);
  router.post("/login", validate([login]), authController.login);
  router.post("/refresh", validate([refresh]), authController.refresh);
});

router.get("/languages", validate([getAllLanguages]), languageController.getActiveLanguages);
router.get("/categories", validate([getAllCategories]), categoryController.getActiveCategories);

router.group("/posts", null, (router) => {
  router.get("/", validate([getPosts]), postController.getApprovedPosts);
  router.get("/:postId", validate([getPostById]), postController.getApprovedPostById);
});

router.group("/comments", null, (router) => {
  router.get("/", validate([getCommentsByPost]), commentController.getCommentsByApprovedPost);
});

router.group("/users", null, (router) => {
  router.get("/", validate([getAllUsers]), userController.getAllActiveUsers);
  router.get("/:userId", validate([getUserById]), userController.getActiveUserById);
});


// Authenticated user routes
router.group("/me", middlewares([authenticated, role([1, 2, 3])]), (router) => {

  router.group("/profile", null, (router) => {
    router.get("/", userController.getProfile);
    router.put("/", validate([updateProfile]), userController.updateProfile);
    router.post("/avatar", middlewares([avatarUpload]), userController.uploadOwnAvatar);
    router.post("/password", validate([changePassword]), userController.changePassword);
  });

  router.group("/posts", null, (router) => {
    router.get("/", validate([getPosts]), postController.getOwnPosts);
    router.get("/:postId", validate([getPostById]), postController.getOwnPostById);
    router.post("/", validate([createPost]), postController.createPost);
    router.put("/:postId", validate([updatePost]), postController.updatePost);
    router.put("/:postId/disable", validate([disablePost]), postController.disablePost);
  });

  router.group("/comments", null, (router) => {
    router.get("/", validate([getCommentsByPost]), commentController.getCommentsByOwnPost);
    router.post("/", validate([createComment]), commentController.createComment);
    router.put("/:commentId", validate([updateComment]), commentController.updateComment);
    router.delete("/:commentId", validate([deleteComment]), commentController.deleteComment);
  });
});



// Moderator routes
router.group("/manage", middlewares([authenticated, role([2, 3])]), (router) => {
  router.group("/posts", null, (router) => {
    router.get("/", validate([getPosts]), postController.getPosts);
    router.get("/:postId", validate([getPostById]), postController.getPostById);
    router.put("/:postId/status", validate([setPostStatus]), postController.setPostStatus);
  });

  router.group("/comments", null, (router) => {
    router.get("/", validate([getCommentsByPost]), commentController.getCommentsByPost);
  });
})

// Admin routes
router.group("/admin", middlewares([authenticated, role([3])]), (router) => {
  router.group("/roles", null, (router) => {
    router.get("/", validate([getAllRoles]), roleController.getAllRoles);
    router.get("/:roleId", validate([getRoleById]), roleController.getRoleById);
    router.post("/create", validate([createRole]), roleController.createRole);
    router.put("/:roleId", validate([updateRole]), roleController.updateRole);
  });

  router.group("/users", null, (router) => {
    router.get("/", validate([getAllUsers]), userController.getAllUsers);
    router.get("/:userId", validate([getUserById]), userController.getUserById);
    router.post("/create", validate([createUser]), userController.createUser);
    router.put("/:userId", validate([updateUser]), userController.updateUser);
    router.post("/:userId/avatar", middlewares([avatarUpload]), userController.uploadAvatar);
  });

  router.group("/categories", null, (router) => {
    router.get("/", validate([getAllCategories]), categoryController.getAllCategories);
    router.get("/:categoryId", validate([getCategoryById]), categoryController.getCategoryById);
    router.post("/", validate([createCategory]), categoryController.createCategory);
    router.put("/:categoryId", validate([updateCategory]), categoryController.updateCategory);
    router.patch("/:categoryId/toggle", validate([toggleCategoryStatus]), categoryController.toggleCategoryStatus);
  });

  router.group("/languages", null, (router) => {
    router.get("/", validate([getAllLanguages]), languageController.getAllLanguages);
    router.get("/:languageId", validate([getLanguageById]), languageController.getLanguageById);
    router.post("/", middlewares([flagUpload]), validate([createLanguage]), languageController.createLanguage);
    router.put("/:languageId", validate([updateLanguage]), languageController.updateLanguage);
    router.patch("/:languageId/toggle", validate([toggleLanguageStatus]), languageController.toggleLanguageStatus);
  });
});





module.exports = router;
