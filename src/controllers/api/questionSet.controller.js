const { object, string } = require("yup");
const { v4: uuidv4 } = require("uuid");
const { QuestionSet, Question, Category } = require("../../models/index");

module.exports = {
  getQuestionSetWithQuestions: async (req, res) => {
    const { id } = req.params;

    try {
      const questionSet = await QuestionSet.findOne({
        where: { id },
        include: [
          {
            model: Question,
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
        questions,
      } = req.body;

      // Check if category exists
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Generate UUID for QuestionSet
      const questionSetId = uuidv4();

      // Create question set
      const questionSet = await QuestionSet.create(
        {
          id: questionSetId, // gắn id tự sinh
          title,
          description,
          thumb,
          duration,
          total_questions: totalQuestions,
          category_id: categoryId,
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction: t }
      );

      // Create questions
      if (questions && questions.length > 0) {
        const questionData = questions.map((q) => ({
          id: q.id || uuidv4(), // nếu FE không gửi id, tự sinh id
          question: q.question,
          explain: q.explain,
          question_set_id: questionSetId, // gắn id bộ đề mới tạo
          created_at: new Date(),
          updated_at: new Date(),
        }));

        await Question.bulkCreate(questionData, { transaction: t });
      }

      await t.commit();

      res.status(201).json({
        message: "Question set and questions created successfully",
        data: { questionSet },
      });
    } catch (error) {
      await t.rollback();
      console.error("Error creating question set with questions:", error);
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
            attributes: ["id", "name"],
          },
          {
            model: Question,
            attributes: ["id", "question", "explain"],
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
