<img align="right" width="200" height="37" src="assets/Gematik_Logo_Flag.png"/> <br/>

[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-no-red.svg)](https://bitbucket.org/lbesson/ansi-colors)

# Resource Server Example for "gematik Authenticator"
<details>
    <summary>Table of Contents</summary>
        <ol>
            <li><a href="#about-the-project">About The Project</a>
                <ul>
                    <li><a href="#release-notes">Release Notes</a></li>
                </ul>
            </li>
            <li><a href="#development">Development</a>
                <ul>
                    <li><a href="#starting-the-project-for-dev-mode">Starting the Project for dev-mode</a></li>
                    <li><a href="#certificates-for-idP-tLS-connection">Compiles and hot-reloads for development</a></li>
                    <li><a href="#compiles-and-minifies-for-production">Certificates for IdP TLS Connection</a></li>
                </ul>
            </li>
            <li><a href="#contributing">Contributing</a></li>
            <li><a href="#license-eupl">License EUPL</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#support-and-feedback">Support and Feedback</a></li>
        </ol>
</details>

## About The Project
This repository is an example Resource Server project for testing gematik Authenticator.

### Release Notes
See [ReleaseNotes.md](./ReleaseNotes.md) for all information regarding the (newest) releases.

## Development
### Starting the Project for dev-mode
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
