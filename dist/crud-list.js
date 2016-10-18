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

(function(){
'use strict';

var vvvPaginationController = function($scope) {
  
  $scope.options = {
    showPreviousPage: true,
    showNextPage: true,
    maxPages: 10
  };
  angular.merge($scope.options, $scope.settings);

  $scope.ngModel = {};

  $scope.$watch(function() {
    return $scope.source && $scope.source.paginationInfo() && 
           $scope.source.paginationInfo().totalCount;
    }, function(newValue, oldValue) {
      if ($scope.source && $scope.source.paginationInfo()) {
        $scope.ngModel = $scope.source.paginationInfo();
      }
    }
  );

  $scope.$watch(function() {
    return $scope.source && $scope.source.paginationInfo() && 
           $scope.source.paginationInfo().page;
    }, function(newValue, oldValue) {
      if ($scope.source && $scope.source.paginationInfo().page) {
        $scope.ngModel = $scope.source.paginationInfo();
      }
    }
  );

  $scope.isVisible = function() {
    return maxPage() > 1;
  };

  $scope.setPage = function(page){
    if (page && page != $scope.ngModel.page && page > 0 && page <= maxPage()) {
      $scope.source.paginate(page);
    }
  };

  $scope.previousPage = function() {
    var res = $scope.ngModel.page - 1;
    if (res <= 0 ) {
      res = false;
    }
    return res;
  };

  $scope.nextPage = function() {
    var nextPage = $scope.ngModel.page + 1;
    if (nextPage > maxPage()) {
      nextPage = false;
    }
    return nextPage;
  };

  $scope.havePreviousPage = function() {
    return $scope.options.showPreviousPage && $scope.previousPage();
  };
  
  $scope.haveNextPage = function() {
    return $scope.options.showNextPage && $scope.nextPage();
  };

  $scope.pages = function() {
    var pages = [];
    pages = fillNearRange(pages);
    pages = fillLowerRange(pages);
    pages = fillUpperRange(pages);
    pages = fillUpLowerRange(pages);
    return pages;
  };

  var maxPage = function() {
    return Math.ceil( $scope.ngModel.totalCount / $scope.ngModel.perPage );
  };

  var fillNearRange = function(pages) {
    var currPage = $scope.ngModel.page;
    pages.push(currPage);
    if (currPage > 2){
      pages.unshift(currPage - 1);
    }
    if (currPage + 1 < maxPage()) {
      pages.push(currPage + 1);
    }
    return pages;
  };


  var fillLowerRange = function(pages) {
    var currPage = $scope.ngModel.page;
    var maxPages = $scope.options.maxPages;
    var range = currPage - 2;
    var slots = Math.ceil((maxPages - 5) / 10 * 3);

    var level = 1;
    var k, page;
    while (slots > 0) {
      k = Math.pow(10,level);
      page = Math.floor((pages[0] - 1) / k) * k;
      if (page) {
        if (page < pages[0]){
          pages.unshift(page);
          slots -= 1;
        }
        level += 1;
      } else {
        slots = 0;
        if (pages[0] != 1){
          pages.unshift(1);
        }
      }
    }
    return pages;
  };

  var fillUpLowerRange = function(pages) {
    var currPage = $scope.ngModel.page;
    var idx = pages.indexOf(currPage - 1);
    var capacity = $scope.options.maxPages - pages.length;
    var full = false;
    var page;

    while (capacity && !full) {
      page = pages[idx] - 1;
      if (page > 1) {
        if (page > pages[idx-1]) {
          pages.splice(idx, 0, page);
          capacity -= 1;
        } else {
          idx -= 1;
        }
      } else {
        full = true;
      }
    }
    return pages;
  };


  var fillUpperRange = function (pages) {
    var currPage = $scope.ngModel.page;
    var maxPages = $scope.options.maxPages;
    var range = maxPage() - currPage - 1;
    var slots = maxPages - pages.length - 1;
    var upperPages = [];

    var level = 1;
    var full = false;
    var k, page, lastPage;
    while (!full && slots > 0) {
      if (upperPages.length){
        lastPage = upperPages[upperPages.length-1];
      } else {
        lastPage = pages[pages.length-1];
      }
      k = Math.pow(10,level);
      page = page =Math.ceil((lastPage + 1) / k) * k;
      if (page < maxPage()) {
        upperPages.push(page);
        slots -= 1;
        level += 1;
      } else {
        full = true;
      }
    }
    
    var max;
    while (slots > 1) {
      page = pages[pages.length-1] + 1;
      max = upperPages[0] || maxPage();
      if (page < max) {
        pages.push(page);
        slots -= 1;
      } else {
        slots = 0;
      }
    }

    pages = pages.concat(upperPages);
    if (pages[pages.length-1] < maxPage()) {
      pages.push(maxPage());
    }

    return pages;
  };
};

angular.module('vasvitaly.angular-pagination', ['vasvitaly.i18n'])
.directive('vvvPagination', [ function() { 
  return {
    restrict: 'EA',
    templateUrl: 'pagination/pagination.html',
    scope: {
      source: '=',
      settings: '=options'
    },
    controller: ['$scope', vvvPaginationController ],
    controllerAs: 'pagination'
  };
}]);

})();
angular.module('vasvitaly.angular-crud-list').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('crud-list/add_form.html',
    "<h2 class=\"sub-header\">{{'add_new.'+modelName | i18n }}</h2><div class=\"row\"><div class=\"col-md-12\" ng-include=\"rowAction().templateUrl\"></div></div>"
  );


  $templateCache.put('crud-list/edit_row.html',
    "<td class=\"row\" colspan=\"{{columns.length+1}}\"><div class=\"col-md-12\" ng-include=\"rowAction(row).templateUrl\"></div></td>"
  );


  $templateCache.put('crud-list/link.html',
    "<a ng-bind=\"formattedValue(row, column)\" ng-href=\"{{actionUrl(column, row)}}\" target=\"_blank\"></a>"
  );


  $templateCache.put('crud-list/main.html',
    "<div ng-if=\"errors.length &gt; 0\"><p ng-bind=\"error\" ng-repeat=\"error in errors\"></p></div><div ng-if=\"errors.length == 0\"><div class=\"row listActionsPanel\" ng-if=\"showActions.listActions\"><div class=\"listActions\" ng-if=\"rowState() !== &#39;confirmation&#39;\"><span ng-repeat=\"action in listActions\"><a class=\"btn\" ng-class=\"actionCssClass(action)\" ng-click=\"doAction($event, action, row)\" ng-href=\"{{actionUrl(action)}}\" target=\"_blank\">{{ action.title | i18n }}</a>&nbsp;</span></div><div class=\"action-confirmation-block\" ng-if=\"rowState() == &#39;confirmation&#39;\"><span class=\"question\" ng-bind=\"rowConfirmation().text\"></span><a class=\"btn btn-danger btn-xs\" ng-click=\"doAction($event, rowAction(), null, true)\" ng-href=\"{{actionUrl(rowAction())}}\" target=\"_blank\">{{ rowConfirmation().yesText || 'sure' | i18n }}</a>&nbsp;<button class=\"btn btn-default btn-md\" ng-click=\"cancel()\">{{ rowConfirmation().noText || 'cancel' | i18n }}</button></div></div><div class=\"row new-item-block\" ng-include=\"newRowTpl()\"></div><br><div class=\"row items-list\"><div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th ng-class=\"{&#39;clickable&#39;: !column.notSortable}\" ng-click=\"dataSource.sortBy(column.fieldId)\" ng-repeat=\"column in columns\" width=\"{{column.width || &#39;*&#39;}}\"><span class=\"icon\" ng-class=\"{ordered: dataSource.isOrderedByField(column.fieldId), reverse: dataSource.sortingInfo().desc}\" ng-if=\"!column.notSortable\"></span><span ng-bind=\"column.title | i18n : column.prefix\"></span></th><th ng-show=\"showActions\">{{'actions' | i18n}}</th></tr></thead><tbody><tr ng-include=\"rowTpl(row)\" ng-repeat=\"row in dataSource.filteredRows()\"></tr></tbody></table></div></div></div>"
  );


  $templateCache.put('crud-list/plain_value.html',
    "<span ng-bind=\"formattedValue(row, column)\"></span>"
  );


  $templateCache.put('crud-list/row.html',
    "<td ng-include=\"cellTpl(column)\" ng-repeat=\"column in columns\"></td><td class=\"actions\" ng-if=\"showActions.rowActions\"><div class=\"action-block\" ng-show=\"rowState(row) !== &#39;confirmation&#39;\"><span ng-repeat=\"action in rowActions\"><a class=\"btn\" ng-class=\"actionCssClass(action)\" ng-click=\"doAction($event, action, row)\" ng-href=\"{{actionUrl(action, row)}}\" target=\"_blank\">{{ action.title | i18n }}</a>&nbsp;</span></div><div class=\"action-confirmation-block\" ng-if=\"rowState(row) == &#39;confirmation&#39;\"><span class=\"question\" ng-bind=\"rowConfirmation(row).text\"></span><a class=\"btn btn-danger btn-xs\" ng-click=\"doAction($event, rowAction(row), row, true)\" ng-href=\"{{actionUrl(rowAction(row), row)}}\" target=\"_blank\">{{ rowConfirmation(row).yesText || 'sure' | i18n }}</a>&nbsp;<button class=\"btn btn-default btn-md\" ng-click=\"cancel(row)\">{{ rowConfirmation(row).noText || 'cancel' | i18n }}</button></div></td>"
  );

}]);

