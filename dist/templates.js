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
