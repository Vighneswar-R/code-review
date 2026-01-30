import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '<YOUR_CLIENT_ID>',
    authority: 'https://login.microsoftonline.com/<YOUR_TENANT_ID>',
    redirectUri: 'http://localhost:3000/oauth2/callback',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Info,
      loggerCallback: (level, message) => {
        console.log(message);
      },
    },
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};