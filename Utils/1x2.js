const axios = require('axios');
const { Category } = require('../Orm/Model');
const moment = require("moment");

const getFeed = async (type,params) => {
    try{
        const endPoint = type === 'line' ? 'https://melbet.com/service-api/LineFeed/Get1x2_VZip' : 'https://melbet.com/service-api/LiveFeed/Get1x2_VZip';

        const data = await axios.get(endPoint,{
            params
        });

        return data.data.Value
    }catch (e) {
        console.log(e)
        return []
    }
}

const getOdd = async (languageId,source, is_admin,dealer_id) => {

    let oddOptions = [{
        'meta': function (query){
            query.where('Language',languageId).orWhere('Language',1);
        },
        'groups.meta': function (query){
            query.where('Language',languageId).orWhere('Language',1);
        },
        'groups.events.meta': function (query){
            query.where('Language',languageId).orWhere('Language',1);
        },
        'groups.events.external_mapping': function (query){
            query.where('Source',source);
        },
    }];
    if(!is_admin){
        oddOptions.push( {
            'groups.dealer': function (query){
                query.where('Status','1');
                query.where('Dealer',dealer_id);
            }
        })
    }

    let odds = await Category.fetchAll({
        withRelated:oddOptions
    });


    return odds.toJSON().map((item) => {
        const filteredGroup = item.groups.map(e => {
            let filteredEvents = [];
            if (e.hasOwnProperty('events')) {
                filteredEvents =  e.events.filter((item) => {
                    if(item.hasOwnProperty('external_mapping')){
                        return Object.keys(item.external_mapping).length > 0
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
            if (s.hasOwnProperty('dealer')) {
                return Object.keys(s.dealer).length > 0;
            }
            return true
        });


        return {
            ...item,
            groups: filteredGroup
        };
    }).filter((item) => {
        if(item.hasOwnProperty('groups')){
            return item.groups.length>0
        }
        return false;
    })
}

const sportToEvent = (sport,champ,matchData) => {
    return {
        id: ""+matchData.I,
        category: sport.related('meta').get('Slug'),
        categoryLabel: sport.related('meta').get('Name'),
        name: champ.related('meta').get('Name'),
        flag: champ.get('Icon'),
        banner: champ.get('Banner'),
        accordionMarkets: ["2","4"],
        cardMarket: "2"
    };
};

const toMinuteSecondFormat = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
};

const champToMatch = (sport, champ, matchData, type="line", status = "scheduled") => {

    if(''+matchData.SI === ''+sport.get('SourceID') && ''+champ.get('SourceID') === ''+matchData.LI && matchData?.O1E !== 'Home') {
        const duration = matchData.SC.hasOwnProperty('TS') ? ','+toMinuteSecondFormat(matchData?.SC?.TS??0) : '';

        const date = moment.unix(matchData.S);
        const data = {
            id: ""+matchData.I,
            event: ""+matchData.I,
            status: type === 'live' ? "live" : "scheduled",
            statusText: matchData?.SC?.I ? ('scheduled,'+duration) : (matchData.SC.CPS+duration),
            startDate: date.toISOString(),
            participants: {
                type: "teams",
                target: {},
            },
        };


        if (matchData.O1E && matchData.O1I) {
            data.participants.target[1] = {
                name: matchData.O1E,
                id: matchData.O1I
            };


        }

        if (matchData.O2E && matchData.O2I) {
            data.participants.target[2] = {
                name: matchData.O2E,
                id: matchData.O2I
            };
        }

        if(type === 'live'){

            data.score = {
                scores: {
                    1: matchData?.SC?.FS?.S1??0,
                    2:  matchData?.SC?.FS?.S2??0,
                }
            };


            data.periods = [];
            matchData.SC.PS.forEach(sc => {
                const value = sc.Value;

                data.periods.push({ scores: { 1: value?.S1??0, 2: value?.S2??0 } })
            })



        }

        return data;
    }

    return false;
}

const createMarketsForChamp = (champ, matchData, categories) => {
    const data = [];

    categories.map(category => {
        category.groups.map(group => {
            data.push({
                id: ''+group.ID,
                eventId: ''+matchData.I,
                label: group.meta.Name,
                status: "open",
                selections:[]
            })
            let last_index = data.length - 1;

            group.events.map(event => {
                const find = matchData.E.find(t => ''+t.T === ''+event.external_mapping.SourceID);
                data[last_index].selections.push({
                    id: matchData.I+'_'+event.ID,
                    marketId: ''+group.ID,
                    name: event.meta.Name,
                    marketLabel: group.meta.Name,
                    odds: parseFloat((find?find.C:0).toFixed(2)),
                    status: find ? "open" : "on-hold",
                    eventId: ''+matchData.I,
                    matchId: ''+matchData.I
                });
            })
        })
    })

    return data;
}


module.exports = { getFeed,getOdd,sportToEvent,toMinuteSecondFormat,champToMatch,createMarketsForChamp };