(function(){
'use strict';

angular.module('vasvitaly.i18n', [])
.filter('i18n', function() {
  return function(key, prefix) {
    if (prefix) {
      prefix = prefix.split('.');
      switch (prefix[0]) {
        case 'ARA':
          prefix = ['activerecord','attributes'].concat(prefix.slice(1,prefix.length));
          break;
        case 'ARM':
          prefix = ['activerecord','models'].concat(prefix.slice(1,prefix.length));
          break;
        case 'enum':
          prefix = ['enumerize','defaults'].concat(prefix.slice(1,prefix.length));
          break;
      }
    } else {
      prefix = [];
    }
    prefix.push(key);
    return window.I18n.t(prefix.join('.'), {defaultValue: key});
  };
});

})();
