module.exports = {
    secret : process.env.JWT_SECRET || 'secret',

    algorithm: process.env.JWT_ALGORITHM || 'HS256',

    ttl: process.env.ACCESS_TOKEN_TTL || '1h',

    refresh_ttl: process.env.REFRESH_TOKEN_TTL || '7d',

    issuer: process.env.JWT_ISSUER || 'NodeJS Project'
}
