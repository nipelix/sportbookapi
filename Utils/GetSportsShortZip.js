/**
 * Processes and categorizes sports data into a structured hierarchy
 * @param {Array} response - API response data
 * @returns {Promise<Array>} - Array of categorized sports data
 */
const GetSportsShortZip = async (response) => {
    const category = [];
    const cats = [];
    const country = [];
    const league = [];

    for (const r of response) {
        if (!r.hasOwnProperty('MS') || r.MS === 1) {
            const catIndex = cats.findIndex((e) => e.id === r.I);
            if (catIndex === -1) {
                cats.push({
                    id: r.I,
                    name: r.N
                });
            }

            const categoryItem = {
                id: r.I,
                name: r.N,
                count: r.C,
                sub: [],
            };

            if (r.hasOwnProperty('L') && Array.isArray(r.L)) {
                for (const l of r.L) {
                    if (l.hasOwnProperty('CI') && !l.hasOwnProperty('SC')) {
                        // League processing
                        const leagueIndex = league.findIndex((e) => e.id === l.LI);
                        if (leagueIndex === -1) {
                            league.push({
                                id: l.LI,
                                name: l.L,
                                icon: l.CHIMG ? `https://v3.traincdn.com/sfiles/logo-champ/${l.CHIMG}` : '',
                                country: l.CI,
                                sport: r.I
                            });
                        }

                        const leagueItem = {
                            name: l.L,
                            id: l.LI,
                            count: l.GC,
                            type: 'league',
                            image: l.CHIMG ? `https://v3.traincdn.com/sfiles/logo-champ/${l.CHIMG}` : '',
                            sub: [],
                        };
                        categoryItem.sub.push(leagueItem);
                    } else {
                        // Country processing
                        if (Array.isArray(l.SC)) {
                            const countryImage = l.CHIMG ? `https://v3.traincdn.com/sfiles/logo-champ/${l.CHIMG}` : '';
                            const countryId = l.SC[0]?.CI;

                            if (countryId) {
                                const countryIndex = country.findIndex((e) => e.id === countryId);
                                if (countryIndex === -1) {
                                    country.push({
                                        id: countryId,
                                        name: l.L,
                                        icon: countryImage
                                    });
                                }

                                const countryItem = {
                                    name: l.L,
                                    id: countryId,
                                    lid: l.LI,
                                    count: l.GC,
                                    type: 'country',
                                    icon: countryImage,
                                    sub: [],
                                };

                                for (const sc of l.SC) {
                                    const leagueIndex = league.findIndex((e) => e.id === sc.LI);
                                    if (leagueIndex === -1) {
                                        league.push({
                                            id: sc.LI,
                                            name: sc.L,
                                            icon: sc.CHIMG ? `https://v3.traincdn.com/sfiles/logo-champ/${sc.CHIMG}` : '',
                                            country: sc.CI,
                                            sport: r.I
                                        });
                                    }

                                    const subLeagueItem = {
                                        name: sc.L,
                                        id: sc.LI,
                                        count: sc.GC,
                                        type: 'league',
                                        icon: sc.CHIMG ? `https://v3.traincdn.com/sfiles/logo-champ/${sc.CHIMG}` : '',
                                    };
                                    countryItem.sub.push(subLeagueItem);
                                }
                                categoryItem.sub.push(countryItem);
                            }
                        }
                    }
                }
            }
            category.push(categoryItem);
        }
    }

    return category;
};

module.exports = GetSportsShortZip;