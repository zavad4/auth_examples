// module.exports = {
//   port: process.env.PORT || 3001,
//   sessionKey: 'Authorization',
//   domain: process.env.DOMAIN || 'kpi.eu.auth0.com',
//   clientId: process.env.CLIENT_ID || 'JIvCO5c2IBHlAe2patn6l6q5H35qxti0',
//   clientSecret: process.env.CLIENT_SECRET || 'ZRF8Op0tWM36p1_hxXTU-B0K_Gq_-eAVtlrQpY24CasYiDmcXBhNS6IJMNcz1EgB',
//   audience: process.env.AUDIENCE || 'https://kpi.eu.auth0.com/api/v2/',
//   picture:
//     'https://s.gravatar.com/avatar/cba1f2d695a5ca39ee6f343297a761a4?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fus.png',
//   localTokenPath: `${__dirname}/tokenStorage.json`,
//   refreshTokenViaTimeSec: 300,
// };

module.exports = {
  ngrok : '1d74-2a02-2f0e-10a-c900-8733-e6a2-27f4-ebd8.eu.ngrok.io',
  port: process.env.PORT || 3001,
  sessionKey: 'authorization',
  domain: process.env.DOMAIN || 'dev-16c1prnwuitnbhf7.eu.auth0.com',
  clientId: process.env.CLIENT_ID || 'HrBUC7PDPsYy0W3nlLcBwSBtfgdWWcAX',
  clientSecret: process.env.CLIENT_SECRET || '7DoLVUviKy4HlPNV-Czd8oKCpbERo2Rmqi4ytX9D9mQg-hHFiwVCHCRYQjmjNteo',
  audience: process.env.AUDIENCE || 'https://dev-16c1prnwuitnbhf7.eu.auth0.com/api/v2/',
  picture:
    'https://s.gravatar.com/avatar/cba1f2d695a5ca39ee6f343297a761a4?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fus.png',
  localTokenPath: `${__dirname}/tokenStorage.json`,
  refreshTokenViaTimeSec: 300,
};