angular.module('vasvitaly.angular-pagination').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('pagination/pagination.html',
    "<nav ng-if=\"isVisible()\"><ul class=\"pagination\"><li ng-class=\"{disabled: !havePreviousPage()}\"><a aria-label=\"{{&#39;previous_page&#39; | i18n : &#39;pagination&#39;}}\" href=\"\" ng-click=\"setPage(previousPage())\"><span aria-hidden=\"true\">&laquo;</span></a></li><li ng-class=\"{active: page == ngModel.page}\" ng-repeat=\"page in pages()\"><a href=\"\" ng-click=\"setPage(page)\">{{page}}</a></li><li ng-class=\"{disabled: !haveNextPage()}\"><a aria-label=\"{{&#39;next_page&#39; | i18n : &#39;pagination&#39;}}\" href=\"\" ng-click=\"setPage(nextPage())\"><span aria-hidden=\"true\">&raquo;</span></a></li></ul><div class=\"pagination-info\" ng-if=\"options.showInfo\"><span class=\"page\">{{'rows' | i18n : 'pagination'}} </span><span class=\"page-limit\">{{(ngModel.page - 1) * ngModel.perPage + 1}} - {{ngModel.page * ngModel.perPage}}</span><span class=\"of\">{{'of-count' | i18n : 'pagination'}}</span><span class=\"total\">{{ngModel.totalCount}}</span></div></nav>"
  );

}]);
