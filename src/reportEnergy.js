import * as fs from 'fs'
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { client, wsClient,} from './config.js'

let energyUpdateIntervalTimer;
const datacakePostEndpoint = 'https://api.datacake.co/integrations/api/7a872e0a-a389-4c1c-a712-a2e6a673a07b/'
const energyDevices = ["10017fac7d", "10017fada6", '10017fad19', '10017fae2b', "10017fa888", "1001874899", "10017fa721", "10017fac15"
];
const ewelinkWsConnectionOptions = {
  appId: wsClient?.appId || "",
  region: "eu"
}

const onError = undefined;

const onOpen = (ws) => {
  energyDevices.map(energyDevice => {wsClient.Connect.updateState(energyDevice, {"uiActive":65}, "update", "app", ewelinkWsConnectionOptions?.userApiKey)});
  energyUpdateIntervalTimer = setInterval(() => {
      energyDevices.map(energyDevice => {setTimeout(() => {wsClient.Connect.updateState(energyDevice, {"uiActive":65}, "update", "app", ewelinkWsConnectionOptions?.userApiKey)}, 550)})}, 50000);
};

const onClose  = () => {
  clearInterval(energyUpdateIntervalTimer);
};

const onMessage = async (ws, message) => {
  try{
    const data = JSON.parse(message.data);
    //console.log(data)
    if (data.params?.monthKwh){
      const response = await axios.post(datacakePostEndpoint, {
        time: Math.floor(new Date().getTime() / 1000),
        deviceId: data.deviceid,
        data: data.params
      })
      console.log(`Sent to datacake ${response.config.data}`);
    }
  } catch(e){
    //console.log(e);
  }
};

processTokenJsonFile();
axiosRetry(axios, { retries: 3, retryDelay: 500 });

try {
  let family = await client.home.getFamily();
  client.userApiKey = family.data.familyList[0].apikey;

  ewelinkWsConnectionOptions.at = client.at;
  ewelinkWsConnectionOptions.userApiKey = client.userApiKey;

  await wsClient.Connect.create(ewelinkWsConnectionOptions, onOpen, onClose, onError, onMessage);
} catch (e) {
  console.log(e)
}


async function processTokenJsonFile(){
  // If the file does not exist, directly report an error
  if (!fs.existsSync('./token.json')) {
    throw new Error('token.json not found, please run login.js first')
  }

  // get token
  let LoggedInfo = JSON.parse(fs.readFileSync('./token.json', 'utf-8'))
  // console.info(LoggedInfo)
  client.at = LoggedInfo.data?.accessToken
  client.region = LoggedInfo?.region || 'eu'
  client.setUrl(LoggedInfo?.region || 'eu')
  // Check if the token has expired, and refresh the token if it has expired
  if (
    LoggedInfo.data?.atExpiredTime < Date.now() &&
    LoggedInfo.data?.rtExpiredTime > Date.now()
  ) {
    console.log('Token expired, refreshing token')
    const refreshStatus = await client.user.refreshToken({
      rt: LoggedInfo.data?.refreshToken,
    })
    console.log(refreshStatus)
    if (refreshStatus.error === 0) {
      // You can also use built-in storage
      // client.storage.set('token', {...})
      fs.writeFileSync(
        './token.json',
        JSON.stringify({
          status: 200,
          responseTime: 0,
          error: 0,
          msg: '',
          data: {
            accessToken: refreshStatus?.data?.at,
            atExpiredTime: Date.now() + 2592000000,
            refreshToken: refreshStatus?.data?.rt,
            rtExpiredTime: Date.now() + 5184000000,
          },
          region: client.region,
        })
      )
      LoggedInfo = JSON.parse(fs.readFileSync('./token.json', 'utf-8'))
    }
  }

  if (LoggedInfo.data?.rtExpiredTime < Date.now()) {
    console.log('Failed to refresh token, need to log in again to obtain token')
    return
  }
}
