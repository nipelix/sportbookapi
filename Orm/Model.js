const Sport = require("./model/Sport");
const Champ = require("./model/Champ");
const Country = require("./model/Country");
const ChampMapping = require("./model/ChampMapping");
const SportMapping = require("./model/SportMapping");
const DealerSport = require("./model/DealerSport");
const DealerChamp = require("./model/DealerChamp");
const DealerCountry = require("./model/DealerCountry");
const Event = require("./model/Event");
const EventCategory = require("./model/EventCategory");
const EventGroup = require("./model/EventGroup");
const EventMapping = require("./model/EventMapping");
const DealerEvent = require("./model/DealerEvent");
const User = require("./model/User");
const Favorite = require("./model/Favorite");

(async () => {
    try {
        await Country.create_table();
        await Sport.create_table();
        await Champ.create_table();
        await User.create_table();
        await SportMapping.create_table();
        await ChampMapping.create_table();
        await DealerSport.create_table();
        await DealerChamp.create_table();
        await DealerCountry.create_table();
        await EventCategory.create_table();
        await EventGroup.create_table();
        await DealerEvent.create_table();
        await Event.create_table();
        await EventMapping.create_table();
        await Favorite.create_table();
        console.log("Tüm tablolar başarıyla oluşturuldu");
    } catch (error) {
        console.error("Tablo oluşturma hatası:", error);
    }
})();

module.exports = {
    Sport,
    Champ,
    Country,
    ChampMapping,
    SportMapping,
    DealerSport,
    DealerChamp,
    DealerCountry,
    Event,
    EventCategory,
    EventGroup,
    DealerEvent,
    EventMapping,
    User,
    Favorite
};