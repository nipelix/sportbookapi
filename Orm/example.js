// Bu kod, veritabanınıza Türkiye, Süper Lig, futbol takımları, admin kullanıcısı ve bahis seçenekleri için örnek veriler ekler
const { knex } = require('./Database.js');
const { Sport, Country, Champ, User } = require('./Model.js');
const bcrypt = require('bcrypt');

const seedTurkishFootballData = async () => {
    try {
        // 1. Admin kullanıcısı ekle
        const adminExists = await knex('user').where('Username', 'admin').first();
        let adminId;

        if (!adminExists) {
            // Şifreyi hashle
            const hashedPassword = await bcrypt.hash('admin123', 10);

            const [admin] = await knex('user').insert({
                Username: 'admin',
                Password: hashedPassword,
                UserRole: 'admin',
                Status: '1'
            }).returning('ID');

            adminId = admin;
            console.log('Admin kullanıcısı eklendi, ID:', adminId);
        } else {
            adminId = adminExists.ID;
            console.log('Admin kullanıcısı zaten mevcut, ID:', adminId);
        }

        // 2. Türkiye'yi ülke olarak ekle
        const turkeyExists = await knex('country').where('Name', 'Türkiye').first();
        let turkeyId;

        if (!turkeyExists) {
            const [turkey] = await knex('country').insert({
                Name: 'Türkiye',
                Code: 'TUR',
                Flag: 'turkey-flag.png',
                Status: '1'
            }).returning('ID');

            turkeyId = turkey;
            console.log('Türkiye ülke olarak eklendi, ID:', turkeyId);
        } else {
            turkeyId = turkeyExists.ID;
            console.log('Türkiye zaten mevcut, ID:', turkeyId);
        }

        // 3. Futbol sporunu ekle
        const footballExists = await knex('sports').where('Name', 'Futbol').first();
        let footballId;

        if (!footballExists) {
            const [football] = await knex('sports').insert({
                Name: 'Futbol',
                Icon: 'football-icon.png',
                Popular: '1',
                Status: '1'
            }).returning('ID');

            footballId = football;
            console.log('Futbol sporu eklendi, ID:', footballId);
        } else {
            footballId = footballExists.ID;
            console.log('Futbol sporu zaten mevcut, ID:', footballId);
        }

        // 4. Süper Lig'i şampiyona olarak ekle
        const superLigExists = await knex('champs').where('Name', 'Süper Lig').first();
        let superLigId;

        if (!superLigExists) {
            const [superLig] = await knex('champs').insert({
                Name: 'Süper Lig',
                Icon: 'superlig-logo.png',
                SportID: footballId,
                CountryID: turkeyId,
                Popular: '1',
                Status: '1'
            }).returning('ID');

            superLigId = superLig;
            console.log('Süper Lig şampiyonası eklendi, ID:', superLigId);
        } else {
            superLigId = superLigExists.ID;
            console.log('Süper Lig şampiyonası zaten mevcut, ID:', superLigId);
        }

        // Önce Event Category oluştur (Futbol Takımları)
        let eventCategoryId;
        const eventCategoryExists = await knex('event_category').where('Name', 'Futbol Takımları').first();

        if (!eventCategoryExists) {
            const [eventCategory] = await knex('event_category').insert({
                Name: 'Futbol Takımları'
            }).returning('ID');

            eventCategoryId = eventCategory;
            console.log('Futbol Takımları kategorisi eklendi, ID:', eventCategoryId);
        } else {
            eventCategoryId = eventCategoryExists.ID;
            console.log('Futbol Takımları kategorisi zaten mevcut, ID:', eventCategoryId);
        }

        // Event Group oluştur (Süper Lig Takımları)
        let eventGroupId;
        const eventGroupExists = await knex('event_group').where('Name', 'Süper Lig Takımları').first();

        if (!eventGroupExists) {
            const [eventGroup] = await knex('event_group').insert({
                Name: 'Süper Lig Takımları',
                CategoryID: eventCategoryId,
                Status: '1'
            }).returning('ID');

            eventGroupId = eventGroup;
            console.log('Süper Lig Takımları grubu eklendi, ID:', eventGroupId);
        } else {
            eventGroupId = eventGroupExists.ID;
            console.log('Süper Lig Takımları grubu zaten mevcut, ID:', eventGroupId);
        }

        // 6. Futbol Bahis Türleri Kategorisini Ekle
        let footballEventsId;
        const footballEventsExists = await knex('event_category').where('Name', 'Futbol Bahis Türleri').first();

        if (!footballEventsExists) {
            const [footballEvents] = await knex('event_category').insert({
                Name: 'Futbol Bahis Türleri'
            }).returning('ID');

            footballEventsId = footballEvents;
            console.log('Futbol Bahis Türleri kategorisi eklendi, ID:', footballEventsId);
        } else {
            footballEventsId = footballEventsExists.ID;
            console.log('Futbol Bahis Türleri kategorisi zaten mevcut, ID:', footballEventsId);
        }

        // 7. Bahis Türleri için Event Group'ları ekle
        const betTypeGroups = [
            'Maç Sonucu', 'İlk Yarı/Maç Sonucu', 'Toplam Gol',
            'Her İki Takım Gol', 'Handikap', 'Kornerler'
        ];

        for (const betTypeGroup of betTypeGroups) {
            const betTypeGroupExists = await knex('event_group').where('Name', betTypeGroup).first();
            let betTypeGroupId;

            if (!betTypeGroupExists) {
                const [newBetTypeGroup] = await knex('event_group').insert({
                    Name: betTypeGroup,
                    CategoryID: footballEventsId
                }).returning('ID');

                betTypeGroupId = newBetTypeGroup;
                console.log(`${betTypeGroup} bahis grubu eklendi, ID:`, betTypeGroupId);
            } else {
                betTypeGroupId = betTypeGroupExists.ID;
                console.log(`${betTypeGroup} bahis grubu zaten mevcut, ID:`, betTypeGroupId);
            }

            // 8. Her bahis türü için seçenekleri ekle
            if (betTypeGroup === 'Maç Sonucu') {
                const betOptions = ['1', 'X', '2'];

                for (const option of betOptions) {
                    const optionExists = await knex('events').where({
                        Name: option,
                        EventGroupID: betTypeGroupId
                    }).first();

                    if (!optionExists) {
                        const [newOption] = await knex('events').insert({
                            Name: option,
                            EventCategoryID: footballEventsId,
                            EventGroupID: betTypeGroupId
                        }).returning('ID');

                        console.log(`Maç Sonucu - ${option} seçeneği eklendi, ID:`, newOption);
                    } else {
                        console.log(`Maç Sonucu - ${option} seçeneği zaten mevcut, ID:`, optionExists.ID);
                    }
                }
            } else if (betTypeGroup === 'İlk Yarı/Maç Sonucu') {
                const betOptions = ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2'];

                for (const option of betOptions) {
                    const optionExists = await knex('events').where({
                        Name: option,
                        EventGroupID: betTypeGroupId
                    }).first();

                    if (!optionExists) {
                        const [newOption] = await knex('events').insert({
                            Name: option,
                            EventCategoryID: footballEventsId,
                            EventGroupID: betTypeGroupId
                        }).returning('ID');

                        console.log(`İlk Yarı/Maç Sonucu - ${option} seçeneği eklendi, ID:`, newOption);
                    } else {
                        console.log(`İlk Yarı/Maç Sonucu - ${option} seçeneği zaten mevcut, ID:`, optionExists.ID);
                    }
                }
            } else if (betTypeGroup === 'Toplam Gol') {
                const betOptions = ['Alt 0.5', 'Üst 0.5', 'Alt 1.5', 'Üst 1.5', 'Alt 2.5', 'Üst 2.5', 'Alt 3.5', 'Üst 3.5', 'Alt 4.5', 'Üst 4.5'];

                for (const option of betOptions) {
                    const optionExists = await knex('events').where({
                        Name: option,
                        EventGroupID: betTypeGroupId
                    }).first();

                    if (!optionExists) {
                        const [newOption] = await knex('events').insert({
                            Name: option,
                            EventCategoryID: footballEventsId,
                            EventGroupID: betTypeGroupId
                        }).returning('ID');

                        console.log(`Toplam Gol - ${option} seçeneği eklendi, ID:`, newOption);
                    } else {
                        console.log(`Toplam Gol - ${option} seçeneği zaten mevcut, ID:`, optionExists.ID);
                    }
                }
            } else if (betTypeGroup === 'Her İki Takım Gol') {
                const betOptions = ['Var', 'Yok'];

                for (const option of betOptions) {
                    const optionExists = await knex('events').where({
                        Name: option,
                        EventGroupID: betTypeGroupId
                    }).first();

                    if (!optionExists) {
                        const [newOption] = await knex('events').insert({
                            Name: option,
                            EventCategoryID: footballEventsId,
                            EventGroupID: betTypeGroupId
                        }).returning('ID');

                        console.log(`Her İki Takım Gol - ${option} seçeneği eklendi, ID:`, newOption);
                    } else {
                        console.log(`Her İki Takım Gol - ${option} seçeneği zaten mevcut, ID:`, optionExists.ID);
                    }
                }
            }
        }

        // 9. Admin kullanıcısını Süper Lig ve Futbol sporuna bağla
        const dealerSportExists = await knex('dealer_sport').where({
            SportID: footballId,
            DealerID: adminId
        }).first();

        if (!dealerSportExists) {
            const [dealerSport] = await knex('dealer_sport').insert({
                SportID: footballId,
                DealerID: adminId,
                Status: '1'
            }).returning('ID');

            console.log('Admin kullanıcısı Futbol sporuna bağlandı, ID:', dealerSport);
        } else {
            console.log('Admin kullanıcısı zaten Futbol sporuna bağlı, ID:', dealerSportExists.ID);
        }

        const dealerChampExists = await knex('dealer_champ').where({
            ChampID: superLigId,
            DealerID: adminId
        }).first();

        if (!dealerChampExists) {
            const [dealerChamp] = await knex('dealer_champ').insert({
                ChampID: superLigId,
                DealerID: adminId,
                Status: '1'
            }).returning('ID');

            console.log('Admin kullanıcısı Süper Lig şampiyonasına bağlandı, ID:', dealerChamp);
        } else {
            console.log('Admin kullanıcısı zaten Süper Lig şampiyonasına bağlı, ID:', dealerChampExists.ID);
        }

        console.log('Tüm veriler başarıyla eklendi!');

    } catch (error) {
        console.error('Veri ekleme hatası:', error);
    }
};

// Veri ekleme işlemini çalıştır
// seedTurkishFootballData();

seedTurkishFootballData()
    .then(() => console.log('Veriler başarıyla eklendi!'))
    .catch(err => console.error('Hata:', err));