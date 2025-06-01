const express = require("express");
const router = express.Router();
const questionSetController = require("../../controllers/api/questionSet.controller");

router.post("/", questionSetController.createQuestionSetWithQuestions);
router.post("/edit", questionSetController.updateQuestionSetWithQuestions);
router.get(
  "/question-sets-with-questions",
  questionSetController.getQuestionSetsWithQuestions
);
router.get("/:id", questionSetController.getQuestionSetWithQuestions);
router.get("/question-sets", questionSetController.getQuestionSets);
module.exports = router;
