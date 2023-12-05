const ProductModel = require('../models/Product.js');
const productMapper = require('../mappers/product.js');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const {subcategory} = ctx.query;

  if (!subcategory) {
    return next();
  }

  const dbProducts = await ProductModel.find({subcategory}).exec();
  const products = dbProducts.map(productMapper);

  ctx.body = {products};
};

module.exports.productList = async function productList(ctx, next) {
  const dbProducts = await ProductModel.find().exec();
  const products = dbProducts.map(productMapper);

  ctx.body = {products};
};

module.exports.productById = async function productById(ctx, next) {
  const {id} = ctx.params;

  if (!id) {
    return ctx.throw(404, 'Product ID is not provided');
  }

  let dbProduct;
  try {
    dbProduct = await ProductModel.findById(id).exec();
  } catch (e) {
    console.dir(e);
    if (e.name === 'CastError' && e.message.includes('Cast to ObjectId')) {
      return ctx.throw(400, 'Invalid ID provided');
    }
    throw e;
  }

  if (!dbProduct) {
    return ctx.throw(404, `Product with ID '${id}' not found`);
  }

  const product = productMapper(dbProduct);

  ctx.body = {product};
};

