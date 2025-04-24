const express = require('express');

const router = express.Router();
const {param, body, validationResult} = require("express-validator");
const {Sport, Champ, EventCategory, Language} = require("../Orm/Model");
const {tables, knex} = require("../Orm/Database");
const {source} = require("../config");
const { controlSports } = require("../Utils/CategorySource");
const { getFeed, getOdd, sportToEvent, toMinuteSecondFormat, champToMatch, createMarketsForChamp } = require("../Utils/1x2");

const Auth = require("../Middleware/Auth");
router.use(Auth)
router.get('/:lng/:type/:count',
    param('lng').notEmpty().withMessage('api.feed_lng_required').isString().withMessage('api.feed_lng_not_string'),
    param('type').notEmpty().withMessage('api.feed_type_required').isString().withMessage('api.feed_type_not_string').isIn(['line','live']).withMessage('api.invalid_feed_type'),
    param('count').notEmpty().withMessage('api.feed_count_required').isNumeric().withMessage('api.feed_count_not_string'),
    body('sports').optional().isArray().withMessage('api.feed_params_sports_not_array'),
    body('champs').optional().isArray().withMessage('api.feed_params_champs_not_array'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                result: false,
                message: errors.array()
            });
        }

        try{
            let { sportID, champID } = req.query;
            let { type, count } = req.params;
            let languageId;
            let languageCode;
            let arr = {};
            try{
                const language = await Language.where('Code',lng).fetch();
                languageId = language.get('ID')
                languageCode = language.get('Code')
            }catch(e){
                languageId = 1;
                languageCode = 'tr';
            }

           const sport =  await Sport.query(function (qb) {
                qb.where(tables.sport+'.Status','1');
                qb.innerJoin(tables.sport_mapping, tables.sport+'.ID', tables.sport_mapping+'.Sport');
                qb.leftJoin(tables.sport_dealer, tables.sport+'.ID', tables.sport_dealer+'.Sport');
                if(!req.user.get('is_admin')){
                    qb.where(function() {
                        this
                            .where(function (qb) {
                                qb.where(tables.sport_dealer+'.Dealer',req.user.get('dealer_id'))
                                qb.orWhereNull(tables.sport_dealer+'.Dealer');
                            })
                            .where(function(qb){
                                qb.where(tables.sport_dealer+'.Status','1')
                                    .orWhereNull(tables.sport_dealer+'.Sport');
                            })
                    });
                }
                qb.select(tables.sport_mapping+'.SourceID',tables.sport+'.ID');
            }).fetchAll({
                withRelated: [
                    {
                        'meta': function (qb){
                            qb.where('Language',languageId).orWhere('Language',languageId)
                        }
                    }
                ]
            });

            const arrSport = sport.filter(e => {
                if(sportID){
                    return sportID.split(',').includes(String(e.get('ID')))
                }
                return true;
            }).map(e => parseInt(e.get('SourceID'))).sort((a, b) => a - b);

            const champ =  await Champ.query(function (qb) {
                qb.where(tables.champ+'.Status','1');
                qb.innerJoin(tables.champ_mapping, tables.champ+'.ID', tables.champ_mapping+'.Champ');
                qb.leftJoin(tables.champ_dealer, tables.champ+'.ID', tables.champ_dealer+'.Champ');
                qb.whereIn(tables.champ+'.Sport', arrSport)
                if(champID){
                    qb.whereIn(tables.champ+'.ID', champID.split(','))
                }
                if(!req.user.get('is_admin')){
                    qb.where(function() {
                        this
                            .where(function (qb) {
                                qb.where(tables.champ_dealer+'.Dealer',req.user.get('dealer_id'))
                                qb.orWhereNull(tables.champ_dealer+'.Dealer');
                            })
                            .where(function(qb){
                                qb.where(tables.champ_dealer+'.Status','1')
                                    .orWhereNull(tables.champ_dealer+'.Champ');
                            })
                    });
                }
                qb.select(tables.champ_mapping+'.SourceID',tables.champ+'.ID',tables.champ+'.Sport');
            }).fetchAll({
                withRelated: [
                    {
                        'meta': function (qb){
                            qb.where('Language',languageId).orWhere('Language',languageId)
                        }
                    }
                ]
            });

            const arrChamp = champ.map(e => parseInt(e.get('SourceID'))).sort((a, b) => a - b);

            const controlSource = await controlSports(type,{
                sports:arrSport.join(','),
                lng: languageCode
            })

            let sportIDS = [];
            let champIDS = [];

           if(champID && sportID){
               controlSource.map(e => {
                   if(arrSport.includes(e.I)){
                       sportIDS.push(e.I);
                       if(e.hasOwnProperty('L')){
                            e.L.map(a => {
                               if(arrChamp.includes(a.LI)){
                                   champIDS.push(a.LI)
                               }
                           })
                       }
                   }
               })
           }
           else if(sportID) {
               let checkSport = controlSource.map(a => a.I);
               arrSport.map(a => {
                   if(checkSport.includes(Number(a))){
                       sportIDS.push(a);
                   }
               })
           }
           else if(champID){
               let checkChamp = controlSource.filter(e => e.hasOwnProperty('L')).map(a => {
                   return a.L.map(e => e.LI)
               }).flat()
               champ.map(a => {
                   if(checkChamp.includes(Number(a.get('SourceID')))){
                       champIDS.push(a.get('SourceID'));
                   }
               })
           }
           else{
               const filterSport = controlSource.filter((a) => {
                   if(sportID){
                       return sportID.split(',').includes(String(a.I));
                   }
                   return true;
               })

               for(let o of filterSport) {
                   if(o.CID === 1) {
                       sportIDS.push(o.I);

                       if(o.L && Array.isArray(o.L)) {
                           for(let l of o.L) {
                               if(l && l.LI) {
                                   if(arrChamp.includes(l.LI)){
                                       champIDS.push(l.LI);

                                   }
                               }
                           }
                       }

                   }
               }
           }



            if(sportIDS.length > 0){
                arr.sports = sportIDS.sort((a, b) => a - b).join(',');
                if(champIDS.length > 0){
                    arr.champs = champIDS.sort((a, b) => a - b).join(',');
                }
            }else{
                if(champIDS.length > 0){
                    arr.champs = champIDS.sort((a, b) => a - b).join(',');
                }
            }

            const requestData = await getFeed(type,{
                ...arr,
                count: count,
                lng: req.params.lng,
                mode: 4,
                country: 190,
                partner: 8,
                virtualSports: true
            });
            const odd = await getOdd(languageId, 'melbet', req.user.get('is_admin'), req.user.get('dealer_id'));
            const allEvents = [];
            sport.map(sport => {
                champ.map(champ => {
                    requestData.map(r => {
                        const event = sportToEvent(sport,champ,r);
                        const match = champToMatch(sport, champ,  r, type);
                        if(match){
                            const markets = [];
                            const ev = createMarketsForChamp(champ, r, odd);
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
            return  res.json(allEvents);

        }catch(err){
            console.log(err)
            return res.status(400).json({})
        }
})

module.exports = router;