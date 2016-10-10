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

  // Example of possible action options  
  // $scope.listActions = {
  //   add: {
  //     title: 'add',
  //     url: '/items/add',
  //   or 
  //     templateUrl: 'yourAppFolder/addItem.html',
  //   or
  //     action: function(){},
  
  //     confirmation: {
  //       text: 'Do you really want to add?',
  //       yesText: 'Sure',
  //       noText: 'No'
  //     },
  //     cssClass: 'btn-info btn-md'
  //   }
  // }


  // Example of possible row action options  
  // $scope.rowActions = {
  //   edit: {
  //     title: 'edit',
  //     url: '/items/:id',
  //   or 
  //     templateUrl: 'yourAppFolder/editItem.html',
  //   or
  //     action: function(){},
  
  //     confirmation: {
  //       text: 'Do you really want to edit?',
  //       yesText: 'Sure',
  //       noText: 'No'
  //     }
  //   }
  // }

  $scope.rowTpl = function(row) {
    if (row && row.state) {
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
    return $scope.row && $scope.row.state == 'new' ? 'crud-list/add_form.html' : '';
  };

  $scope.new = function() {
    $scope.row = $scope.dataSource.newRecord();
    $scope.row.state = 'new';
    return $scope.row;
  };
  
  $scope.cancel = function(row) {
    row.state = null;
    row.action = null;
    return false;
  };

  $scope.save = function(row, oForm) {
    if (oForm.$invalid) {
      return false;
    }
    clearRowErrors(row);
    $scope.dataSource.save(row, true, onSuccessSave.bind(this));
  };

  $scope.remove = function(row) {
    $scope.dataSource.remove(row.id);
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

  $scope.doAction = function(action, row) {
    if (action.confirmation) {
      row.confirmation = action.confirmation;
      row.action = action;
      return false;
    }
    if (action.action) {
      row = $scope.doConfirmedAction(action, row);
    } 
    if (action.templateUrl) {
      row.state = action.name;
    }
    return false;
  };

  $scope.doConfirmedAction = function(action, row) {
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

  $scope.cancelAction = function(row) {
    row.confirmation = null;
  };

  $scope.actionCssClass = function(action){
    return action.cssClass || actionCssClasses[action.name] || '';
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
    if (!action.title || action.title === '') {
      action.title = action.name;
    }
    if ( (!action.url || action.url === '') && 
         (!action.action || !angular.isFunction(action.action) ) 
       ) {
      if (action.name == 'new' || action.name == 'remove') {
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
    row.state = null;
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
    return window.I18n.t(prefix);
  };
});
angular.module('vasvitaly.angular-crud-list').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('crud-list/add_button.html',
    "<div class=\"col-md-2\"><a class=\"btn btn-primary\" ng-click=\"new()\" ng-href=\"{{newUrl()}}\">{{'add_new' | i18n : options.actionsScope.currentPage }}</a></div>"
  );


  $templateCache.put('crud-list/add_form.html',
    "<h2 class=\"sub-header\">{{'add_new' | i18n : options.actionsScope.currentPage }}</h2><div class=\"row\"><div class=\"col-md-12\" ng-include=\"listActions.new.templateUrl || rowActions.edit.templateUrl\"></div></div>"
  );


  $templateCache.put('crud-list/edit_row.html',
    "<td class=\"row\" colspan=\"{{columns.length+1}}\"><div class=\"col-md-12\" ng-include=\"rowActions[row.state].templateUrl\"></div></td>"
  );


  $templateCache.put('crud-list/link.html',
    "<a ng-bind=\"formattedValue(row, column)\" ng-href=\"{{actionUrl(column, row)}}\" target=\"_blank\"></a>"
  );


  $templateCache.put('crud-list/main.html',
    "<div ng-if=\"errors.length &gt; 0\"><p ng-bind=\"error\" ng-repeat=\"error in errors\"></p></div><div ng-if=\"errors.length == 0\"><div class=\"row listActionsPanel\" ng-if=\"showActions.listActions\"><span ng-repeat=\"action in listActions\"><a class=\"btn\" ng-class=\"actionCssClass(action)\" ng-click=\"doAction(action, row)\" ng-href=\"{{actionUrl(action)}}\" target=\"_blank\">{{ action.title | i18n }}</a>&nbsp;</span></div><div class=\"row\" ng-include=\"newRowTpl()\"></div><br><div class=\"row items-list\"><div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th ng-class=\"{&#39;clickable&#39;: !column.notSortable}\" ng-click=\"dataSource.sortBy(column.fieldId)\" ng-repeat=\"column in columns\" width=\"{{column.width || &#39;*&#39;}}\"><span class=\"icon\" ng-class=\"{ordered: dataSource.isOrderedByField(column.fieldId), reverse: dataSource.sortingInfo().desc}\" ng-if=\"!column.notSortable\"></span><span ng-bind=\"modelName + &#39;.&#39; + column.title | i18n : column.titlePrefix\"></span></th><th ng-show=\"showActions\">{{'actions' | i18n}}</th></tr></thead><tbody><tr ng-include=\"rowTpl(row)\" ng-repeat=\"row in dataSource.filteredRows()\"></tr></tbody></table></div></div></div>"
  );


  $templateCache.put('crud-list/plain_value.html',
    "<span ng-bind=\"formattedValue(row, column)\"></span>"
  );


  $templateCache.put('crud-list/row.html',
    "<td ng-include=\"cellTpl(column)\" ng-repeat=\"column in columns\"></td><td class=\"actions\" ng-if=\"showActions.rowActions\"><div class=\"action-block\" ng-show=\"!row.confirmation\"><span ng-repeat=\"action in rowActions\"><a class=\"btn\" ng-class=\"actionCssClass(action)\" ng-click=\"doAction(action, row)\" ng-href=\"{{actionUrl(action, row)}}\" target=\"_blank\">{{ action.title | i18n }}</a>&nbsp;</span></div><div class=\"action-confirmation-block\" ng-if=\"row.confirmation\"><span class=\"question\" ng-bind=\"row.confirmation.text\"></span><button class=\"btn btn-danger btn-xs\" ng-click=\"doConfirmedAction(row.action,row)\">{{ row.confirmation.yesText || 'sure' | i18n }}</button>&nbsp;<button class=\"btn btn-default btn-md\" ng-click=\"cancelAction(row)\">{{ row.confirmation.noText || 'cancel' | i18n }}</button></div></td>"
  );

}]);
