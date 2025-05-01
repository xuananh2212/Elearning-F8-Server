const { object, string, number } = require("yup");
const CategoryTransformer = require("../../transformers/category.transformer");
const {
  convertToTreeData,
  buildTree,
} = require("../../helpers/convertToTreeData");
const { Category, Course } = require("../../models/index");
const {
  findAllChildCategories,
} = require("../../helpers/findAllChildCategories");
const categoryServices = require("../../services/category.services");

module.exports = {
  getAll: async (req, res) => {
    const response = {};
    try {
      const categorys = await categoryServices.findAllCategory();
      const categoryTransformer = new CategoryTransformer(categorys);
      Object.assign(response, {
        status: 200,
        message: "success",
        categories: categoryTransformer,
      });
    } catch (e) {
      Object.assign(response, {
        status: 400,
        message: e.message,
      });
    }

    return res.status(response.status).json(response);
  },
  handleCategoryWithCourses: async (req, res) => {
    try {
      const categories = await Category.findAll({
        attributes: ["id", "name"],
        include: [
          {
            model: Course,
          },
        ],
      });

      res.status(200).json({
        status: "success",
        data: categories,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  },
  handleParentCategories: async (req, res) => {
    const response = {};
    try {
      const categories = await categoryServices.findAllCategory("children");
      const buildTreeCategories = buildTree(categories);
      const treeData = convertToTreeData(buildTreeCategories);
      Object.assign(response, {
        status: 200,
        message: "success",
        categories: treeData,
      });
    } catch (e) {
      Object.assign(response, {
        status: 400,
        message: e.message,
      });
    }

    return res.status(response.status).json(response);
  },
  addCategory: async (req, res) => {
    const response = {};
    try {
      let categorySchema = object({
        name: string()
          .required("vui lòng nhập danh mục")
          .test("unique", "tên danh mục này đã tồn tại", async (name) => {
            const category = await categoryServices.findOneByNameCategory(name);
            return !category;
          }),
      });
      const body = await categorySchema.validate(req.body, {
        abortEarly: false,
      });
      if (body.parentId) {
        const parentCategory = await categoryServices.findByPkCategory(
          body.parentId
        );
        if (!parentCategory) {
          throw new Error("parent id không tồn tại!");
        }
      }
      const category = await categoryServices.createCategory(body);
      const categoryTransformer = new CategoryTransformer(category);
      Object.assign(response, {
        status: 201,
        message: "success",
        category: categoryTransformer,
      });
    } catch (e) {
      Object.assign(response, {
        status: 400,
        message: "add failed",
        errors: {
          name: e?.message,
        },
      });
    }
    return res.status(response.status).json(response);
  },
  editCategory: async (req, res) => {
    const response = {};
    const { id } = req.params;
    try {
      let category = await categoryServices.findByPkCategory(id);
      if (!category) {
        return res
          .status(404)
          .json({ status: 404, message: "category không tồn tại!" });
      }
      let categorySchema = object({
        name: string()
          .required("vui lòng nhập danh mục")
          .test("unique", "tên danh mục này đã tồn tại", async (name) => {
            const category =
              await categoryServices.findOneByNameAndDifferentCategory(
                id,
                name
              );
            return !category;
          }),
        parentId: string()
          .test(
            "parentCategory",
            "Không thể đặt parentId là danh mục con của chính nó",
            async (parentId) => {
              const parentCategories = await findAllChildCategories(id);
              return !(
                parentCategories.some(({ id }) => id === parentId) ||
                parentId === id
              );
            }
          )
          .nullable(),
        status: number().required("vui lòng chọn trạng thái!"),
      });
      const body = await categorySchema.validate(req.body, {
        abortEarly: false,
      });
      category = await categoryServices.updateCategory(id, body);
      const categoryTransformer = new CategoryTransformer(category);
      Object.assign(response, {
        status: 200,
        category: categoryTransformer,
        message: "update success",
      });
    } catch (e) {
      console.log(e);
      const errors = Object.fromEntries(
        e?.inner?.map((item) => [item.path, item.message])
      );
      Object.assign(response, {
        status: 400,
        message: "update failed",
        errors,
      });
    }
    return res.status(response.status).json(response);
  },
  deleteCategory: async (req, res) => {
    const response = {};
    const { id } = req.params;
    try {
      const categoryDelete = await categoryServices.findByPkCategory(
        id,
        "children"
      );
      if (!categoryDelete) {
        return res
          .status(404)
          .json({ status: 404, message: "category không tồn tại!" });
      }
      if (categoryDelete.children && categoryDelete.children.length > 0) {
        const childs = await Promise.all(
          categoryDelete.children.map(async (child) => {
            child.parent_id = categoryDelete.parent_id;
            return await child.save();
          })
        );
        const childsTransformer = new CategoryTransformer(childs);
        Object.assign(response, {
          childs: childsTransformer,
        });
      }
      await categoryDelete.destroy();
      Object.assign(response, {
        status: 200,
        id,
        message: "delete success",
      });
    } catch (e) {
      Object.assign(response, {
        status: 400,
        message: e?.message,
      });
    }
    return res.status(response.status).json(response);
  },
  handledeleteManyCategory: async (req, res) => {
    const { categoryIds } = req.body;
    const response = {};
    const categoryChildren = [];
    try {
      await Promise.all(
        categoryIds.map(async (categoryId) => {
          const categoryDelete = await categoryServices.findByPkCategory(
            categoryId,
            "children"
          );
          if (categoryDelete) {
            if (categoryDelete.children && categoryDelete.children.length) {
              const childs = await Promise.all(
                categoryDelete.children.map(async (child) => {
                  child.parent_id = categoryDelete.parent_id;
                  return await child.save();
                })
              );
              const childsTransformer = new CategoryTransformer(childs);
              categoryChildren.push(...childsTransformer);
            }
            await categoryDelete.destroy();
          }
        })
      );
      Object.assign(response, {
        status: 200,
        message: "delete success",
        categoryIds,
        childs: categoryChildren,
      });
    } catch (e) {
      console.log(e);
      Object.assign(response, {
        status: 400,
        message: "bad request",
      });
    }
    return res.status(response.status).json(response);
  },
};
