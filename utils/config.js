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

const dotenv = require("dotenv");
const path = require("path");
const envPath = path.join(__dirname, `/../.env.${process.env.NODE_ENV}`);

const result = dotenv.config({ path: envPath });
if (result.error) {
  throw result.error;
}

module.exports.envs = result.parsed;

module.exports.conf = {
  ...result.parsed,
};
