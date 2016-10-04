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