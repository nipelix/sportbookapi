const axios = require('axios');
const slugify = require('slugify');
const {Language, Sport, SportMapping, SportMeta, ChampMapping, Champ, ChampMeta} = require("../Orm/Model");
const getSports = async () => {
    const url = 'https://melbet.com/service-api/LineFeed/GetSportsShortZip';
    console.log('Start: Get Sports');
    try{
        let languages = await Language.fetchAll();
        for(let language of languages){
            try{
                const data = await axios.get(url,{
                    params:{
                        lng: language.get('Code'),
                        country: 190,
                        partner: 8,
                        virtualSports: true,
                        gr:2099
                    }
                });
                let arr = [];

                for(let item of data.data.Value){
                    if(!arr.includes(item.I)){
                        arr.push(item.I)
                    }
                }
            //    await (new Promise(resolve => setTimeout(resolve, 3000)));
                const data2 = await axios.get(url,{
                    params:{
                        sports:arr.sort((a,b) => a-b).join(','),
                        lng: language.get('Code'),
                        country: 190,
                        partner: 8,
                        virtualSports: true,
                        gr:2099
                    }
                });

                for(let item of data2.data.Value){

                    let sportId;
                    try{
                        let mapping = await SportMapping.where({
                            Source: 'melbet',
                            SourceID: ''+item.I,
                        }).fetch();
                        sportId = mapping.get('Sport')

                        try{
                           await SportMeta.where({
                               Language: language.get('ID'),
                               Sport: sportId,
                            }).fetch();
                        }catch(e){
                          try{
                              let slug = slugify( item.N,{
                                  replacement: '-',
                                  lower: true,
                                  strict: true,
                                  locale: 'tr'
                              });
                              const count = await SportMeta.query(function (qb) {
                                  qb.whereILike('Slug', '%'+slug+'%')
                              }).count();
                              if(count > 0){
                                  slug = slug+'-'+count
                              }
                              await SportMeta.forge({
                                  Name: item.N,
                                  Sport: sportId,
                                  Language: language.get('ID'),
                                  Slug: slug,
                              }).save();
                          }catch(e){
                              console.log(e)
                          }
                        }
                    }catch(err){
                        try{
                            const newSport = await Sport.forge({
                                Status: '1',
                                Popular: '0',
                                Icon: null
                            }).save();
                            sportId = newSport.get('ID')
                            await SportMapping.forge({
                                Source: 'melbet',
                                SourceID: ''+item.I,
                                Sport: sportId,
                            }).save();
                            let slug = slugify( item.N,{
                                replacement: '-',
                                lower: true,
                                strict: true,
                                locale: 'tr'
                            });
                            const count = await SportMeta.query(function (qb) {
                                qb.whereILike('Slug', '%'+slug+'%')
                            }).count();
                            if(count > 0){
                                slug = slug+'-'+count
                            }
                            await SportMeta.forge({
                                Name: item.N,
                                Sport: sportId,
                                Language: language.get('ID'),
                                Slug: slug
                            }).save();

                        }catch(err){
                            console.log(err)
                        }
                    }

                    if(sportId) {
                        if (item.hasOwnProperty('L')) {

                            for (let l of item.L) {

                                try {

                                    let mapping = await ChampMapping.where({
                                        Source: 'melbet',
                                        SourceID: '' + l.LI,
                                    }).fetch();

                                    try{
                                        await ChampMeta.where({
                                            Language: language.get('ID'),
                                            Champ: mapping.get('Champ'),
                                        }).fetch();
                                    }catch(e){
                                        try{
                                            let slug = slugify( l.L,{
                                                replacement: '-',
                                                lower: true,
                                                strict: true,
                                                locale: 'tr'
                                            });
                                            const count = await ChampMeta.query(function (qb) {
                                                qb.whereILike('Slug', '%'+slug+'%')
                                            }).count();
                                            if(count > 0){
                                                slug = slug+'-'+count
                                            }


                                            await ChampMeta.forge({
                                                Name: l.L,
                                                Champ: mapping.get('Champ'),
                                                Language: language.get('ID'),
                                                Slug: slug,
                                            }).save();

                                        }catch(e){
                                            console.log(e);
                                        }
                                    }
                                } catch (e) {
                                    try {
                                        const newChamp = await Champ.forge({
                                            Status: '1',
                                            Popular: '0',
                                            Icon: null,
                                            Sport:sportId
                                        }).save();
                                        let ch = newChamp.get('ID')
                                        await ChampMapping.forge({
                                            Source: 'melbet',
                                            SourceID: '' + l.LI,
                                            Champ: ch,
                                        }).save();
                                        let slug = slugify( l.L,{
                                            replacement: '-',
                                            lower: true,
                                            strict: true,
                                            locale: 'tr'
                                        });
                                        const count = await ChampMeta.query(function (qb) {
                                            qb.whereILike('Slug', '%'+slug+'%')
                                        }).count();
                                        if(count > 0){
                                            slug = slug+'-'+count
                                        }

                                        await ChampMeta.forge({
                                            Name: l.L,
                                            Champ: ch,
                                            Language: language.get('ID'),
                                            Slug: slug
                                        }).save();
                                    } catch (e) {}
                                }
                            }

                        }
                    }

                }
            }catch (e) {
                console.log(e)
            }
        }
    }catch (e) {
        console.log(e)
    }

    console.log('Finish: Get Sports')
}

const controlSports = async (type,params) => {
    try{
        const endPoint = type === 'line' ? 'https://melbet.com/service-api/LineFeed/GetSportsShortZip' : 'https://melbet.com/service-api/LiveFeed/GetSportsShortZip';
        const data = await axios.get(endPoint,{
            params
        });
        return data.data.Value
    }catch (e) {
        return []
    }
}

module.exports = { getSports, controlSports };

/*
   const data = await axios.get(url,{
            params:{
                lng: code,
                country: 190,
                partner: 8,
                virtualSports: true,
                gr:2099
            }
        });
       for(let item of data.data.Value){
            try{
                let q = await SportMapping.where({
                    Source: 'melbet',
                    SourceID: ''+item.I,
                }).fetch();
               try{
                   await SportMeta.where({
                       Language: languageId,
                       Sport: q.get('Sport'),
                   }).fetch();

               }catch (e) {
                   await SportMeta.forge({
                       Name: item.N,
                       Sport: newSport.id,
                       Language: languageId,
                   }).save();
               }

            }catch (e) {
                try{
                    const newSport = await Sport.forge({
                        Status: '1',
                        Popular: '0',
                        Icon: null
                    }).save();
                    await SportMapping.forge({
                        Source: 'melbet',
                        SourceID: ''+item.I,
                        Sport: newSport.id,
                    }).save();
                    await SportMeta.forge({
                        Name: item.N,
                        Sport: newSport.id,
                        Language: languageId,
                    }).save();
                }catch (e) {
                    console.log(e)
                }
            }
       }

 */