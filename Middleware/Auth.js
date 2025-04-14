const jwt = require('jsonwebtoken');
const { User } = require('../Orm/Model');
const config = require("../config");

module.exports = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({
      result: false,
      message: 'api.invalid_session'
    });
  }

  try {
    const decoded = jwt.verify(
        token,
        config.jwt.privateKey
    );



    let user = await User.query(function (qb) {
      qb.where('ID', decoded.ID);
      qb.where('Username', decoded.Username);
    }).fetch({
      withRelated:['parentDealer']
    });

    if (!user) {
      return res.status(403).json({
        result: false,
        message: 'api.user_not_found'
      });
    }

    if(user.get('Status') === '0' && user.get('UserRole') !== 'admin'){
      return res.status(403).json({
        result: false,
        message: 'api.user_inactive'
      });
    }

    req.user = user;
  } catch (err) {
    return res.status(403).json({
      result: false,
      message: 'api.invalid_session'
    });
  }
  return next();
};