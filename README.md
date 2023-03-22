<img align="right" width="200" height="37" src="assets/Gematik_Logo_Flag.png"/> <br/>

# Resource Server Example for "gematik Authenticator"

## Table of Contents

1. [About The Project](#about-the-project)
   - [Release Notes](#release-notes)
2. [Development](#development)
   - [Starting the Project for dev-mode](#starting-the-project-for-dev-mode)
   - [Certificates for IdP TLS Connection](#certificates-for-idp-tls-connection)
3. [Contributing](#contributing)
4. [License EUPL](#license-eupl)
5. [FAQ](#faq)
6. [Support and Feedback](#support-and-feedback)

## About The Project
This repository is an example Resource Server project for testing gematik Authenticator.

### Release Notes
See [ReleaseNotes.md](./ReleaseNotes.md) for all information regarding the (newest) releases.

## Development
### Starting the Project for dev-mode
Before you can start the project, it is necessary to create an **.env.dev - File** in the root-path. You can find an 
example in our resources: [env.dev-Example](./resources/github-example-env.dev)

Then run the following commands to start the project:

    npm install
    npm run dev

In dev-mode with the gem-CIDP profile, it is necessary to have a local IDP server running: https://github.com/gematik/ref-idp-server.

### Certificates for IdP TLS Connection
To establish a secure connection with the IdP Server, place your 
public certificates under `resources/certs-idp`

## Contributing
We plan to enable contribution to the Authenticator in the near future.

## License EUPL
Copyright 2023 gematik GmbH

The Authenticator App is licensed under the European Union Public Licence (EUPL); every use of the Authenticator App
Sourcecode must be in compliance with the EUPL.

You will find more details about the EUPL here: https://joinup.ec.europa.eu/collection/eupl

Unless required by applicable law or agreed to in writing, software distributed under the EUPL is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the EUPL for the specific
language governing permissions and limitations under the License.ee the Licence for the specific language governing
permissions and limitations under the Licence.

## FAQ
Visit our [FAQ page](https://wiki.gematik.de/x/tjdCH) for more information.

## Support and Feedback
For inquiries from application developers regarding the API or suggestions, please use the following email address:
[authenticator@gematik.de](mailto:authenticator@gematik.de)