/*
 * Copyright (c) 2023 gematik GmbH
 * 
 * Licensed under the EUPL, Version 1.2 or – as soon they will be approved by
 * the European Commission - subsequent versions of the EUPL (the Licence);
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 * 
 *     https://joinup.ec.europa.eu/software/page/eupl
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 * 
 */

const querystring = require('querystring');
const { conf, envs } = require('./config');
const axios = require('axios');
const baseUtils = require('./util_helpers');
const randomstring = require('randomstring');

module.exports.buildOgrIdpServer = function buildOgrIdpServer(fastify, verifier, code_challenge) {
  fastify.get('/ogr-login', async (request, reply) => {
    const authUrl = `${process.env.AUTHZ_PATH}`;
    const _query = new URLSearchParams({
      client_id: `${process.env.OGR_CLIENT_ID}`,
      client_secret: baseUtils.CONSTANTS._CLIENT_SECRET,
      response_type: baseUtils.CONSTANTS._RESPONSE_TYPE,
      scope: baseUtils.CONSTANTS._SCOPE,
      login: baseUtils.CONSTANTS._LOGIN,
      authz_path: authUrl, // or `${process.env.AUTHZ_PATH}`
      redirect_uri: baseUtils.CONSTANTS._REDIRECT_URI,
      code_challenge: code_challenge,
      code_challenge_method: baseUtils.CONSTANTS._PKCE_METHOD,
    });

    request.log.info('Here WE GO. Redirect AUTHREQUEST WITH CODESTATUS = 307');

    reply.type(baseUtils.CONSTANTS._CONTENT_TYPE_HTML);
    reply.statusCode = 307; // eslint-disable-line no-param-reassign
    reply.headers('');
    // oidc.issuer.params

    request.log.info('params :' + _query);
    const redirect_url = baseUtils.CLIENT_HOST + '/authrequest?' + _query;
    console.log('redirect Url ' + redirect_url);
    reply.redirect(redirect_url);
  });

  fastify.post('/secure/ogr-profile', async function (req, reply) {
    if (req.body.code) {
      const tokenPath = conf.TOKEN_PATH; // `${process.env.TOKEN_PATH}`

      const session_code = randomstring.generate().toUpperCase();
      const clientSession = req.protocol + '://' + req.hostname;
      console.log('!clientSession ' + clientSession);
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', `${process.env.OGR_CLIENT_ID}`);
      params.append('code_verifier', verifier);
      params.append('code', req.body.code);
      params.append('redirect_uri', baseUtils.CONSTANTS._REDIRECT_URI);
      params.append('client_session_host', clientSession);
      params.append('client_session_state', session_code);

      const config = {
        headers: {
          Authorization: baseUtils.authorizationHeaderString,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent: baseUtils.getIdpHttpsAgent(),
      };
      try {
        const response = await axios.post(tokenPath, params, config);

        reply.send(response.data);
      } catch (e) {
        console.error('Error' + e.message);
        reply.status(401).send(e.message);
      }
    }
  });
  fastify.get('/secure/ogr-userinfo', async function (req, reply) {
    if (req.headers) {
      const config = {
        headers: {
          Authorization: req.headers.authorization,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent: baseUtils.getIdpHttpsAgent(),
      };
      try {
        let url = `${process.env.USER_INFO_PATH}`;
        const response = await axios.get(url, config);
        const userdata = response.data;
        const username = 'preferred_username';
        const sub = 'sub';
        delete userdata[username];
        delete userdata[sub];
        reply.send(userdata);
      } catch (e) {
        console.error('Error' + e.message);
        reply.status(401).send(e.message);
      }
    }
  });
};
