/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  authUrl: 'http://localhost:4000/',
  apiUrl: 'http://localhost:5000/api/v1.0/',
  pikaApiUrl: 'http://localhost:5000/',
  apiVersion: '1.0',
  editorToken: 'tipo',
  callbackRoute: '/pages/tabular?tipo=volumen&id=&sub=',
  cacheActivo: true,
  uploadUrl: 'http://localhost:5000/api/v1.0/upload',
  visordUrl: 'http://localhost:5000/api/v1.0/visor',
  mediaUrl: 'http://localhost:5000/api/v1.0/media',
};
