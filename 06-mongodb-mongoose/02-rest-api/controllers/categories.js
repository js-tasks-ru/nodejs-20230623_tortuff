const CategoryModel = require('../models/Category.js');
const categoryMapper = require('../mappers/category.js');

module.exports.categoryList = async function categoryList(ctx, next) {
  const dbCategories = await CategoryModel.find().populate('subcategories').exec();
  const categories = dbCategories.map(categoryMapper);

  ctx.body = { categories };
};
