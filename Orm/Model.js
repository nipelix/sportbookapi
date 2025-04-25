const System = require("./model/System");
const Sports = require("./model/Sports");
const Champs = require("./model/Champs");
const Statics = require("./model/Statics");
const Coupon = require("./model/Coupon");
const { Event, Category, Group} = require("./model/Event");


(async () => {
    try {
        await System.Language.create_table();
        await System.User.create_table();

        await Sports.Sport.create_table();
        await Sports.Meta.create_table();
        await Sports.Dealer.create_table();
        await Sports.Mapping.create_table();

        await Champs.Champ.create_table();
        await Champs.Meta.create_table();
        await Champs.Dealer.create_table();
        await Champs.Mapping.create_table();

        await Category.Category.create_table();
        await Category.Meta.create_table();

        await Group.Group.create_table();
        await Group.Meta.create_table();
        await Group.Dealer.create_table();

        await Event.Event.create_table();
        await Event.Meta.create_table();
        await Event.Mapping.create_table();

        await Statics.Base.create_table();
        await Statics.Meta.create_table();
        await Statics.Mapping.create_table();

        await Coupon.Coupon.create_table();
        await Coupon.Event.create_table();


        await System.Favorite.create_table();
        console.log("Tüm tablolar başarıyla oluşturuldu");
    } catch (error) {
        console.error("Tablo oluşturma hatası:", error);
    }
})();

module.exports = {
     Language:System.Language,
     User:System.User,
     Favorite:System.Favorite,

     Sport:Sports.Sport,
     SportMeta:Sports.Meta,
     SportDealer:Sports.Dealer,
     SportMapping:Sports.Mapping,

     Champ:Champs.Champ,
     ChampMeta:Champs.Meta,
     ChampDealer:Champs.Dealer,
     ChampMapping:Champs.Mapping,

     Category:Category.Category,
     CategoryMeta:Category.Meta,

     Group:Group.Group,
     GroupMeta:Group.Meta,
     GroupDealer:Group.Dealer,

     Event:Event.Event,
     EventMeta:Event.Meta,
     EventMapping:Event.Mapping,

     Statics: Statics.Base,
     StaticsMeta: Statics.Meta,
     StaticsMapping: Statics.Mapping,

     Coupon:Coupon.Coupon,
     CouponEvent:Coupon.Event,
};