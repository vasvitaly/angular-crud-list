angular.module('vasvitaly.angular-pagination').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('pagination/pagination.html',
    "<nav ng-if=\"pagination.isVisible()\"><ul class=\"pagination\"><li ng-class=\"{disabled: !pagination.havePreviousPage()}\"><a aria-label=\"{{&#39;previous_page&#39; | i18n : &#39;pagination&#39;}}\" href=\"\" ng-click=\"pagination.setPage(pagination.previousPage())\"><span aria-hidden=\"true\">&laquo;</span></a></li><li ng-class=\"{active: pagination.isCurrentPage(page)}\" ng-repeat=\"page in pagination.pages()\"><a href=\"\" ng-click=\"pagination.setPage(page)\">{{page}}</a></li><li ng-class=\"{disabled: !pagination.haveNextPage()}\"><a aria-label=\"{{&#39;next_page&#39; | i18n : &#39;pagination&#39;}}\" href=\"\" ng-click=\"pagination.setPage(pagination.nextPage())\"><span aria-hidden=\"true\">&raquo;</span></a></li></ul><div class=\"pagination-info\" ng-if=\"pagination.options.showInfo\"><span class=\"page\">{{'rows' | i18n : 'pagination'}} </span><span class=\"page-limit\">{{pagination.firstItemNumber()}} - {{pagination.lastItemNumber()}}</span><span class=\"of\">{{'of-count' | i18n : 'pagination'}}</span><span class=\"total\">{{pagination.totalCount()}}</span></div></nav>"
  );

}]);
