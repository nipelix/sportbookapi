require("dotenv").config();

const config = {
  baseUrl: process.env.BASE_URL,
  source: process.env.SOURCE,
  database: {
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: process.env.DB_CHARSET,
    },
  },
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY,
    base: {
      algorithm: process.env.JWT_BASE_ALGORITHM,
      expiresIn: process.env.JWT_BASE_EXPIRES,
      issuer: process.env.JWT_BASE_ISSUER,
      audience: process.env.JWT_BASE_AUDIENCE,
    },
    refresh: {
      algorithm: process.env.JWT_REFRESH_ALGORITHM,
      expiresIn: process.env.JWT_REFRESH_EXPIRES,
      issuer: process.env.JWT_REFRESH_ISSUER,
      audience: process.env.JWT_REFRESH_AUDIENCE,
    },
  },
};

module.exports = config;
