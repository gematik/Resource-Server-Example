/*
 * Copyright 2023 gematik GmbH
 *
 * The Authenticator App is licensed under the European Union Public Licence (EUPL); every use of the Authenticator App
 * Sourcecode must be in compliance with the EUPL.
 *
 * You will find more details about the EUPL here: https://joinup.ec.europa.eu/collection/eupl
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the EUPL is distributed on an "AS
 * IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the EUPL for the specific
 * language governing permissions and limitations under the License.ee the Licence for the specific language governing
 * permissions and limitations under the Licence.
 */

const axios = require('axios');
const baseUtils = require('./util_helpers');
const jose = require('node-jose');
const base64url = require('base64url');

module.exports.accessTokenRequest = async (req, reply, verifier, flowType) => {
    if (req.body.code) {
        const {tokenKey, params} = await getRequestParameter(verifier, req, flowType);
        const config = getConfig(flowType);
        return getTokens(params, config, tokenKey, reply, flowType);
    }
};
module.exports.authorizationRequest = (code_challenge, request, reply, flowType) => {
    console.log('flowType ' + flowType);
    console.log('getClientId ' + getClientId(flowType));

    const _query = new URLSearchParams({
        client_id: getClientId(flowType), //`${process.env.GEMATIK_REF_IDP_SERVER_CLIENT_ID}`
        response_type: 'code',
        redirect_uri: getRedirectUri(flowType),
    state: baseUtils.createBase64UrlRandomBytes(16),
        code_challenge: code_challenge,
        code_challenge_method: 'S256',
        scope: getScope(flowType),
    nonce: baseUtils.createBase64UrlRandomBytes(16),
    });

  // if redirect_automatically exists in request.query, add it to _query
  if (request.query.redirect_automatically) {
    _query.append('redirect_automatically', request.query.redirect_automatically);
  }

  request.log.info('Here WE GO. Redirect AUTH-REQUEST WITH CODESTATUS = 307 and flowtype:');
    reply.type(baseUtils.CONSTANTS._CONTENT_TYPE_HTML);
    reply.statusCode = 307;
    request.log.info('params :' + _query);

    const challengePath = 'challenge_path=' + getSignResponseEndpoint(flowType) + '?' + _query;
  const clientHost = new URL(request.headers.referer).origin;
  const redirect_url = `${clientHost}/authenticator?` + challengePath;
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
    params.append('client_id', `${process.env.GEMATIK_REF_IDP_SERVER_CLIENT_ID}`);
    params.append('code_verifier', verifier);
    params.append('key_verifier', keyVerifier);
    params.append('code', req.body.code);
    params.append('redirect_uri', getRedirectUri(flowType));
    return {tokenKey: tokenKey, params};
}

function getTokenEndpoint(flowType) {
    switch (flowType) {
        case 'gem':
            return process.env.GEMATIK_REF_IDP_SERVER_TOKEN_ENDPOINT;
        case 'rise':
            return process.env.CENTRAL_IDP_SERVER_TOKEN_ENDPOINT;
    }
}

function getClientId(flowType) {
    switch (flowType) {
        case 'gem-HBA':
        case 'gem-SMC-B':
            return process.env.GEMATIK_REF_IDP_SERVER_CLIENT_ID;
        case 'rise-HBA':
        case 'rise-SMC-B':
            return process.env.CENTRAL_IDP_SERVER_CLIENT_ID;
    }
}

function getSignResponseEndpoint(flowType) {
    switch (flowType) {
        case 'gem-HBA':
        case 'gem-SMC-B':
            return process.env.GEMATIK_REF_IDP_SERVER_AUTH_ENDPOINT;
        case 'rise-HBA':
        case 'rise-SMC-B':
            return process.env.CENTRAL_IDP_SERVER_AUTH_ENDPOINT;
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
            return process.env.CENTRAL_IDP_SERVER_REDIRECT_URI;
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
