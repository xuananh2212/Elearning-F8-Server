const express = require("express");
const router = express.Router();
const lessonQuizController = require("../../controllers/api/lessonQuiz.controller");
router.post("/", lessonQuizController.addLessonQuiz);
router.delete("/:id", lessonQuizController.deleteLessonQuiz);
router.post("/question/many", lessonQuizController.addQuestionsBatch);
router.post("/question/edit-many", lessonQuizController.updateQuestionsBatch);
module.exports = router;
