const moment = require('moment');
const events = require("node:events");

const convert = {
    sportToEvent: (sport,champ,matchData) => {
        return {
            id: ""+matchData.I,
            category: sport.Slug,
            categoryLabel: sport.Name,
            name: champ.Name,
            flag: champ.Icon,
            banner: champ.Banner,
            accordionMarkets: ["2","4"],
            cardMarket: "2"
        };
    },

    champToMatch: (sport, champ, matchData, status = "scheduled") => {

            if(''+matchData.SI === ''+sport.externalMapping && ''+champ.externalMapping === ''+matchData.LI && matchData?.O1E !== 'Home') {

                const date = moment.unix(matchData.S);
                const data = {
                    id: ""+matchData.I,
                    event: ""+matchData.I,
                    status: status,
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

                return data;
            }


        return false;
    },


    createMarketsForChamp: (champ, matchData, oddSetting) => {
        const data = [];

        oddSetting.map(oddCategory => {
            oddCategory.eventGroups.map(oddGroup => {
                data.push({
                    id: ''+oddGroup.ID,
                    eventId: ''+matchData.I,
                    label: oddGroup.Name,
                    status: "open",
                    selections:[]
                })
                let last_index = data.length - 1;

                oddGroup.events.map(event => {
                    const find = matchData.E.find(t => ''+t.T === ''+event.externalMapping.SourceID);
                    data[last_index].selections.push({
                        id: matchData.I+'_'+event.ID,
                        marketId: ''+oddGroup.ID,
                        name: event.Name,
                        marketLabel: oddGroup.Name,
                        odds: parseFloat((find?find.C:0).toFixed(2)),
                        status: find ? "open" : "on-hold",
                        eventId: ''+matchData.I,
                        matchId: ''+matchData.I
                    });
                })
            })
        })

        return data;
    },

    createMatchEvent: (event, match = [], markets = []) => {
        return {
            ...event,
            match: match,
            markets: markets
        };
    }



}


module.exports = convert;