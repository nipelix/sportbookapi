const Auth = require("../Middleware/Auth");
const {body, validationResult} = require("express-validator");
const {Favorite} = require("../Orm/Model");
const router = require("./Auth");
router.use(Auth)


router.post('/', body('isFavorite').isBoolean().withMessage('api.favorite_type_required'),body('id').notEmpty().withMessage('api.champs_required'), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ msg: errors.array()[0].msg  });
    }
    try{
        const { isFavorite, id } = req.body;
        if(isFavorite){
            await Favorite.forge({  Champ: id,  User: req.user.get('ID') }).save({})
            return res.status(200).json({});
        }else if(!isFavorite){
            await Favorite.where({ Champ: id, User: req.user.get('ID') }).destroy();
            return res.status(200).json({});
        }
        return res.status(401).send({  msg: 'api.global_error' });
    }catch (e) {
        return res.status(401).send({  msg: 'api.global_error' });
    }
})

module.exports = router;