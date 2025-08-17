const { withNativeFederation } = require('@angular-architects/native-federation/config');
const { share } = require('@softarc/native-federation/src/lib/config/share-utils');

module.exports = withNativeFederation({

  shared: {
    ...share({
      // NG
      "@angular/animations": { singleton: true, requiredVersion: ">=19.0.0" },
      "@angular/cdk": { singleton: true, requiredVersion: ">=19.0.0" },
      "@angular/router": { singleton: true, requiredVersion: ">=19.0.0" },
      "@angular/core": { singleton: true, requiredVersion: ">=19.0.0" },
      "@angular/forms": { singleton: true, requiredVersion: ">=19.0.0" },
      "@angular/common": { singleton: true, requiredVersion: ">=19.0.0" },
      "@angular/service-worker": { singleton: true, requiredVersion: ">=19.0.0" },
      "@angular/common/http": { singleton: true, requiredVersion: ">=19.0.0" },

      "@app-galaxy/sdk-ui": { singleton: true, requiredVersion: ">=0.0.26" },
      "@app-galaxy/translate-ui": { singleton: true, requiredVersion: ">=0.0.10" },

      // NGRX
      "@ngrx/store": { singleton: true, requiredVersion: ">=19.0.0" },
      "@ngrx/effects": { singleton: true, requiredVersion: ">=19.0.0" },

      // Lib
      "bootstrap": { singleton: true, requiredVersion: ">=0.0.1" },
      "@ng-bootstrap/ng-bootstrap": { singleton: true, requiredVersion: ">=0.0.1" },
    })
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    '@api-elo/common',
    '@api-elo/models',

    // Add further packages you don't need at runtime
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    // New feature for more performance and avoiding
    // issues with node libs. Comment this out to
    // get the traditional behavior:
    ignoreUnusedDeps: true
  }
});
