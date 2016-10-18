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
