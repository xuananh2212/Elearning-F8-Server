const { object, string } = require("yup");
const { v4: uuidv4 } = require("uuid");
const {
  QuestionSet,
  Question,
  Category,
  Answer,
  User,
} = require("../../models/index");

module.exports = {
  getQuestionSetWithQuestions: async (req, res) => {
    const { id } = req.params;

    try {
      const questionSet = await QuestionSet.findOne({
        where: { id },
        include: [
          {
            model: Question,
            include: [
              {
                model: Answer,
                separate: true,
                order: ["sort", "ASC"],
              },
            ],
          },
          {
            model: User,
          },
        ],
      });

      if (!questionSet) {
        return res.status(404).json({ message: "Question set not found" });
      }

      res.status(200).json({
        message: "Question set fetched successfully",
        data: questionSet,
      });
    } catch (error) {
      console.error("Error fetching question set:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  createQuestionSetWithQuestions: async (req, res) => {
    const t = await QuestionSet.sequelize.transaction();

    try {
      const {
        title,
        description,
        thumb,
        duration,
        totalQuestions,
        categoryId,
        teacherId,
        questions,
      } = req.body;

      // Check if category exists
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const teacher = await User.findByPk(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const questionSetId = uuidv4();

      // Create QuestionSet
      const questionSet = await QuestionSet.create(
        {
          id: questionSetId,
          title,
          description,
          thumb,
          duration,
          total_questions: totalQuestions,
          category_id: categoryId,
          teacher_id: teacherId,
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction: t }
      );

      // Create Questions + Answers
      if (questions && questions.length > 0) {
        for (const q of questions) {
          const questionId = uuidv4();

          // Create Question
          await Question.create(
            {
              id: questionId,
              question: q.question,
              explain: q.explain,
              question_set_id: questionSetId,
              created_at: new Date(),
              updated_at: new Date(),
            },
            { transaction: t }
          );

          // Map correct answer (A-D) → index
          const correctIndex = ["A", "B", "C", "D"].indexOf(q.correctAnswer);

          // Create Answers
          const answerData = q.answers.map((ansText, idx) => ({
            id: uuidv4(),
            name: ansText,
            result: idx === correctIndex, // true if correct answer
            question_id: questionId,
            created_at: new Date(),
            updated_at: new Date(),
            sort: idx,
          }));

          await Answer.bulkCreate(answerData, { transaction: t });
        }
      }

      await t.commit();

      res.status(201).json({
        message: "Question set, questions, and answers created successfully",
        data: { questionSet },
      });
    } catch (error) {
      await t.rollback();
      console.error(
        "Error creating question set with questions and answers:",
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateQuestionSetWithQuestions: async (req, res) => {
    const t = await QuestionSet.sequelize.transaction();
    try {
      const {
        id, // id của question set cần sửa
        title,
        description,
        thumb,
        duration,
        totalQuestions,
        categoryId,
        teacherId,
        questions,
      } = req.body;

      const questionSet = await QuestionSet.findByPk(id);
      if (!questionSet) {
        return res.status(404).json({ message: "Question set not found" });
      }

      // Cập nhật thông tin bộ đề
      await questionSet.update(
        {
          title,
          description,
          thumb,
          duration,
          total_questions: totalQuestions,
          category_id: categoryId,
          teacher_id: teacherId,
          updated_at: new Date(),
        },
        { transaction: t }
      );

      for (const q of questions) {
        if (q.id) {
          // === Cập nhật câu hỏi cũ ===
          const question = await Question.findByPk(q.id, {
            include: [
              {
                model: Answer,
                separate: true,
                order: [["sort", "ASC"]], // optional
              },
            ],
          });

          if (!question) continue;

          await question.update(
            {
              question: q.question,
              explain: q.explain,
              updated_at: new Date(),
            },
            { transaction: t }
          );

          const existingAnswers = question.Answers || [];
          const correctIndex = ["A", "B", "C", "D"].indexOf(q.correctAnswer);

          for (let i = 0; i < 4; i++) {
            if (existingAnswers[i]) {
              await existingAnswers[i].update(
                {
                  name: q.answers[i],
                  result: i === correctIndex,
                  updated_at: new Date(),
                },
                { transaction: t }
              );
            }
          }
        } else {
          // === Thêm câu hỏi mới ===
          const newQuestionId = uuidv4();
          await Question.create(
            {
              id: newQuestionId,
              question: q.question,
              explain: q.explain,
              question_set_id: id,
              created_at: new Date(),
              updated_at: new Date(),
            },
            { transaction: t }
          );

          const correctIndex = ["A", "B", "C", "D"].indexOf(q.correctAnswer);
          const answerData = q.answers.map((ansText, idx) => ({
            id: uuidv4(),
            name: ansText,
            sort: idx,
            result: idx === correctIndex,
            question_id: newQuestionId,
            created_at: new Date(),
            updated_at: new Date(),
          }));

          await Answer.bulkCreate(answerData, { transaction: t });
        }
      }

      await t.commit();
      res.status(200).json({
        message: "Question set updated successfully",
        data: questionSet,
      });
    } catch (error) {
      await t.rollback();
      console.error("Error updating question set:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getQuestionSets: async (req, res) => {
    try {
      const questionSets = await QuestionSet.findAll({
        include: [
          {
            model: Category,
            attributes: ["id", "name"],
          },
          {
            model: User,
            attributes: ["id", "name"],
          },
        ],
        attributes: {
          exclude: ["created_at", "updated_at"],
        },
        order: [["created_at", "DESC"]],
      });

      res.status(200).json(questionSets);
    } catch (error) {
      console.error("Error fetching question sets:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getQuestionSetsWithQuestions: async (req, res) => {
    try {
      const questionSets = await QuestionSet.findAll({
        include: [
          {
            model: Category,
          },
          {
            model: Question,
            include: [
              {
                model: Answer,
                separate: true,
                order: [["sort", "ASC"]], // optional
              },
            ],
          },
          {
            model: User,
          },
        ],
        attributes: {
          exclude: ["created_at", "updated_at"],
        },
        order: [["created_at", "DESC"]],
      });

      res.status(200).json(questionSets);
    } catch (error) {
      console.error("Error fetching question sets with questions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
