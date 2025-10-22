require("express-router-group");
const express = require("express");
const middlewares = require("kernels/middlewares");
const { validate } = require("kernels/validations");
const commentController = require("modules/comments/controllers/commentController");
const { getCommentsByPost, createComment, updateComment, deleteComment } = require("modules/comments/validations/commentValidation");
const exampleController = require("modules/examples/controllers/exampleController");
const postController = require("modules/posts/controllers/postController");
const { getPostById, getPosts, createPost, updatePost, disablePost, setPostStatus } = require("modules/posts/validations/postValidation")
const roleController = require("modules/roles/controllers/roleController");
const userController = require("modules/users/controllers/userController");
const categoryController = require("modules/categories/controllers/categoryController");
const languageController = require("modules/languages/controllers/languageController");
const { set } = require("index");
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

router.group("/roles", null, (router) => {
  router.get("/", roleController.getAllRoles);
  router.get("/:roleId", roleController.getRoleById);
  router.post("/create", roleController.createRole);
  router.put("/:roleId", roleController.updateRole);
});

router.group("/users", null, (router) => {
  router.get("/", userController.getAllUsers);
  router.get("/:userId", userController.getUserById);
  router.post("/create", userController.createUser);
  router.put("/:userId", userController.updateUser);
});

router.group("/categories", null, (router) => {
  router.get("/", categoryController.getAllCategories);
  router.get("/:categoryId", categoryController.getCategoryById);
  router.post("/", categoryController.createCategory);
  router.put("/:categoryId", categoryController.updateCategory);
  router.patch("/:categoryId/toggle", categoryController.toggleCategoryStatus);
});

router.group("/languages", null, (router) => {
  router.get("/", languageController.getAllLanguages);
  router.get("/:languageId", languageController.getLanguageById);
  router.post("/", languageController.createLanguage);
  router.put("/:languageId", languageController.updateLanguage);
  router.patch("/:languageId/toggle", languageController.toggleLanguageStatus);
});

router.group("/posts", null, (router) => {
  router.get("/", validate([getPosts]), postController.getPosts);
  router.post("/", validate([createPost]), postController.createPost);
  router.get("/:postId", validate([getPostById]), postController.getPostById);
  router.put("/:postId", validate([updatePost]), postController.updatePost);
  router.put("/:postId/disable", validate([disablePost]), postController.disablePost);
  router.put("/:postId/status", validate([setPostStatus]), postController.setPostStatus);
});

router.group("/comments", null, (router) => {
  router.get("/", validate([getCommentsByPost]), commentController.getCommentsByPost);
  router.post("/", validate([createComment]), commentController.createComment);
  router.put("/:commentId", validate([updateComment]), commentController.updateComment);
  router.delete("/:commentId", validate([deleteComment]), commentController.deleteComment);
});

module.exports = router;
