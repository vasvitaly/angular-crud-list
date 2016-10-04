'use strict';

var vvvCrudListController = function($scope) {

  $scope.columns = $scope.options.columns;
  $scope.modelName = $scope.options.modelName;

  $scope.rowTpl = function(row) {
    if (row && row.editing) {
      return 'crud-list/edit_row.html';
    } else {
      return 'crud-list/row.html';
    }
  };

  $scope.cellTpl = function(column) {
    if (column.templateUrl) {
      return column.templateUrl;
    } else if (column.url) {
      return 'crud-list/link.html';
    }
    return 'crud-list/plain_value.html';
  };


  $scope.formattedValue = function(row, column) {
    var value = oValue(row, column.fieldId.split('.'));
    if (column.formatter && angular.isFunction(column.formatter)) {
      return column.formatter(value);
    } else {
      return value;
    }
  };

  $scope.addRowTpl = function() {
    if ($scope.row && $scope.row.editing) {
      return 'crud-list/add_form.html';
    } else {
      return 'crud-list/add_button.html';
    }
  };

  $scope.newUrl = function() {
    if ($scope.options.newUrl){
      return '#' + $scope.options.newUrl;
    } else {
      return '';
    }
  };

  $scope.new = function() {
    if ($scope.options.newUrl) {
      return true;
    }
    $scope.row = $scope.dataSource.newRecord();
    $scope.row.editing = true;
    if ($scope.options.onCreate) {
      $scope.options.onCreate($scope.row);
    }
    return $scope.row;
  };
  
  $scope.editUrl = function(row) {
    if ($scope.options.editUrl) {
      return '#' + $scope.options.editUrl.replace(':id', row.id);
    } else {
      return '';
    }
  };

  $scope.edit = function(row) {
    if ($scope.options.editUrl) {
      return true;
    }
    if ($scope.options.onEdit) {
      $scope.options.onEdit(row);
    }
    row.editing = true;
    return false;
  };

  $scope.cancel = function(row) {
    row.editing = false;
    return false;
  };

  $scope.save = function(row, oForm) {
    if (oForm.$invalid) {
      return false;
    }
    clearRowErrors(row);
    $scope.dataSource.save(row, true, onSuccessSave.bind(this));
  };

  $scope.delete = function(row) {
    $scope.dataSource.remove(row.id);
  };

  $scope.actionUrl = function(action, row) {
    if (action.url) {
      return '#' + action.url.replace(':id', row.id);
    }
    return '';
  };

  $scope.doCustomAction = function(action, row) {
    if (action.action) {
      action.action(row);
      return true;
    }
    return false;
  };

  var onSuccessSave = function(row) {
    row.editing = false;
    if ($scope.row && $scope.row.id == row.id) {
      $scope.row = null;
    }
  };

  var clearRowErrors = function(row) {
    row.errors = {};
  };

  var oValue = function(obj, keys) {
    var key;
    key = keys.shift();
    if (keys.length > 0 && obj[key] && typeof(obj[key]) == 'object') {
      return oValue(obj[key], keys);
    } else {
      return obj[key];
    }
  };

  return true;
};

