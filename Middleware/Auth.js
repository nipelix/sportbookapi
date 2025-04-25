const jwt = require('jsonwebtoken');
const { User } = require('../Orm/Model');
const config = require("../config");

module.exports = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({ msg: 'api.invalid_session' });
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
      withRelated:['parent_dealer']
    });

    if (!user) {
      return res.status(403).json({ msg: 'api.user_not_found' });
    }

    if(user.get('Status') === '0' && user.get('UserRole') !== 'admin'){
      return res.status(403).json({ msg: 'api.user_inactive' });
    }


    req.user = user;
    req.user.set('is_admin', req.user.get('UserRole') === 'admin');
    req.user.set('is_main_dealer', req.user.get('UserRole') === 'main_dealer');
    req.user.set('is_sub_dealer', req.user.get('UserRole') === 'sub_dealer');
    req.user.set('is_user', req.user.get('UserRole') === 'user');

    if (!req.user.get('is_admin')) {
      req.user.set('dealer_id', 0);
      if (req.user.get('is_main_dealer')) {
        req.user.set('dealer_id', req.user.get('ID'));
      } else if (req.user.get('is_sub_dealer')) {
        req.user.set('dealer_id', req.user.get('Parent'));
      } else if (req.user.get('is_user')) {
        const x = req.user.related('parent_dealer');
        if (x) {
          if (x.get('UserRole') === 'main_dealer') {
            req.user.set('dealer_id', x.get('ID'));
          }
          if (x.get('UserRole') === 'sub_dealer') {
            req.user.set('dealer_id', x.get('Parent'));
          }
        }
      }
    }

  } catch (err) {
    console.log(err)
    return res.status(403).json({ msg: 'api.invalid_session'  });
  }
  return next();
};