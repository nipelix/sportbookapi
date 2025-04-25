const Auth = require("../Middleware/Auth");
const {body, validationResult} = require("express-validator");

const router = require("./Auth");
const {Coupon, CouponEvent} = require("../Orm/Model");
router.use(Auth)

router.get('/list/:limit/:offset', async (req, res) => {

  try{
     let data = await Coupon.query(function (qb) {
        qb.where({
             user: req.user.get('ID'),
         }).limit(req.params.limit||10).offset(req.params.offset||0)
     }).fetchAll({
          withRelated:['events.event.meta']
      });


      let total = await Coupon.where({
          user: req.user.get('ID'),
      }).count();

      return res.status(200).json({
          data,
          total
      });

  }catch (e) {
      console.log(e)
      return res.status(401).json({})
  }

})


router.post('/save',  async (req, res) => {
    try{
        const { data } = req.body;
        const newCoupon = await Coupon.forge({
            user: req.user.get('ID'),
        }).save();

        for(let i of data){
           await  CouponEvent.forge({
               Coupon: newCoupon.get('ID'),
               Source: 'melbet',
               SourceID: i.eventId,
               Event: i.marketId.split('_')[0],
               Ratio: i.odds,
               Price: 1
           }).save();
        }

        return res.status(200).json({})
    }catch (e) {
        return res.status(401).json({})
    }

})


router.delete('/delete',  async (req, res) => {


    return res.status(200).send({})
})


module.exports = router;