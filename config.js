const config = {
    baseUrl: 'http://148.251.53.243:3001/',
    database: {
        client: 'mysql',
        connection: {
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'sport_book',
            charset  : 'utf8'
        }
    },
    jwt: {
        privateKey: "MIIJJgIBAAKCAgBZ2NZWmbcJPPyH_Kmz60tina6h5UqQggq1VBzxXNkB2LURGXcOwsExB4Q8GRcc_PuPgI2hbtXdGFg0hPVi!yzAuJRpQxdjMlEKR2_X1fKBpGdz0QTmqSLuyJwdqFavRbBgOdrdNN78kIlEDalzznKlyQfNyYUc3zmvinAhhjM?w1JXqzWwIw8AnjPxmd62268juVwb!foJGH8JLwpp1WpN1vu1wxFmnKds7DG94dOWgR1Fxj0XNH",
        base: {
            algorithm: 'HS256',
            expiresIn: '1d',
            issuer: 'Sinek2',
            audience: 'sinek2'
        },
        refresh:{
            algorithm: 'HS256',
            expiresIn: '7d',
            issuer: 'Sinek2',
            audience: 'sinek2'
        }
    }
}
module.exports = config;