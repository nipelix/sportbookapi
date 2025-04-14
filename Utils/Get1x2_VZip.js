// Import models (you need to convert this to a JavaScript file)
const models = require('./full.json');

const BASE_IMAGE_URL = {
    CHAMPIONSHIP: 'https://v3.traincdn.com/sfiles/logo-champ/',
    TEAM: 'https://v3.traincdn.com/sfiles/logo_teams/'
};

/**
 * Processes sports data and organizes it by leagues with header filtering
 * @param {Array} response - Array of sport event data
 * @returns {Promise<Array>} - Array of organized league data with headers
 */
const Get1x2_VZip = async response => {
    const leagues = {};
    const model = models;

    for (const sport of response) {
        if (!leagues[sport.LI]) {
            leagues[sport.LI] = {
                id: sport.LI,
                name: sport.L,
                country: sport.CN,
                countryId: sport.CI,
                countryFlag: sport.CHIMG ? `${BASE_IMAGE_URL.CHAMPIONSHIP}${sport.CHIMG}` : '',
                sportName: sport.SN,
                sportId: sport.SI,
                sportFlag: sport.SIMG ? `${BASE_IMAGE_URL.CHAMPIONSHIP}${sport.SIMG}` : '',
                match: [],
                activeItems: []
            };
        }

        const match = {
            id: sport.I,
            teams: {},
            start: sport.S,
            odd: {},
            odd_count: sport.EC
        };

        if (sport.O1E && sport.O1I) {
            match.teams[1] = {
                name: sport.O1E,
                id: sport.O1I
            };
        }

        if (sport.O2E && sport.O2I) {
            match.teams[2] = {
                name: sport.O2E,
                id: sport.O2I
            };
        }

        // Process odds and add header filtering
        if (sport.E.length > 0) {
            for (const odd of sport.E) {
                if (!match.odd[odd.G]) {
                    match.odd[odd.G] = [];
                }

                if (model[odd.G] && model[odd.G].M && model[odd.G].M[odd.T]) {
                    match.odd[odd.G].push({
                        group: odd.G,
                        event_id: odd.T,
                        params: odd.P,
                        name: model[odd.G].M[odd.T].N,
                        event: odd.C,
                        position: model[odd.G].P !== null ? model[odd.G].P : 0
                    });
                }
            }
        }

        leagues[sport.LI].match.push(match);
    }

    return Object.values(leagues);
};

module.exports = Get1x2_VZip;