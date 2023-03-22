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

/**
 * This variable contains reply objects of /check-auth-code route. {[state]: replayObject}
 * When we receive a /callback request with same state, it will replay the /check-auth-code request with code/token
 *
 * @type {{}}
 */
const awaitingTokenSessions = {};

/**
 * @param fastify
 */
module.exports.registerTokenDeliveryEndpoints = (fastify) => {
  /**
   * Relying-Party (Client) checks if there is a token specified for the processing state.
   *
   * We save reply HTTP Object for the state. When we receive the callback request from the authenticator,
   * this reply object will return callback query parameters to client.
   */
  fastify.get('/check-auth-code', async function (req, reply) {
    // Save the reply object to keep the connection alive with the Client!
    awaitingTokenSessions[req.query.state] = reply;

    // Keep alive the request!
    // Actually this part of the code stands only for saving memory. Has nothing to do with the flow.
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // no request received from the authenticator. We throw an error!
        if (awaitingTokenSessions[req.query.state]) {
          reply.status(400).send('No request received from the authenticator!');

          // delete the reply object in any case and save memory
          delete awaitingTokenSessions[req.query.state];

          reject(); // resolve this promise with reject
          return;
        }

        // flow has been completed already. Resolve this promise to clean-up memory.
        resolve(true);
      }, 30000);
    });
  });

  /**
   * This will be the endpoint authenticator calls after the auth process
   * The request has to include the state parameter
   */
  fastify.get('/callback', async function (req, reply) {
    // response the client for awaiting check-auth-token request and return data
    const responseObjForState = awaitingTokenSessions[req.query.state];
    responseObjForState?.send(req.query);

    delete awaitingTokenSessions[req.query.state];

    // send confirmation to authenticator
    reply.send(true);
  });
};
