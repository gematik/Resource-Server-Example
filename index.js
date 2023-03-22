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
const {envs} = require('./utils/config');
const baseUtils = require('./utils/util_helpers');
const fastify = require('fastify')({logger: true});
const {registerIdpEndpoints} = require('./routes/gem_cidp_server_builder');
const fastifySession = require('@fastify/session');
const fastifyCookie = require('@fastify/cookie');
const {registerTokenDeliveryEndpoints} = require('./routes/token-delivery');

fastify.register(fastifyCookie, {});
fastify.register(fastifySession, {
    cookie: {
        secure: false,
        expires: Date.now() + 10000000000,
    },
    secret: 'cNaoPYAwF60HZJzkcNaoPYAwF60HZJzk',
});


async function buildServer() {
    await fastify.register(require('fastify-express'));
    fastify.register(require('@fastify/cors'), {
        origin: true, // should be restricted for specific domain(s)!
        methods: ['*'],
        credentials: true, // this is important! This allows us to call from another domain.
    });
    
    const codeVerifier = baseUtils.createBase64UrlRandomBytes();

    const code_challenge = baseUtils.code_challenge(codeVerifier);

    registerTokenDeliveryEndpoints(fastify);

    registerIdpEndpoints('gem', fastify, codeVerifier, code_challenge);

    registerIdpEndpoints('rise', fastify, codeVerifier, code_challenge);

    fastify.get('/', async () => {
        return {environment: process.env.NODE_ENV, ...envs};
    });


    return fastify;
}

const start = async () => {
    const port = 3500;
    const host = '0.0.0.0';
    const server = await buildServer();
    try {
        await server.listen({port, host});
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
