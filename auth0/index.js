'use strict';
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
// const { expressjwt: expressJwt } = require('express-jwt');
// const jwksRsa = require('jwks-rsa');
const jwt               = require('jsonwebtoken');
const config       = require('./config');
// const tokenStorage = require('./tokenStorage');
const utils        = require('./utils');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const SESSION_KEY = config.sessionKey;

class TokenStorage {
    #tokens = {}

    constructor() {
        try {
            this.#tokens = fs.readFileSync('./tokenStorage.json', 'utf8');
            this.#tokens = JSON.parse(this.#tokens.trim());

        } catch(e) {
            this.#tokens = {};
        }
    }

    #storeTokens() {
        fs.writeFileSync('./tokenStorage.json', JSON.stringify(this.#tokens), 'utf-8');
    }

    set(key, value) {
        if (!value) {
            value = {};
        }
        this.#tokens[key] = value;
        this.#storeTokens();
    }

    get(key) {
        return this.#tokens[key];
    }

    destroyByKey(key) {
        delete this.#tokens[key];
        this.#storeTokens();
    }
}

const tokenStorage = new TokenStorage();

const checkSession = async (req, res, next) => {
    const authorizationHeader = req.get(SESSION_KEY);
    if (!authorizationHeader) return next();
    const accessToken = authorizationHeader.split(' ')[1];
    const payload = utils.getPayloadFromToken(accessToken);
    if (payload) {
      req.userId = payload.sub;
    } else {
      console.log('Invalid authorization header');
    }
  
    next();
}

app.use(checkSession);

async function checkToken(req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        const [, token] = authorizationHeader?.split(' '); 
        const decoded = jwt.decode(token);

        next();
    } catch (error) {
        console.group(error);
        throw new Error('Invalid JWT');
    }
}
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/userinfo', checkToken, async (req, res) => {
    if (req.userId) {
      const userData = await utils.getUserById(req.userId);
  
      return res.json({
        username: `${userData.name}(${userData.email})`,
        logout: 'http://localhost:3000/logout',
      });
    }
  
    res.status(401).send();
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname + '/register.html'));
});

app.get('/logout', async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(httpConstants.codes.UNAUTHORIZED).send();
    }

    console.log(`User with id ${userId} successfully logout`);
    await tokenStorage.destroyByKey(userId);
    res.clearCookie('refreshToken');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(httpConstants.codes.INTERNAL_SERVER_ERROR).send();
  }
});

app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const { accessToken, expiresIn, refreshToken } = await utils.getAccessToken(login, password);

    const payload  = utils.getPayloadFromToken(accessToken);
    const { sub: userId } = payload;
    tokenStorage.set(userId, { refreshToken });

    console.log(`User with id ${userId} succesfully login. Refresh token: ${refreshToken}`);
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.json({
      token: accessToken,
      expiresDate: Date.now() + expiresIn * 1000
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

app.get('/api/refresh', async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) return res.status(httpConstants.codes.UNAUTHORIZED).send();

    const { refreshToken } = req.cookies;
    const { refreshToken: refreshTokenFromDb } = tokenStorage.get(userId);
    if (refreshToken === refreshTokenFromDb) {
      const { accessToken, expiresIn } = await utils.refreshToken(refreshToken);
      console.log(`Refresh token for user ${req.userId}`);
      res.json({
        token: accessToken,
        expiresDate: Date.now() + expiresIn * 1000,
      });
    }

    res.status(401).send();
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const userData = req.body;
    const user = await utils.createUser(userData);

    console.log(`User with (${user.email}) successfully registered. Id ${user.user_id} `);
    res.json({ redirect: '/' });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

app.listen(config.port, () => {
  console.log(`Example app listening on port ${config.port}`);
});