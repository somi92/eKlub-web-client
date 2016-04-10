'use strict';

angular.module('eKlub.version', [
  'eKlub.version.interpolate-filter',
  'eKlub.version.version-directive'
])

.value('version', '0.1');
