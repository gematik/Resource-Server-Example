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
const OPENID_CONFIGURATION = '/.well-known/openid-configuration';
const jsonwebtoken = require('jsonwebtoken');

let idpEncResp;
const getIdpEncJwk = async function getIdpEncJwk() {
  try {
    const discoveryDocResp = await axios.get(`${process.env.CENTRAL_IDP_SERVER}` + OPENID_CONFIGURATION, {
      headers: {
        Accept: '*/*',
      },
    });
    const openIdConfiguration = jsonwebtoken.decode(discoveryDocResp.data);
    const endpointIdpEnc = openIdConfiguration.uri_puk_idp_enc;
    idpEncResp = await axios.get(endpointIdpEnc);
  } catch (err) {
    console.error('could not read discovery-document', err);
    // todo throw && warn the user
  }
};
module.exports = async function createJwe(inputPlain) {
  const JWE = require('node-jose/lib/jwe');

  await getIdpEncJwk();
  const key = {
    kid: idpEncResp.data.kid,
    kty: idpEncResp.data.kty,
    crv: idpEncResp.data.crv,
    x: idpEncResp.data.x,
    y: idpEncResp.data.y,
  };
  const opts = {
    fields: {
      exp: Date.now(),
      epk: {
        crv: key.crv,
      },
      cty: 'NJWT',
    },
  };

  const jwe = JWE.createEncrypt(opts, key);
  jwe.update(Buffer.from(inputPlain));
  const finalJwe = await jwe.final();

  return finalJwe.protected + '..' + finalJwe.iv + '.' + finalJwe.ciphertext + '.' + finalJwe.tag;
};
