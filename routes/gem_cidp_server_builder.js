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

const buildBaseEndpoints = require('../utils/buildIdpBaseEndpoints');

/**
 *
 * @param {'rise' | 'gem'>} urlPrefix
 * @param fastify
 * @param verifier
 * @param code_challenge
 */
module.exports.registerIdpEndpoints = (routePrefix, fastify, verifier, code_challenge) => {
  fastify.get(`/${routePrefix}-cidp-login-HBA`, async (request, reply) => {
    buildBaseEndpoints.authorizationRequest(code_challenge, request, reply, `${routePrefix}-HBA`);
  });

  fastify.get(`/${routePrefix}-cidp-login-SMC-B`, async (request, reply) => {
    buildBaseEndpoints.authorizationRequest(code_challenge, request, reply, `${routePrefix}-SMC-B`);
  });

  fastify.post(`/secure/${routePrefix}-cidp-profile`, async function (req, reply) {
    await buildBaseEndpoints.accessTokenRequest(req, reply, verifier, routePrefix);
  });
};
