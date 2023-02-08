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

const crypto = require('crypto');
const base64url = require('base64url');
const fs = require('fs');
const path = require('path');
const https = require('https');
const JWK = require('node-jose/lib/jwk');
const JWE = require('node-jose/lib/jwe');
const createJwe = require('./JWE-Creator');

const state = Math.random().toString().replace('0.', '');
const none = Math.random().toString().replace('0.', '');

const IDP_CERTIFICATES_PATH = 'resources/certs-idp';

module.exports.CONSTANTS = {
  _CLIENT_ID: 'oidc_rp_ogranwendung',
  _CLIENT_SECRET: 'f5dff7e3-daa9-4839-b9c0-61c0669e366f',
  _REDIRECT_URI: `${process.env.CLIENT_HOST}/callback`,
  _REDIRECT_URI_TOKEN: `${process.env.CLIENT_HOST}/token`,
  _PKCE_METHOD: 'S256',
  _SCOPE: 'openid',
  _RESPONSE_TYPE: 'code',
  _GRANT_TYPE: 'authorization_code',
  _LOGIN: true,
  _NONCE: none,
  _STATE: state,
  _CONTENT_TYPE_JSON: 'application/json',
  _CONTENT_TYPE_HTML: 'text/html,application/xhtml+xml,application/xml;charset=utf-8',
  _CONTENT_TYPE_HTML_TOKEN: 'application/x-www-form-urlencoded',
  // RSASSA-PSS using SHA-256 and MGF1 with SHA-256
  _ENCODING_UTF8: 'utf-8',
  // RSASSA-PKCS1-v1_5 using SHA-256
  _ENCRYPT_ALG_SHA256: 'SHA-256',
  _ENCODING_BASE64: 'base64',
};

module.exports.createBase64UrlRandomBytes = function createCodeVerifier() {
  return base64url.encode(crypto.randomBytes(32));
};

module.exports.code_challenge = function createCodeChallenge(codeVerifier) {
  const base64Digest = crypto.createHash('sha256').update(codeVerifier).digest('base64');

  return base64url.fromBase64(base64Digest);
};

module.exports.authorize_code = Buffer.from(
  `${this.CONSTANTS._CLIENT_ID}:${this.CONSTANTS._CLIENT_SECRET}`,
  this.CONSTANTS._ENCODING_UTF8,
).toString(this.CONSTANTS._ENCODING_BASE64);

module.exports.authorizationHeaderString = `Basic ${this.authorize_code}`;

module.exports.CLIENT_HOST = process.env.CLIENT_HOST;

/**
 * readdirSync throws error, this function logs error and returns empty array in error case
 * @param directoryPath
 */
const readDirectory = (directoryPath) => {
  try {
    return fs.readdirSync(directoryPath);
  } catch (e) {
    console.error(`Directory could not be found: ${directoryPath}`);
    return [];
  }
};

/**
 *
 * @return {module:https.Agent|*[]}
 */
module.exports.getIdpHttpsAgent = () => {
  try {
    const directoryPath = path.join(process.cwd(), IDP_CERTIFICATES_PATH);
    return new https.Agent({
      ca: readDirectory(directoryPath).map((fileName) => fs.readFileSync(path.join(directoryPath, fileName))),
    });
  } catch (e) {
    console.error(e.message);
  }
};

module.exports.decryptTokenSymmetric = async function decryptTokenSymmetric(tokenJwe, tokenkey) {
  let key = {
    kty: 'oct',
    kid: 'accesstoken-decryption-test',
    k: tokenkey,
    alg: 'A256GCM',
  };
  console.log('tokenKey: ' + tokenkey);
  key = await JWK.asKey(key);
  const arrayBuffer = await JWE.createDecrypt(key).decrypt(tokenJwe);
  const message = Buffer.from(arrayBuffer.plaintext).toString();
  const token = JSON.parse(message)['njwt'];
  return token;
};

module.exports.buildKeyVerifier = async function buildKeyVerifier(codeVerifier, tokenkey) {
  const keyVerifier = {
    token_key: tokenkey,
    code_verifier: codeVerifier,
  };
  const keyVerifierJson = JSON.stringify(keyVerifier);
  const keyVerifier_jwe = await createJwe(keyVerifierJson);
  return keyVerifier_jwe;
};
