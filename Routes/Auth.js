const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { body, validationResult } = require('express-validator');
const {User} = require("../Orm/Model");


const generateTokens = (user) => {

    const accessToken = jwt.sign(
        {
            Username: user.get('Username'),
            UserRole: user.get('UserRole'),
            ID: user.get('ID'),
            tokenType: 'access'
        },
        config.jwt.privateKey,
        {...config.jwt.base}
    );
    const refreshToken = jwt.sign(
        {
            ID: user.get('ID'),
            tokenType: 'refresh'
        },
        config.jwt.privateKey,
        {...config.jwt.refresh}
    );

        const decoded = jwt.decode(accessToken);

    return {
        accessToken,
        refreshToken,
        expiresAt: decoded.exp * 1000
    };
}

const router = express.Router();


router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ msg: 'api.refresh_token_required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, config.jwt.privateKey);

        if (decoded.tokenType !== 'refresh') {
            return res.status(403).json({
                result: false,
                message: [{ msg: 'api.invalid_token_type' }]
            });
        }


        let user = await User.where('ID', decoded.ID).fetch({});

        const tokens = generateTokens(user);

        return res.status(200).json({
            result: true,
            data: {
                user:  {
                        authenticated: true,
                        Username: user.get('Username'),
                        UserRole: user.get('UserRole'),
                        ID: user.get('ID')
                },
                jwt: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: tokens.expiresAt
            }
        });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'api.refresh_token_expired' });
        }

        return res.status(403).json({ msg: 'api.invalid_refresh_token' });
    }
});



router.post('/create-user',body('Username').notEmpty().withMessage('api.username_required'),
    body('Password').notEmpty().withMessage('api.password_required').isLength({ min: 4 }).withMessage('api.min_4_password'),
	function(req,res){
		 const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                result: false,
                message: errors.array()
            });
        }

	 User.forge(req.body).save().then((e) => {
			return res.status(200).json(e);
	}).catch((e) => {
        return res.status(400).json({ msg:  e });
    })

})


router.post('/login',
    body('username').notEmpty().withMessage('api.username_required'),
    body('password').notEmpty().withMessage('api.password_required').isLength({ min: 4 }).withMessage('api.min_4_password'),
    async (req,res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ msg: errors.array()[0].msg });
        }

    
        const { username, password } = req.body;

        User.query(function (qb) {
            qb.where('Username', username);
        }).fetch({
            withRelated:['parent_dealer.parent_dealer']
        }).then((e) => {

            e.check_password(password).then(() => {

                if(e.get('Status') === '1' || e.get('UserRole') === 'admin') {

                    if(e.get('UserRole') === 'user') {
                        const parent_dealer = e.related('parent_dealer');
                        if(parent_dealer.get('Status') !== '1') {
                            return res.status(403).json({ msg: 'api.dealer_account_disabled' });
                        }


                        if(parent_dealer.get('UserRole') === 'sub_dealer') {
                            const mainDealer = parent_dealer.related('parent_dealer');
                            if(mainDealer.get('Status') !== '1') {
                                return res.status(403).json({ msg: 'api.dealer_account_disabled' });
                            }
                        }
                    } else if(e.get('UserRole') === 'sub_dealer') {

                        const mainDealer = e.related('parent_dealer');
                        if(mainDealer.get('Status') !== '1') {
                            return res.status(403).json({ msg: 'api.dealer_account_disabled' });
                        }
                    }
                    const tokens = generateTokens(e);

                    return res.status(200).json({
                        user: {
                            authenticated: true,
                            Username: e.get('Username'),
                            UserRole: e.get('UserRole'),
                            ID: e.get('ID')
                        },
                        jwt: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        expiresAt: tokens.expiresAt
                    });

                }else{
                    return res.status(400).json({
                        result: false,
                        message: [
                            {
                                msg: 'api.user_account_disabled'
                            }
                        ]
                    });
                }
            }).catch((e) => {
                return res.status(400).json({
                    msg: e
                });
            })

        }).catch((e) => {

            return res.status(400).json({
                msg: 'api.user_not_found'
            });
        })

});



module.exports = router;