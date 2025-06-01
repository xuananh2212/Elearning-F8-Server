const { LessonQuiz, Lesson, Question, Answer } = require("../../models/index");
const { object, string } = require("yup");
const { v4: uuidv4 } = require("uuid");
module.exports = {
  addLessonQuiz: async (req, res) => {
    const response = {};
    try {
      const lessonQuizSchema = object({
        lessonId: string().required("vui lòng nhập id bài học!"),
      });
      const body = await lessonQuizSchema.validate(req.body, {
        abortEarly: false,
      });
      const { lessonId } = body;
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        throw new Error("id không tồn tại!");
      }
      const id = uuidv4();
      await lesson.createLessonQuiz({
        id,
      });
      Object.assign(response, {
        status: 201,
        message: "success",
        lessonQuiz: {
          id,
        },
      });
    } catch (e) {
      console.log(e);
      Object.assign(response, {
        status: 400,
        message: e.message,
      });
    }
    return res.status(response.status).json(response);
  },
  addQuestionsBatch: async (req, res) => {
    try {
      const { lessonQuizId, questions } = req.body;

      if (!lessonQuizId || !Array.isArray(questions)) {
        return res
          .status(400)
          .json({ message: "Thiếu lessonQuizId hoặc danh sách câu hỏi" });
      }

      const lessonQuiz = await LessonQuiz.findByPk(lessonQuizId);
      if (!lessonQuiz) {
        return res.status(404).json({ message: "Lesson quiz không tồn tại" });
      }

      const createdQuestions = [];

      for (const q of questions) {
        const questionId = uuidv4();
        const newQuestion = await Question.create({
          id: questionId,
          question: q.question,
          explain: q.explain || "",
          lesson_quiz_id: lessonQuizId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const answersToInsert = q.answers.map((a, index) => ({
          id: uuidv4(),
          name: a.name,
          result: a.result,
          sort: index,
          question_id: questionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await Answer.bulkCreate(answersToInsert);

        createdQuestions.push(newQuestion);
      }

      res.status(201).json({
        message: "Tạo câu hỏi thành công",
        data: createdQuestions,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },

  updateQuestionsBatch: async (req, res) => {
    try {
      const { lessonQuizId, questions } = req.body;

      if (!lessonQuizId || !Array.isArray(questions)) {
        return res.status(400).json({
          message: "Thiếu lessonQuizId hoặc danh sách câu hỏi không hợp lệ",
        });
      }

      const updatedQuestions = [];

      for (const [index, q] of questions.entries()) {
        if (q.id) {
          // === CẬP NHẬT CÂU HỎI CŨ ===
          const question = await Question.findByPk(q.id, {
            include: [
              {
                model: Answer,
                separate: true,
                order: [["sort", "ASC"]],
              },
            ],
          });

          if (!question) continue;

          await question.update({
            question: q.question,
            explain: q.explain || "",
            updated_at: new Date(),
          });

          if (Array.isArray(q.answers)) {
            const existingAnswers = [...question.Answers];

            for (let i = 0; i < q.answers.length; i++) {
              const a = q.answers[i];
              const existingAnswer = existingAnswers[i];

              if (existingAnswer) {
                await existingAnswer.update({
                  name: a.name,
                  result: a.result,
                  updated_at: new Date(),
                });
              }
            }
          }

          updatedQuestions.push(question);
        } else {
          // === THÊM MỚI CÂU HỎI ===
          const questionId = uuidv4();
          const newQuestion = await Question.create({
            id: questionId,
            question: q.question,
            explain: q.explain || "",
            lesson_quiz_id: lessonQuizId,
            created_at: new Date(),
            updated_at: new Date(),
          });

          const answersToInsert = q.answers.map((a) => ({
            id: uuidv4(),
            name: a.name,
            result: a.result,
            question_id: questionId,
            created_at: new Date(),
            updated_at: new Date(),
          }));

          await Answer.bulkCreate(answersToInsert);

          updatedQuestions.push(newQuestion);
        }
      }

      res.status(200).json({
        message: "Cập nhật/thêm mới câu hỏi thành công",
        data: updatedQuestions,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },

  deleteLessonQuiz: async (req, res) => {
    const response = {};
    const { id } = req.params;
    try {
      const lessonQuiz = await LessonQuiz.findByPk(id);
      if (!lessonQuiz) {
        throw new Error("id không tồn tại");
      }
      lessonQuiz.setQuestions([]);
      await LessonQuiz.destroy({
        where: {
          id,
        },
      });

      Object.assign(response, {
        status: 200,
        message: "success",
      });
    } catch (e) {
      Object.assign(response, {
        status: 400,
        message: e.message,
      });
    }
    return res.status(response.status).json(response);
  },
};
