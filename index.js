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
const { conf, envs } = require('./utils/config');
const API_URL = conf.API_URL;
const axios = require('axios');
const baseUtils = require('./utils/util_helpers');
const randomstring = require('randomstring');
const fastify = require('fastify')({ logger: true });
const fastifySession = require('fastify-session');
const fastifyCookie = require('fastify-cookie');
const jose = require('node-jose');
const { Provider } = require('oidc-provider');
const base64url = require('base64url');
const { buildRiseCentralIdpServer } = require('./utils/rise_cidp_server_builder');
const { buildOgrIdpServer } = require('./utils/ogr_idp_server_builder');
const { buildGemCentralIdpEndpoints } = require('./utils/gem_cidp_server_builder');


fastify.register(fastifyCookie);
fastify.register(fastifySession, {secret: 'a secret with minimum length of 32 characters'});
async function buildServer() {
  await fastify.register(require('fastify-express'));
  fastify.register(require('fastify-cors'), {
    origin: '*',
    methods: ['*'],
  });

  const kcConfigUrl = require('./utils/configuration');

  const oidc = new Provider(conf.ISSUER, kcConfigUrl);

  const codeVerifier = baseUtils.createBase64UrlRandomBytes();

  const code_challenge = baseUtils.code_challenge(codeVerifier);

  buildGemCentralIdpEndpoints(fastify, codeVerifier, code_challenge);

  buildOgrIdpServer(fastify, codeVerifier, code_challenge);

  buildRiseCentralIdpServer(fastify, codeVerifier, code_challenge);

  fastify.post('/refresh_token', async () => {});

  fastify.get('/', async () => {
    return { environment: process.env.NODE_ENV, ...envs };
  });

  oidc.callback();
  return fastify;
}

const start = async () => {
  const port = 3500;
  const host = '0.0.0.0';
  const server = await buildServer();
  try {
    await server.listen(port, host);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
