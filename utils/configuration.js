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

const { CONSTANTS } = require('./util_helpers');

module.exports = {
  // Keycloak Issue
  clients: [
    {
      client_id: CONSTANTS._CLIENT_ID,
      client_secret: CONSTANTS._CLIENT_SECRET,
      redirect_uris: [CONSTANTS._REDIRECT_URI], // using jwt.io as redirect_uri to show the ID Token contents
      response_types: ['code', 'token'],
      grant_types: ['authorization_code'],
      token_endpoint_auth_method: 'client_secret_post',
      scope: 'openid ogr_profile email',
    },
  ],
  // defined Claims
  // defined Claims
  onLoad: 'login-required',

  pkce: { supportedMethods: [CONSTANTS._PKCE_METHOD], forcedForNative: true },

  features: {
    introspection: { enabled: true },
    devInteractions: { enabled: false },
    revocation: { enabled: true },
  },

  formats: {
    AccessToken: 'jwt',
  },
};
