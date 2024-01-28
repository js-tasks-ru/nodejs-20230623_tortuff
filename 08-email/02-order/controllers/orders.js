const Order = require('../models/Order');
const sendMail = require('../libs/sendMail');
const mapOrder = require('../mappers/order');

module.exports.checkout = async function checkout(ctx, next) {
  const { product, phone, address } = ctx.request.body;

  try {
    const order = await Order.create({
      user: ctx.user._id,
      product,
      phone,
      address,
    });

    const populatedOrder = await Order.findOne({ _id: order._id }).populate('user').populate('product');

    await sendMail({
      template: 'order-confirmation',
      locals: {
        id: order._id,
        product: populatedOrder.product,
      },
      to: populatedOrder.user.email,
      subject: 'Подтверждение заказа',
    });

    ctx.body = { order: order._id };
  } catch (e) {
    if (e.errors) {
      const errors = {};
      Object.keys(e.errors).forEach(key => (errors[key] = e.errors[key].toString()));

      ctx.body = { errors };
      ctx.status = 400;
      return;
    }

    return ctx.throw(400, e);
  }
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  const orders = await Order.find({ user: ctx.user._id });
  ctx.body = { orders: orders.map(mapOrder) };
};
