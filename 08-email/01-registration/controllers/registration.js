const {v4: uuid} = require('uuid');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {
  const {email, password, displayName} = ctx.request.body;

  if (!(email?.trim() && password?.trim() && displayName?.trim())) {
    return ctx.throw(400, 'All fields are required');
  }

  const token = uuid();

  try {
    const user = new User({
      verificationToken: token,
      email,
      password,
      displayName,
    });

    await user.setPassword(password);
    await user.save();

    await sendMail({
      template: 'confirmation',
      locals: {token},
      to: email,
      subject: 'Подтвердите почту',
    });

  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.body = {status: 'ok'};
};

module.exports.confirm = async (ctx, next) => {
  const {verificationToken} = ctx.request.body;
  if (!verificationToken) return ctx.throw(400, 'Invalid token provided');

  const user = await User.findOneAndUpdate(
    {verificationToken},
    {$unset: {verificationToken: 1}},
  );

  if (!user) {
    return ctx.throw(400, 'Ссылка подтверждения недействительна или устарела');
  }

  ctx.body = {token: verificationToken};
};
