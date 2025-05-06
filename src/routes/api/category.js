const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/api/category.controller");
router.get("/", categoryController.getAll);
router.get(
  "/categories-with-courses",
  categoryController.handleCategoryWithCourses
);
router.get(
  "/categories-without-question-sets",
  categoryController.getCategoriesWithoutQuestionSets
);
router.get("/parent-categories", categoryController.handleParentCategories);
router.post("/", categoryController.addCategory);
router.post(
  "/delete/many-category",
  categoryController.handledeleteManyCategory
);
router.post("/:id", categoryController.editCategory);
router.delete("/:id", categoryController.deleteCategory);
module.exports = router;
