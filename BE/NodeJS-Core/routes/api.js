require("express-router-group");
const express = require("express");
const middlewares = require("kernels/middlewares");
const { validate } = require("kernels/validations");
const exampleController = require("modules/examples/controllers/exampleController");
const roleController = require("modules/roles/controllers/roleController");
const roleValidation = require("modules/roles/validations/roleValidation");
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
  router.post(
    "/create",
    validate([roleValidation.createRole]),
    roleController.createRole
  );
  router.put(
    "/update/:roleId",
    validate([roleValidation.updateRole]),
    roleController.updateRole
  );
});
module.exports = router;
