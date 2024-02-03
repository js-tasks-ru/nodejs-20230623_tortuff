module.exports = function mustBeAuthenticated(ctx, next) {
  return ctx.user ? next() : ctx.throw(401, 'Пользователь не залогинен');
};
