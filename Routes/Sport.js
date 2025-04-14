const express = require('express');

const router = express.Router();

const Auth = require("../Middleware/Auth");
const Config = require("../Middleware/Config");
const {body, validationResult} = require("express-validator");
const {Favorite} = require("../Orm/Model");
const {request} = require("../Utils/melbet");
const Convert = require("../Utils/Convert");


router.use(Auth)


router.post('/favorite', body('type').notEmpty().withMessage('api.type_required'),body('id').notEmpty().withMessage('api.champs_required'), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            result: false,
            message: errors.array()
        });
    }


    try{
      const { type, id } = req.body;

      if(type === 'add'){
          await Favorite.forge({
              ChampID: id,
              UserID: req.user.get('ID')
          }).save({})
          return res.status(200).send({
              result: true,
              data: null,
              message:[]
          });
      }else if(type === 'remove'){
         await Favorite.where({
              ChampID: id,
              UserID: req.user.get('ID')
          }).destroy();
          return res.status(200).send({
              result: true,
              data: null,
              message:[]
          });
      }else{
          return res.status(401).send({
              result: false,
              data: null,
              message:[{
                  msg: 'api.global_error'
              }]
          });
      }
    }catch (e) {
        console.log(e)
        return res.status(401).send({
            result: false,
            data: null,
            message:[{
                msg: 'api.global_error'
            }]
        });
    }

})


router.use(Config)

router.get('/', async (req, res) => {

    const sportMapping =  req.config.sports;
    const champsPopular = [];
    const sportPopular = [];
    const favoriteList = [];
    const list = await Favorite.where('UserID',req.user.get('ID')).fetchAll();
    const IDList = list.map((item) => item.get('ChampID'));

    const sportAll = sportMapping.map(function(item) {
        item.champs.map(function(champ) {
            if(champ.Popular === '1'){
                if(IDList.includes(champ.ID)){
                    favoriteList.push({
                        readSvg: item.readSvg,
                        title: champ.Name,
                        href: "/sport/"+item.Slug+"/"+champ.Slug,
                        ID: champ.ID,
                        isFavorite: true
                    });
                }else{
                    champsPopular.push({
                        readSvg: item.readSvg,
                        title: champ.Name,
                        href: "/sport/"+item.Slug+"/"+champ.Slug,
                        ID: champ.ID,
                        isFavorite: false
                    });
                }
            }
        })

        if(item.Popular === '1'){
            sportPopular.push({
                readSvg: item.readSvg,
                title: item.Name,
                href: "/sport/"+item.Slug,
                ID: item.ID,
            });
        }
        return {
            readSvg: item.readSvg,
            title: item.Name,
            href: "/sport/"+item.Slug,
            ID: item.ID,
        };
    })

    return res.status(200).json({
        result: true,
        data:{
            sportAll,
            sportPopular,
            champsPopular,
            favoriteList
        }
    });
});

router.post('/feed',
    body('type').notEmpty().withMessage('api.feed_type_required').isString().withMessage('api.feed_type_not_string').isIn(['line','live']).withMessage('api.invalid_feed_type'),
    body('params').notEmpty().withMessage('api.feed_params_required').isObject().withMessage('api.feed_params_not_object'),
    body('params.count').notEmpty().withMessage('api.feed_params_count_required').isInt().withMessage('api.feed_params_count_not_number'),
    body('params.lng').notEmpty().withMessage('api.feed_params_lang_required').isString().withMessage('api.feed_params_lang_not_string'),
    body('params.mode').notEmpty().withMessage('api.feed_params_mode_required').isInt().withMessage('api.feed_params_mode_not_number'),
    body('params.country').notEmpty().withMessage('api.feed_params_country_required').isInt().withMessage('api.feed_params_country_not_number'),
    body('params.partner').notEmpty().withMessage('api.feed_params_partner_required').isInt().withMessage('api.feed_params_partner_not_number'),
    body('params.virtualSports').notEmpty().withMessage('api.feed_params_virtualSports_required').isBoolean().withMessage('api.feed_params_virtualSports_not_number'),
    body('params.sports').optional().isArray().withMessage('api.feed_params_sports_not_array'),
    body('params.champs').optional().isArray().withMessage('api.feed_params_champs_not_array'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                result: false,
                message: errors.array()
            });
        }
        const { type, params } = req.body;
        const sportMapping =  req.config.sports.map(item => {
            return item.externalMapping.SourceID;
        }).sort((a, b) => a - b)

        const champMappingArr = req.config.sports.map(item => {
            return item.champs.map(e => {
                return e.externalMapping.SourceID
            });
        }).flat()



        const champMapping = [...new Set(champMappingArr)].sort((a, b) => a - b);

        try{
            const endPoint = type === 'line'
                ? 'https://tr.melbet.com/service-api/LineFeed/'
                : 'https://tr.melbet.com/service-api/LiveFeed/';

            const queryString = Object.entries({
                sports: sportMapping,
                champs: champMapping,
                ...params
            })
                .map(([key, value]) => `${key}=${value}`)
                .join('&');
            const url = endPoint + 'Get1x2_VZip' + '?' + queryString;

            const requestData = await request(url);

            const allEvents = [];

            req.config.sports.forEach(sport => {
                sport.champs.forEach(champ => {
                    requestData.map(r => {
                        const event = Convert.sportToEvent(sport,champ,r);
                        const match = Convert.champToMatch({ ID:sport.ID, externalMapping: sport.externalMapping.SourceID }, { ID:champ.ID, externalMapping: champ.externalMapping.SourceID }, r);
                        if(match){
                            const markets = [];

                            const ev = Convert.createMarketsForChamp(champ, r, req.config.odds);
                            ev.map(e => markets.push(e));
                            if(markets.length > 0){
                                allEvents.push({
                                    ...event,
                                    match:match,
                                    markets
                                })
                            }

                        }
                    })
                })
            })
            return  res.json({
                result: true,
                data: allEvents
            });

        }catch (e) {
                console.error(e);
                return res.status(401).json({
                    result: false,
                    message: [{
                        msg:'api.global_error'
                    }]
                });
        }

})
module.exports = router;