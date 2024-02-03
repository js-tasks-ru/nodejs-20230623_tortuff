const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('../../models/User.js');

module.exports = new LocalStrategy(
  { usernameField: 'email', session: false },
  async function verify(email, password, done) {
    if (!email) return done(null, false, 'Email required');

    try {
      const user = await UserModel.findOne({ email }).exec();
      if (!user) return done(null, false, 'Нет такого пользователя');

      if (!(await user.checkPassword(password))) {
        return done(null, false, 'Неверный пароль');
      }

      done(null, user);
    } catch (e) {
      return done(e);
    }
  },
);
