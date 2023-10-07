/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// la ruta de authUrl debe ir sin / al fina
// ---------------------------------------------------
export const environment = {
  production: false,
  version: "2.0.5",
  cloudurl: "https://localhost:7001/",
  clouded: true,
  recaptcha: {
    siteKey: "6LeGwyolAAAAAJ7lafqVP4auFcx7TM5NoJyETq0J",
  },
};
