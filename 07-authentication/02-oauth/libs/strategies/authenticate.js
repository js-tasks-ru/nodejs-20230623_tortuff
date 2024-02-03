const UserModel = require('../../models/User.js');

module.exports = async function authenticate(strategy, email, displayName, done) {
  if (!(email)) return done(null, false, 'Не указан email');

  try {
    const user = await UserModel.findOne({ email });
    if (user) return done(null, user);

    const createdUser = await UserModel.create({
      email,
      displayName,
    });
    done(null, createdUser);
  } catch (e) {
    console.log('Something went wrong during the user authentication via GitHub:\n', e);
    done(e, false, 'Error occurred during the GitHub authorization.');
  }
};
