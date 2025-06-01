const {
  Course,
  Discount,
  TypeCourse,
  Category,
  Lesson,
  Topic,
  LessonVideo,
  LessonQuiz,
  LessonDocument,
  Question,
  Answer,
  User,
} = require("../models/index");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const getSlug = require("speakingurl");
module.exports = {
  findAllCourse: async () => {
    return await Course.findAll({
      include: [
        {
          model: TypeCourse,
        },
        {
          model: Category,
        },
        {
          model: Discount,
        },
        {
          model: User,
        },
      ],
    });
  },
  findByPkCourse: async (id) => {
    return await Course.findByPk(id, {
      include: [
        {
          model: TypeCourse,
        },
        {
          model: Category,
        },
        {
          model: Discount,
        },
      ],
    });
  },
  findOneByTitleAnDifferentId: async (id, title) => {
    return await Course.findOne({
      where: {
        id: {
          [Op.ne]: id,
        },
        title,
      },
    });
  },

  findOneByTitle: async (title) => {
    return await Course.findOne({
      where: {
        title,
      },
    });
  },
  findOneBySlug: async (slug) => {
    slug = getSlug(slug);
    return await Course.findOne({
      where: {
        slug,
      },
    });
  },
  findOneBySlugAndDifferentId: async (id, slug) => {
    slug = getSlug(slug);
    return await Course.findOne({
      where: {
        id: {
          [Op.ne]: id,
        },
        slug,
      },
    });
  },
  findOneBySlugCourseDetail: async (slug) => {
    return await Course.findOne({
      where: { slug },
      include: [
        {
          model: Topic,
          separate: true,
          order: [["sort", "ASC"]],
          include: [
            {
              model: Lesson,
              separate: true,
              order: [["sort", "ASC"]],
              include: [
                { model: LessonVideo },
                { model: LessonDocument },
                {
                  model: LessonQuiz,
                  include: [
                    {
                      model: Question,
                      include: [
                        {
                          model: Answer,
                          separate: true,
                          order: [["sort", "ASC"]], // hoặc theo 'sort' nếu có
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  },
  createCourse: async (data) => {
    let { title, desc, thumb, status, price, slug, discountedPrice } = data;
    slug = getSlug(slug);
    return await Course.create({
      id: uuidv4(),
      title,
      desc,
      thumb,
      status,
      price,
      discounted_price: discountedPrice,
      slug,
    });
  },
  updateCourse: async function (id, data) {
    let { title, desc, thumb, status, price, slug } = data;
    slug = getSlug(slug);
    await Course.update(
      {
        title,
        desc,
        thumb,
        status,
        price,
        slug,
      },
      {
        where: {
          id,
        },
      }
    );
    return await this.findByPkCourse(id);
  },
  deleteManyCourse: async (courseIds) => {
    await Course.destroy({
      where: {
        id: courseIds,
      },
    });
  },
};
