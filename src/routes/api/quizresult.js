// routes/quiz-result.js
const express = require("express");
const router = express.Router();
const { QuizResult, QuestionSet, Question, Answer } = require("../../models");
const { v4: uuidv4 } = require("uuid");

// POST /quiz-result/evaluate
router.post("/evaluate", async (req, res) => {
  const { userId, questionSetId, answers } = req.body;

  if (!userId || !questionSetId || !Array.isArray(answers)) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    // Get all questions in question set with correct answers
    const questions = await Question.findAll({
      where: { question_set_id: questionSetId },
      include: [
        {
          model: Answer,
          where: { result: true },
        },
      ],
    });

    const correctAnswerMap = {};
    questions.forEach((q) => {
      const correctAns = q.Answers?.[0];
      if (correctAns) correctAnswerMap[q.id] = correctAns.id;
    });

    let correct = 0;
    for (const ans of answers) {
      if (correctAnswerMap[ans.questionId] === ans.answerId) {
        correct++;
      }
    }

    const wrong = questions.length - correct;
    const score = Math.round((correct / questions.length) * 10);

    // Save result
    await QuizResult.create({
      id: uuidv4(),
      user_id: userId,
      question_set_id: questionSetId,
      score,
      correct_answers: correct,
      wrong_answers: wrong,
      total_questions: questions.length,
      answers: answers,
    });

    return res.json({
      correct,
      wrong,
      score,
      correctAnswerMap,
    });
  } catch (err) {
    console.error("Error evaluating quiz:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const results = await QuizResult.findAll({
      where: { user_id: userId },
      include: [
        {
          model: QuestionSet,
          attributes: ["id", "title"], // hoặc thêm trường khác nếu cần
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;
