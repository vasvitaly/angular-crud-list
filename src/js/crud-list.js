'use strict';

var vvvCrudListController = function($scope) {
  var actionConfirmations = {
    remove: {
      yesText: 'remove_completely',
      noText: 'cancel'
    }
  };
  var actionCssClasses = {
    new: 'btn-primary',
    remove: 'btn-danger btn-xs',
    edit: 'btn-info btn-md'
  };
  $scope.errors = [];
  $scope.showActions = {};
  $scope.columns = $scope.options.columns;
  $scope.modelName = $scope.options.modelName;
  $scope.rowStates = {};
  $scope.idField = $scope.options.idField || 'id';

  $scope.rowTpl = function(row) {
    if ($scope.rowStates[rowId(row)] && $scope.rowStates[rowId(row)][0] === 'edit') {
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

  $scope.newRowTpl = function() {
    return $scope.row && $scope.rowStates['new'] && $scope.rowStates['new'][0] === 'edit' ? 'crud-list/add_form.html' : '';
  };

  $scope.new = function() {
    $scope.row = $scope.dataSource.newRecord();
    return $scope.row;
  };
  
  $scope.cancel = function(row) {
    $scope.rowStates[rowId(row)] = null;
  };

  $scope.save = function(row, oForm) {
    if (oForm.$invalid) {
      return false;
    }
    clearRowErrors(row);
    $scope.dataSource.save(row, true, onSuccessSave);
  };

  $scope.remove = function(row) {
    var rid = rowId(row);
    $scope.dataSource.remove(rid);
    $scope.rowStates[rid] = null;
    return row;
  };

  $scope.actionUrl = function(action, row) {
    if (action.url) {
      var resUrl = action.url;
      if (resUrl.indexOf('/') === 0) {
        resUrl = '#' + resUrl;
      }
      return row ? populateUrl(resUrl, row) : resUrl;
    }
    return '';
  };

  $scope.doAction = function(event, action, row, confirmed) {
    if (event && event.stopImmediatePropagation) event.stopImmediatePropagation();
    if (action.confirmation && !confirmed) {
      $scope.rowStates[rowId(row)] = ['confirmation', action];
      event.preventDefault();
      return false;
    }
    if (action.action) {
      row = callAction(action, row);
    }
    if (action.templateUrl) {
      $scope.rowStates[rowId(row)] = ['edit', action];
      preventDefault(event);
    } else {
      $scope.rowStates[rowId(row)] = null;
    }
    if (!action.url || action.url === '') {
      preventDefault(event);
    }
    return true;
  };

  $scope.actionCssClass = function(action){
    return action.cssClass || actionCssClasses[action.name] || '';
  };

  $scope.rowState = function(row){
    if ($scope.rowStates[rowId(row)]) {
      return $scope.rowStates[rowId(row)][0] || '';
    }
    return '';
  };

  $scope.rowAction = function(row){
    if ($scope.rowStates[rowId(row)] && $scope.rowStates[rowId(row)][1]) {
      return $scope.rowStates[rowId(row)][1];
    }
    return {};
  };
  
  $scope.rowConfirmation = function(row){
    return $scope.rowAction(row).confirmation || {};
  };

  var rowId = function(row){
    return row && row[$scope.idField] ? row[$scope.idField] : 'new';
  };

  var preventDefault = function(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
  };

  var callAction = function(action, row) {
    var results;
    if (action.before && angular.isFunction(action.before)) {
      action.before(row);
    }
    results = action.action(row);
    if (action.after && angular.isFunction(action.after)) {
      action.after(row || results);
    }
    return (row || results);
  };

  var checkRowActions = function() {
    checkActions('row');
  };

  var checkListActions = function() {
    checkActions('list');
  };

  var checkActions = function(target) {
    var actionsLength = 0;
    var actions, action, actionName;
    target = target + 'Actions';
    
    $scope[target] = {};
    if ($scope.options[target]) {
      actions = $scope.options[target];
      for (actionName in actions) {
        action = actions[actionName];
        action.name = actionName;
        if (isActionCorrect(action)) {
          $scope[target][actionName] = action;
          actionsLength += 1;
        } else {
          return false;
        }
      }
    }
    $scope.showActions[target] = actionsLength > 0;
  };

  var isActionCorrect = function(action){
    var allowedActions = ['new', 'remove'];
    
    if (!action.title || action.title === '') {
      action.title = action.name;
    }
    if (action.action && allowedActions.indexOf(action.action) !== -1 ) {
      action.action = $scope[action.action];
    }
    if ( (!action.url || action.url === '') && 
         (!action.action || !angular.isFunction(action.action) ) 
       ) {
      if (allowedActions.indexOf(action.name) !== -1) {
        action.action = $scope[action.name];
        if (action.confirmation !== false && !action.confirmation && actionConfirmations[action.name]) {
          action.confirmation = actionConfirmations[action.name];
        }
      } else if (!action.templateUrl || action.templateUrl === '')  {
        $scope.errors.push('Action "' + action.name + '" has nothing to do.');
        return false;
      }
    }
    return true;
  };


  var checkColumns = function() {
    var i, column;
    for (i=0; i<$scope.columns.length; i++) {
      column = $scope.columns[i];
      if (!column.fieldId) {
        $scope.errors.push("Column " + i + " has no fieldId.");
        continue;
      }
      if (!column.title) {
        column.title = column.fieldId;
      }
      if ($scope.modelName) {
        if (column.titlePrefix) {
          column.prefix = column.titlePrefix + '.' + $scope.modelName;
        }
      }
    }
  };

  var populateUrl = function(url, data) {
    var i, places, property;
    places = url.match(/\:[^\/\:\.]+/g);
    if (places) {
      for (i = 0; i < places.length; i++) {
        property = places[i].replace(':','');
        if (data.hasOwnProperty(property)) {
          url = url.replace(places[i], data[property]);
        }
      }
    }
    return url;
  };

  var onSuccessSave = function(row) {
    $scope.rowStates[rowId(row)] = null;
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

  checkColumns();
  checkRowActions();
  checkListActions();

  return true;
};

angular.module('vasvitaly.angular-crud-list', [])
.directive('vvvCrudList', [function() {
  return {
    restrict: 'AE',
    templateUrl: 'crud-list/main.html',
    scope: {
      options: '=',
      dataSource: '=source'
    },
    controllerAs: 'crudList',
    controller: ['$scope', vvvCrudListController ]
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
    return window.I18n.t(prefix, {defaultValue: key});
  };
});