(function(){
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
  
  $scope.listActionFormTpl = 'crud-list/list_action_form.html';
  $scope.showActions = {};
  $scope.rowCssClass = $scope.options.rowCssClass || function(){return '';};
  $scope.columns = $scope.options.columns;
  $scope.modelName = $scope.options.modelName;
  $scope.rowStates = {};
  $scope.idField = $scope.options.idField || 'id';
  $scope.upScope = $scope.options.scope || {};

  // Default options for multiSelect feature
  $scope.multiSelect = {
    checkedAll: false,
    selectedRows: {},
    enabled: false
  };
  

  $scope.doShowActionButtonsPanel = function() {
    return $scope.showActions.listActions && !$scope.listActionTpl();
  };

  $scope.listActionConfirmationInProgress = function() {
    return $scope.rowState() == 'confirmation';
  };

  $scope.toggleMultiSelect = function() {
    if ($scope.multiSelect.enabled) {
      $scope.disableMultiSelect();
    } else {
      $scope.enableMultiSelect();
    }
  };

  $scope.enableMultiSelect = function() {
    $scope.multiSelect.enabled = true;
  };

  $scope.disableMultiSelect = function() {
    $scope.multiSelect.enabled = false;
    $scope.multiSelect.selectedRows = {};
    $scope.multiSelect.checkedAll = false;
    multiSelectOnChange();
  };

  $scope.multiSelectToggleAll = function() {
    if ($scope.multiSelect.checkedAll) {
      var rowIds = ($scope.dataSource.filteredRows() || []).map($scope.rowId);
      var i;
      for (i in rowIds) {
        $scope.multiSelect.selectedRows[rowIds[i]] = true;
      }
    } else {
      $scope.multiSelect.selectedRows = {};
    }
    multiSelectOnChange();
  };

  $scope.checkAllRowsSelected = function() {
    $scope.multiSelect.checkedAll = $scope.dataSource.filteredRows().length == $scope.getSelectedRowIds().length;
    multiSelectOnChange();
    return $scope.multiSelect.checkedAll;
  };

  $scope.getSelectedRowIds = function() {
    var id;
    var selectedIds = [];
    for (id in $scope.multiSelect.selectedRows) {
      if ($scope.multiSelect.selectedRows[id]) {
        selectedIds.push(id);
      }
    }
    return selectedIds;
  };

  $scope.rowTpl = function(row) {
    if ($scope.rowStates[$scope.rowId(row)] && $scope.rowStates[$scope.rowId(row)][0] === 'edit') {
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

  $scope.listActionTpl = function() {
    return $scope.rowAction().templateUrl || null;
  };

  $scope.new = function() {
    $scope.row = $scope.dataSource.newRecord();
    return $scope.row;
  };
  
  $scope.cancel = function(row) {
    $scope.rowStates[$scope.rowId(row)] = null;
  };

  $scope.save = function(row, oForm) {
    if (oForm.$invalid) {
      return false;
    }
    clearRowErrors(row);
    $scope.dataSource.save(row, true, onSuccessSave);
  };

  $scope.remove = function(row) {
    var rid = $scope.rowId(row);
    $scope.dataSource.remove(rid, true);
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
    if ($scope.actionDisabled(action,row)) {
      return false;
    }
    if (event && event.stopImmediatePropagation) event.stopImmediatePropagation();
    if (action.confirmation && !confirmed) {
      $scope.rowStates[$scope.rowId(row)] = ['confirmation', action];
      event.preventDefault();
      return false;
    }
    
    row = callAction(action, row);

    if (action.templateUrl) {
      $scope.rowStates[$scope.rowId(row)] = ['edit', action];
      preventDefault(event);
    } else {
      $scope.rowStates[$scope.rowId(row)] = null;
    }
    if (!action.url || action.url === '') {
      preventDefault(event);
    }
    return true;
  };

  $scope.actionCssClass = function(action){
    return action.cssClass || actionCssClasses[action.name] || '';
  };

  $scope.actionShowed = function(action, row) {
    if (action.showedWhen) {
      return action.showedWhen(row, $scope);
    }
    return true;
  };

  $scope.actionDisabled = function(action, row) {
    if (action.activeWhen) {
      return !action.activeWhen(row, $scope);
    }
    return false;
  };

  $scope.rowState = function(row){
    if ($scope.rowStates[$scope.rowId(row)]) {
      return $scope.rowStates[$scope.rowId(row)][0] || '';
    }
    return '';
  };

  $scope.rowAction = function(row){
    if ($scope.rowStates[$scope.rowId(row)] && $scope.rowStates[$scope.rowId(row)][1]) {
      return $scope.rowStates[$scope.rowId(row)][1];
    }
    return {};
  };
  
  $scope.rowConfirmation = function(row){
    return $scope.rowAction(row).confirmation || {};
  };


  $scope.rowId = function(row){
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
      action.before(row, $scope);
    }
    if (action.action && angular.isFunction(action.action)) {
      results = action.action(row, $scope);
    }
    if (action.after && angular.isFunction(action.after)) {
      action.after(row || results, $scope);
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
    if (action.showedWhen && !angular.isFunction(action.showedWhen)) {
      action.showedWhen = null;
      $scope.errors.push('Action "' + action.name + '".showedWhen should be a function.');
    }
    if (action.activeWhen && !angular.isFunction(action.activeWhen)) {
      action.activeWhen = null;
      $scope.errors.push('Action "' + action.name + '".activeWhen should be a function.');
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
      if (column.titlePrefix) {
        column.prefix = column.titlePrefix;
        if ($scope.modelName) {
          column.prefix += '.' + $scope.modelName;
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
    $scope.rowStates[$scope.rowId(row)] = null;
    if ($scope.row && $scope.row.id == row.id) {
      $scope.rowStates[$scope.rowId({})] = null;
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

  var checkMultiSelectOptions = function() {
    if (!$scope.options.multiSelect) {
      $scope.options.multiSelect = {};
    }
    angular.merge($scope.multiSelect, $scope.options.multiSelect);
    if ($scope.multiSelect.onChange && !angular.isFunction($scope.multiSelect.onChange)) {
      $scope.errors.push('multiSelect.onChange should be a function.');
      $scope.multiSelect.onChange = null;
    }
  };

  var multiSelectOnChange = function(){
    if ($scope.multiSelect.onChange) {
      $scope.multiSelect.onChange($scope);
    }
  };

  checkColumns();
  checkRowActions();
  checkListActions();
  checkMultiSelectOptions();

  return true;
};


angular.module('vasvitaly.angular-crud-list', ['vasvitaly.i18n'])
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
}]);

})();
