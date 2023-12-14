const ProductModel = require('../models/Product.js');
const productMapper = require('../mappers/product.js');

module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  const {query} = ctx.query;

  const dbProducts = await ProductModel.find(
    query ? {$text: {$search: query}} : {},
    {score: {$meta: 'textScore'}},
  ).sort({score: {$meta: 'textScore'}}).exec();

  const products = dbProducts.map(productMapper);

  ctx.body = {products};
};
