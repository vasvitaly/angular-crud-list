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