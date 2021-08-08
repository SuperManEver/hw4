const Redis = require('ioredis')

const { REDIS_URL } = require('../config')

const KEY_TTL_IN_SECONDS = 86_400 // one day

class Cache {
  constructor() {
    this.redis = new Redis(REDIS_URL, { keyPrefix: 'refresh-token:' })
  }

  async set(key, value) {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', KEY_TTL_IN_SECONDS)
    } catch (err) {
      console.error('Cache.set() ', err)
    }
  }

  async get(key) {
    try {
      const value = await this.redis.get(key)

      return (value && JSON.parse(value)) || {}
    } catch (err) {
      console.error('Cache.get()', err)
    }
  }
}

module.exports = new Cache()
