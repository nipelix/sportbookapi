const {  EventCategory, Sport} = require('../Orm/Model');

module.exports = async (req, res, next) => {
    const source = 'melbet';
    const is_admin = req.user.get('UserRole') === 'admin';
    const is_main_dealer = req.user.get('UserRole') === 'main_dealer';
    const is_sub_dealer = req.user.get('UserRole') === 'sub_dealer';
    const is_user = req.user.get('UserRole') === 'user';
    try {

        let withRelated = [

            {
                'externalMapping': function (query){
                    query.where('Source',source);
                },
                'champs': function (query){
                    query.where('Status','1');
                },
                'champs.externalMapping': function (query){
                    query.where('Source',source);
                },
                'champs.country': function (query){
                    query.where('Status','1');
                }
            }
        ];

        let withRelatedOdd = [{
            'eventGroups': function (query){
                query.where('Status','1');
            },
            'eventGroups.events.externalMapping': function (query){
                query.where('Source',source);
            },
        }];

        if (!is_admin) {
            let dealer_id = 0;
            if (is_main_dealer) {
                dealer_id = req.user.get('ID');
            } else if (is_sub_dealer) {
                dealer_id = req.user.get('ParentID');
            } else if (is_user) {
                const x = req.user.related('parentDealer');
                if (x) {
                    if (x.get('UserRole') === 'main_dealer') {
                        dealer_id = x.get('ID');
                    }
                    if (x.get('UserRole') === 'sub_dealer') {
                        dealer_id = x.get('ParentID');
                    }
                }
            }


            withRelated.push( {
                'dealerSport': function (query){
                    query.where('Status','1');
                    query.where('DealerID',dealer_id);
                },
                'champs.dealerChamp': function (query){
                    query.where('Status','1');
                    query.where('DealerID',dealer_id);
                },
                'champs.country.dealerCountry': function (query){
                    query.where('Status','1');
                    query.where('DealerID',dealer_id);
                }
            });

            withRelatedOdd.push( {
                'eventGroups.dealerEvent': function (query){
                    query.where('Status','1');
                    query.where('DealerID',dealer_id);
                }
            })
        }


        const sports = await Sport.where('Status','1').fetchAll({
            withRelated:withRelated
        });

        const odds = await EventCategory.fetchAll({
                withRelated:withRelatedOdd
        });


        req.config = { odds:[], sports:[] }
        req.config.odds = odds.toJSON()
            .map((item) => {

                const filteredGroup = item.eventGroups.map(e => {
                    let filteredEvents = [];
                    if (e.hasOwnProperty('events')) {
                       filteredEvents =  e.events.filter((item) => {
                            if(item.hasOwnProperty('externalMapping')){
                                return Object.keys(item.externalMapping).length > 0
                            }
                            return false
                        })
                    }

                    return {
                        ...e,
                        events: filteredEvents
                    }
                }).filter(s => {
                    if (s.hasOwnProperty('events')) {
                        return s.events.length > 0 && s.Status === '1'
                    }
                    return false
                }).filter(s => {
                    if(is_admin){
                        return true;
                    }
                    if (s.hasOwnProperty('dealerEvent')) {
                        return Object.keys(s.dealerEvent).length > 0;
                    }
                    return true
                });


                return {
                    ...item,
                    eventGroups: filteredGroup
                };
            })
            .filter((item) => {
                if(item.hasOwnProperty('eventGroups')){
                    return item.eventGroups.length>0
                }
                return false;
            })

        req.config.sports = (
            sports
            .toJSON().filter((item) => {
                    if(item.hasOwnProperty('externalMapping')){
                        return Object.keys(item.externalMapping).length > 0
                    }
                    return false
                }).filter(sport => {
                if(is_admin){
                    return true;
                }
                if(!sport.hasOwnProperty('dealerSport')){
                    return false;
                }else{
                    return Object.keys(sport.dealerSport).length > 0 && sport.dealerSport.Status === '1';
                }
             }).map(sport => {
                const filteredChamps = sport.champs.filter(champ => {
                    if(champ.hasOwnProperty('externalMapping')){
                        return Object.keys(champ.externalMapping).length > 0
                    }
                    return false
                }).filter(champ => {
                    if(is_admin){
                        return true;
                    }
                    if(!champ.hasOwnProperty('dealerChamp')){
                        return false;
                    }else{
                        return Object.keys(champ.dealerChamp).length > 0 && champ.dealerChamp.Status === '1';
                    }
                }).filter(champ => {
                    return champ.country && Object.keys(champ.country).length > 0;
                }).filter(champ => {
                    if(is_admin){
                        return true;
                    }
                    if(!champ.country.hasOwnProperty('dealerCountry')){
                        return false;
                    }else{
                        return Object.keys(champ.country.dealerCountry).length > 0 && champ.country.dealerCountry.Status === '1';
                    }
                });

                return {
                    ...sport,
                    champs: filteredChamps
                };

            }).filter(sport => {
                 return sport.champs.length > 0;
            })
        );

        if(req.config.sports.length === 0){
            return res.status(401).json({
                status: 'error',
                message: 'api.sport_not_found'
            });
        }

        if(req.config.odds.length === 0){
            return res.status(401).json({
                status: 'error',
                message: 'api.odd_not_found'
            });
        }

     return  next();
    }catch (e) {
        console.error(e);

        return res.status(401).json({
            status: 'error',
            message: 'api.global_error'
        });
    }



};