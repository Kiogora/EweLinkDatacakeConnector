import eWeLink from 'ewelink-api-next'

// https://dev.ewelink.cc/
// Login
// Apply to become a developer
// Create an application

const config = {
  appId: '1MtaueqRXzKNSPBQIrN3T5OYa8PTWNUo', // App ID, which needs to be configured in the eWeLink open platform
  appSecret: '7uHCQADAzH7gtDNVM2XBqtboaxQjOrnv', // App Secret, which needs to be configured in the eWeLink open platform
  region: 'eu', //Feel free, it will be automatically updated after login
  //requestRecord: true, // Request record, default is false
  //logObj: console, // Log object, default is console
}

if (!config.appId || !config.appSecret) {
  throw new Error('Please configure appId and appSecret')
}

export const client = new eWeLink.WebAPI(config)
export const wsClient = new eWeLink.Ws(config)

export const redirectUrl = 'http://127.0.0.1:8000/redirectUrl' // Redirect URL, which needs to be configured in the eWeLeLink open platform

// Generate random strings
export const randomString = (length) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const maxPos = chars.length
  let pwd = ''
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}
