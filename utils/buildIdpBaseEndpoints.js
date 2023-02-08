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

const axios = require('axios');
const baseUtils = require('./util_helpers');
const jose = require('node-jose');
const base64url = require('base64url');

module.exports.accessTokenRequest = async (req, reply, verifier, flowType) => {
  if (req.body.code) {
    const { tokenKey, params } = await getRequestParameter(verifier, req, flowType);
    const config = getConfig(flowType);
    return getTokens(params, config, tokenKey, reply, flowType);
  }
};
module.exports.authorizationRequest = (code_challenge, request, reply, flowType) => {
  console.log('flowType ' + flowType);
  console.log('getClientId ' + getClientId(flowType));

  const _query = new URLSearchParams({
    client_id: getClientId(flowType), //`${process.env.CENTRAL_IDP_CLIENT_ID}`
    response_type: 'code',
    redirect_uri: getRedirectUri(flowType),
    state: baseUtils.createBase64UrlRandomBytes(),
    code_challenge: code_challenge,
    code_challenge_method: 'S256',
    scope: getScope(flowType),
    nonce: baseUtils.createBase64UrlRandomBytes(),
  });
  request.log.info('Here WE GO. Redirect AUTHREQUEST WITH CODESTATUS = 307 and flowtype:');
  reply.type(baseUtils.CONSTANTS._CONTENT_TYPE_HTML);
  reply.statusCode = 307;
  request.log.info('params :' + _query);

  const challengePath = 'challenge_path=' + getSignResponseEndpoint(flowType) + '?' + _query;
  const redirect_url = `${process.env.CLIENT_HOST}/authenticator?` + challengePath;
  console.log('redirect_url ' + redirect_url);
  reply.redirect(redirect_url);
};

async function getTokens(params, config, tokenKey, reply, flowType) {
  try {
    const response = await axios.post(getTokenEndpoint(flowType), params, config);
    const accessToken = await baseUtils.decryptTokenSymmetric(response.data['access_token'], tokenKey);
    const idToken = await baseUtils.decryptTokenSymmetric(response.data['id_token'], tokenKey);
    const expiresIn = response.data['expires_in'];
    reply.send({
      access_token: accessToken,
      id_token: idToken,
      expires_in: expiresIn,
    });
  } catch (e) {
    console.error('Error by call access Token : ', e);
    reply.status(401).send(e.message);
  }
}

async function getRequestParameter(verifier, req, flowType) {
  const rndTokenKey = jose.util.randomBytes(32);
  const tokenKey = base64url.encode(rndTokenKey);
  const keyVerifier = await baseUtils.buildKeyVerifier(verifier, tokenKey);
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('client_id', `${process.env.CENTRAL_IDP_CLIENT_ID}`);
  params.append('code_verifier', verifier);
  params.append('key_verifier', keyVerifier);
  params.append('code', req.body.code);
  params.append('redirect_uri', getRedirectUri(flowType));
  return { tokenKey: tokenKey, params };
}

function getTokenEndpoint(flowType) {
  switch (flowType) {
    case 'gem':
      return process.env.CENTRAL_IDP_TOKEN_ENDPOINT;
    case 'rise':
      return process.env.RISE_IDP_TOKEN_ENDPOINT;
  }
}

function getClientId(flowType) {
  switch (flowType) {
    case 'gem-HBA':
    case 'gem-SMC-B':
      return process.env.CENTRAL_IDP_CLIENT_ID;
    case 'rise-HBA':
    case 'rise-SMC-B':
      return process.env.RISE_IDP_CLIENT_ID;
  }
}

function getSignResponseEndpoint(flowType) {
  switch (flowType) {
    case 'gem-HBA':
    case 'gem-SMC-B':
      return process.env.CENTRAL_IDP_SIGN_RESPONSE_ENDPOINT;
    case 'rise-HBA':
    case 'rise-SMC-B':
      return process.env.RISE_IDP_SIGN_RESPONSE_ENDPOINT;
  }
}

function getRedirectUri(flowType) {
  switch (flowType) {
    case 'gem-HBA':
    case 'gem-SMC-B':
    case 'gem':
      return baseUtils.CONSTANTS._REDIRECT_URI;
    case 'rise-HBA':
    case 'rise-SMC-B':
    case 'rise':
      return process.env.RISE_REDIRECT_URI;
  }
}

function getScope(flowType) {
  switch (flowType) {
    case 'gem-HBA':
      return 'openid authenticator-dev Person_ID';
    case 'gem-SMC-B':
      return 'openid authenticator-dev Institutions_ID';
    case 'rise-HBA':
      return 'openid gem-auth Person_ID';
    case 'rise-SMC-B':
      return 'openid gem-auth Institutions_ID';
  }
}

function getConfig(flowType) {
  let config = {
    headers: {
      Authorization: baseUtils.authorizationHeaderString,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  switch (flowType) {
    case 'gem':
      break;
    case 'rise':
      config.httpsAgent = baseUtils.getIdpHttpsAgent();
      break;
  }
  return config;
}
