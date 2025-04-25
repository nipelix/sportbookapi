const express = require('express');
const router = express.Router();
const Auth = require("../Middleware/Auth");
const { param, validationResult } = require('express-validator');
 const {Language,Sport, Champ, Favorite} = require("../Orm/Model");
const { tables} = require("../Orm/Database");
const language = require("bookshelf/lib/base/model");
router.use(Auth)
router.get('/:lng',param('lng').notEmpty().withMessage('api.feed_lng_required').isString().withMessage('api.feed_lng_not_string'), async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(401).json({  msg: errors.array()[0] });
    }


    try{

        const champsPopular = [];
        const sportPopular = [];
        const favoriteList = [];
        const sportAll = [];
        const { lng } = req.params;
        let languageId;
        try{
            const language = await Language.where('Code',lng).fetch();
            languageId = language.get('ID')
        }catch(e){
            languageId = 1;
        }
        const list = await Favorite.where('User',req.user.get('ID')).fetchAll();
        const IDList = list.map((item) => item.get('Champ'));
        await Sport.query(function (qb) {
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
            qb.select([tables.sport+'.ID','Icon','Popular'])
        }).fetchAll({
            withRelated: [
                {
                    'meta': function (qb){
                        qb.where('Language',languageId).orWhere('Language',languageId)
                    }
                }
            ]
        }).map(function (item) {
            if(item.get('Popular') === '1'){
                sportPopular.push({
                    read_svg: item.get('read_svg'),
                    title: item.related('meta').get('Name'),
                    href: item.related('meta').get('Slug'),
                    id: item.get('ID'),
                })
            }
            sportAll.push({
                read_svg: item.get('read_svg'),
                title: item.related('meta').get('Name'),
                href: item.related('meta').get('Slug'),
                id: item.get('ID'),
            })
        });

        await Champ.query(function (qb) {
            qb.where(tables.champ+'.Status','1');
            qb.where(tables.champ+'.Popular','1');
            qb.innerJoin(tables.champ_mapping, tables.champ+'.ID', tables.champ_mapping+'.Champ');
            qb.leftJoin(tables.champ_dealer, tables.champ+'.ID', tables.champ_dealer+'.Champ');
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
            qb.select([tables.champ+'.ID','Icon','Popular'])
        }).fetchAll({
            withRelated: [
                {
                    'meta': function (qb){
                        qb.where('Language',languageId).orWhere('Language',languageId)
                    }
                }
            ]
        }).map(function (item) {
            if(IDList.includes(item.get('ID'))){
                favoriteList.push({
                    read_svg: item.get('read_svg'),
                    title: item.related('meta').get('Name'),
                    href: item.related('meta').get('Slug'),
                    id: item.get('ID'),
                    sport_id: item.get('Sport'),
                    is_favorite: true
                })
            }else{
                champsPopular.push({
                    read_svg: item.get('read_svg'),
                    title: item.related('meta').get('Name'),
                    href: item.related('meta').get('Slug'),
                    id: item.get('ID'),
                    sport_id: item.get('Sport'),
                    is_favorite: false
                })
            }

        });


        return res.status(200).json({
            sports_all:sportAll,
            sports_popular:sportPopular,
            champs_popular:champsPopular,
            favorites_list:favoriteList
        });

    }catch (e) {
        console.log(e)
        return res.status(401).json({  msg: "global_error" });
    }
});



module.exports = router;