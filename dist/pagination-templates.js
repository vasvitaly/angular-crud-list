angular.module('vasvitaly.angular-pagination').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('pagination/pagination.html',
    "<nav ng-if=\"isVisible()\"><ul class=\"pagination\"><li ng-class=\"{disabled: !havePreviousPage()}\"><a aria-label=\"{{&#39;previous_page&#39; | i18n : &#39;pagination&#39;}}\" href=\"\" ng-click=\"setPage(previousPage())\"><span aria-hidden=\"true\">&laquo;</span></a></li><li ng-class=\"{active: page == ngModel.page}\" ng-repeat=\"page in pages()\"><a href=\"\" ng-click=\"setPage(page)\">{{page}}</a></li><li ng-class=\"{disabled: !haveNextPage()}\"><a aria-label=\"{{&#39;next_page&#39; | i18n : &#39;pagination&#39;}}\" href=\"\" ng-click=\"setPage(nextPage())\"><span aria-hidden=\"true\">&raquo;</span></a></li></ul><div class=\"pagination-info\" ng-if=\"options.showInfo\"><span class=\"page\">{{'rows' | i18n : 'pagination'}} </span><span class=\"page-limit\">{{(ngModel.page - 1) * ngModel.perPage + 1}} - {{ngModel.page * ngModel.perPage}}</span><span class=\"of\">{{'of-count' | i18n : 'pagination'}}</span><span class=\"total\">{{ngModel.totalCount}}</span></div></nav>"
  );

}]);
