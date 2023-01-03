'use strict';
const fetch = require('isomorphic-fetch');
const jwt   = require('jsonwebtoken');

const {
  clientId,
  clientSecret,
  audience,
  domain,
  picture
} = require('./config');

const getAccessToken = async (username, password) => {
  const options = getOptionsForGetAccessToken(username, password);

  const responseFromOauth = await fetch(options.url, options);
  const { status, statusText } = responseFromOauth;
  if (responseFromOauth.status !== 200) throw new Error(`Error while receiving token: ${status} ${statusText}`);

  const response = JSON.parse(await responseFromOauth.text());
  return {
    accessToken : response.access_token,
    expiresIn   : response.expires_in,
    refreshToken: response.refresh_token,
  };
};

const refreshToken = async (refreshToken) => {
  const options = getOptionsForTokenByRefresh(refreshToken);

  const responseFromOauth = await fetch(options.url, options);
  const { status, statusText } = responseFromOauth;
  if (responseFromOauth.status !== 200) throw new Error(`Error while refreshing token: ${status} ${statusText}`);
  
  const response = JSON.parse(await responseFromOauth.text());
  return {
    accessToken: response.access_token,
    expiresIn: response.expires_in,
  };
};

const createUser = async (data) => {
  const tokenOptions = getOptionsForGetToken();
  const tokenResponseFromOauth = await fetch(tokenOptions.url, tokenOptions);
  const { status : tokenStatus, statusText : tokenStatusText  } = tokenResponseFromOauth;
  if (tokenResponseFromOauth.status !== 200) throw new Error(`Error while getting token: ${tokenStatus} ${tokenStatusText}`);
  
  const { access_token } = JSON.parse(await tokenResponseFromOauth.text());
  const authorizationHeader = `Bearer ${access_token}`;

  const { name, surname, login, password } = data;
  const createUserOptions = getOptionsForGetUser(name, surname, login, password);

  const options = getOptionsForCreateUser(authorizationHeader, createUserOptions);
  const responseFromOauth = await fetch(options.url, options);

  const { status, statusText } = responseFromOauth;
  if (status !== 201) throw new Error(`Error while creating user: ${status} ${statusText}`);

  const response = JSON.parse(await responseFromOauth.text());
  return response;
};

const getUserById = async (userId) => {
  const options = getOptionsForGetToken();
  const tokenResponseFromOauth = await fetch(options.url, options);
  const { status : tokenStatus, statusText : tokenStatusText  } = tokenResponseFromOauth;
  if (tokenResponseFromOauth.status !== 200) throw new Error(` while getting token: ${tokenStatus} ${tokenStatusText}`);
  
  const { access_token } = JSON.parse(await tokenResponseFromOauth.text());
  const authorizationHeader = `Bearer ${access_token}`;

  const getUserOptions = getOptionsForGetUserById(authorizationHeader, userId);

  const userResponse = await fetch(getUserOptions.url, {
    authorizationHeader,
    ...getUserOptions,
  });
  const { status, statusText } = userResponse;
  if (userResponse.status !== 200) throw new Error(` while getting user: ${status} ${statusText}`);

  const response = JSON.parse(await userResponse.text());

  return response;
};

const getPayloadFromToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

const getOptionsForGetToken = () => ({
    method: 'POST',
    url: `https://${domain}/oauth/token`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience
    }),
});

const getOptionsForGetAccessToken = (username, password) => ({
    method: 'POST',
    url: `https://${domain}/oauth/token`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      realm : 'Username-Password-Authentication',
      scope: 'offline_access',
      username: username,
      password: password,
      client_id: clientId,
      client_secret: clientSecret,
      audience
    }),
});

const getOptionsForCreateUser = (authorization, user) => ({
    method: 'POST',
    url: `https://${domain}/api/v2/users`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify(user)
});

const getOptionsForGetUser = (name, surname, login, password) => ({
    email: login,
    user_metadata: {},
    blocked: false,
    email_verified: false,
    app_metadata: {},
    given_name: name,
    family_name: surname,
    name: `${name} ${surname}`,
    picture,
    connection: 'Username-Password-Authentication',
    password,
    verify_email: false,
});

const getOptionsForTokenByRefresh = (refreshToken) => ({
    method: 'POST',
    url: `https://${domain}/oauth/token`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken
    }),
  });

const getOptionsForGetUserById = (authorization, userId) => ({
    method: 'GET',
    url: `https://${domain}/api/v2/users/${userId}`,
    headers: {
      Authorization: authorization,
    },
});

module.exports = {
  getAccessToken,
  refreshToken,
  createUser,
  getUserById,
  getPayloadFromToken,
  getOptionsForCreateUser,
  getOptionsForGetToken,
  getOptionsForGetUser,
  getOptionsForGetUserById,
  getOptionsForGetAccessToken,
  getOptionsForTokenByRefresh
};