angular.module('vasvitaly.angular-crud-list', [])
.directive('vvvCrudList', [function() {
  return {
    restrict: 'AE',
    templateUrl: 'crud-list/main.html',
    scope: {
      options: '=',
      dataSource: '=source',
      actionsScope: '=',
      rowActions: '@',
      customActions: '=?customActions',
    },
    controllerAs: 'crudList',
    controller: ['$scope', vvvCrudListController ],

    link: function(scope) {
      if (!scope.customActions) {
        scope.customActions = [];
      }
      if (!scope.rowActions) {
        scope.rowActions = '';
      }
      scope.actions = {
        edit: scope.rowActions.indexOf('E') >= 0 || scope.rowActions.indexOf('U') >= 0,
        create: scope.rowActions.indexOf('C') >= 0,
        remove: (scope.rowActions.indexOf('R') >= 0 || scope.rowActions.indexOf('D') >= 0)
      };
      scope.showActions = scope.actions.edit || scope.actions.remove || scope.customActions.length;
      return true;
    }
  };
}])
.filter('i18n', function() {
  return function(key, prefix) {
    if (prefix) {
      prefix = prefix.split('.');
      if (prefix[0] == 'ARA') {
        prefix.shift();
        prefix = ['activerecord','attributes'].concat(prefix.slice(1,prefix.length));
      } else if (prefix[0] == 'ARM') {
        prefix = ['activerecord','models'].concat(prefix.slice(1,prefix.length));
      } else if (prefix[0] == 'enum') {
        prefix = ['enumerize','defaults'].concat(prefix.slice(1,prefix.length));
      }
    } else {
      prefix = [];
    }
    prefix.push(key);
    return window.I18n.t(prefix);
  };
});
angular.module('vasvitaly.angular-crud-list').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('crud-list/add_button.html',
    "<div class=\"col-md-2\"><a class=\"btn btn-primary\" ng-click=\"new()\" ng-href=\"{{newUrl()}}\">{{'add_new' | i18n : actionsScope.currentPage }}</a></div>"
  );


  $templateCache.put('crud-list/add_form.html',
    "<h2 class=\"sub-header\">{{'add_new' | i18n : actionsScope.currentPage }}</h2><div class=\"row\"><div class=\"col-md-12\" ng-include=\"options.editTemplateUrl\"></div></div>"
  );


  $templateCache.put('crud-list/edit_row.html',
    "<td class=\"row\" colspan=\"{{columns.length+1}}\"><div class=\"col-md-12\" ng-include=\"options.editTemplateUrl\"></div></td>"
  );


  $templateCache.put('crud-list/link.html',
    "<a ng-bind=\"formattedValue(row, column)\" ng-href=\"{{actionUrl(column, row)}}\" target=\"_blank\"></a>"
  );


  $templateCache.put('crud-list/main.html',
    "<div class=\"row add-item-place\" ng-if=\"actions.create\" ng-include=\"addRowTpl()\"></div><br><div class=\"row items-list\"><div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th ng-class=\"{&#39;clickable&#39;: !column.notSortable}\" ng-click=\"dataSource.sortBy(column.fieldId)\" ng-repeat=\"column in columns\" width=\"{{column.width || &#39;*&#39;}}\"><span class=\"icon\" ng-class=\"{ordered: dataSource.isOrderedByField(column.fieldId), reverse: dataSource.sortingInfo().desc}\" ng-if=\"!column.notSortable\"></span><span ng-bind=\"modelName + &#39;.&#39; + column.title | i18n : column.titlePrefix\"></span></th><th ng-show=\"showActions\">{{'actions' | i18n}}</th></tr></thead><tbody><tr ng-include=\"rowTpl(row)\" ng-repeat=\"row in dataSource.filteredRows()\"></tr></tbody></table></div></div>"
  );


  $templateCache.put('crud-list/plain_value.html',
    "<span ng-bind=\"formattedValue(row, column)\"></span>"
  );


  $templateCache.put('crud-list/row.html',
    "<td ng-include=\"cellTpl(column)\" ng-repeat=\"column in columns\"></td><td class=\"actions\" ng-if=\"showActions\"><div class=\"action-block\" ng-hide=\"row.in_action\"><a class=\"btn btn-info btn-md\" ng-click=\"edit(row)\" ng-href=\"{{editUrl(row)}}\" ng-if=\"actions.edit\">{{ 'edit' | i18n }}</a>&nbsp;<button class=\"btn btn-danger btn-xs\" ng-click=\"row.in_action=&#39;remove&#39;\" ng-if=\"actions.remove\">{{ 'remove' | i18n }}</button><a class=\"btn btn-md\" ng-click=\"doCustomAction(action, row)\" ng-href=\"{{actionUrl(action, row)}}\" ng-repeat=\"action in customActions\" target=\"_blank\">{{ action.title | i18n }}</a></div><div class=\"action-block-remove\" ng-if=\"actions.remove\" ng-show=\"row.in_action==&#39;remove&#39;\"><button class=\"btn btn-danger btn-xs\" ng-click=\"delete(row)\">{{ 'remove_completely' | i18n }}</button>&nbsp;<button class=\"btn btn-default btn-md\" ng-click=\"row.in_action=false\">{{ 'cancel' | i18n }}</button></div></td>"
  );

}]);
