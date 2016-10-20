(function(){
'use strict';

var vvvPaginationController = function($scope) {
  var self, source, paginationInfo;
  self = this;
  
  self.options = {
    showPreviousPage: true,
    showNextPage: true,
    maxPages: 10
  };
  angular.merge(self.options, $scope.settings);
  
  if (self.options.maxPages < 5) { 
    self.options.maxPages = 5;
  }

  paginationInfo = {
    totalCount: 0,
    perPage: 1
  };
  source = $scope.source;

  $scope.$watch(function() {
    return isPaginationInfoCompliant() ? source.paginationInfo() : false;
    }, function(newValue, oldValue) {
      if (newValue) {
        paginationInfo = source.paginationInfo();
      }
    }
  );

  self.isVisible = function() {
    return maxPage() > 1;
  };

  self.setPage = function(page){
    if (page && page != paginationInfo.page && page > 0 && page <= maxPage()) {
      source.paginate(page);
    }
  };

  self.previousPage = function() {
    var res = paginationInfo.page - 1;
    if (res <= 0 ) {
      res = false;
    }
    return res;
  };

  self.nextPage = function() {
    var nextPage = paginationInfo.page + 1;
    if (nextPage > maxPage()) {
      nextPage = false;
    }
    return nextPage;
  };

  self.havePreviousPage = function() {
    return self.options.showPreviousPage && !!self.previousPage();
  };
  
  self.haveNextPage = function() {
    return self.options.showNextPage && !!self.nextPage();
  };

  self.isCurrentPage = function(page) {
    return page == paginationInfo.page;
  };

  self.firstItemNumber = function() {
    return (paginationInfo.page - 1) * paginationInfo.perPage + 1;
  };

  self.lastItemNumber = function() {
    return paginationInfo.page * paginationInfo.perPage;
  };

  self.totalCount = function() {
    return paginationInfo.totalCount;
  };

  self.pages = function() {
    var pages;
    pages = fillNearRange();
    pages = fillLowerRange(pages);
    pages = fillUpperRange(pages);
    pages = fillUpLowerRange(pages);
    return pages;
  };

  /*
  * Creates core of pages: current page and two nearest neighbors.
  */
  var fillNearRange = function() {
    var pages = [];
    var currPage = paginationInfo.page;
    if (currPage > 2){
      pages.push(currPage - 1);
    }
    pages.push(currPage);
    if (currPage + 1 < maxPage()) {
      pages.push(currPage + 1);
    }
    return pages;
  };

  /*
  * 
  */
  var fillLowerRange = function(pages) {
    var currPage = paginationInfo.page;
    // Max number of pagination links in the pagination box
    var maxPages = self.options.maxPages;
    // Give only 30% of free slots to lower
    var slots = Math.ceil((maxPages - 5) / 10 * 3);
    var level = 1;
    var k, page;
    // console.log('fillLowerRange', currPage, maxPages, slots);
    while (slots > 0) {
      k = Math.pow(10,level);
      // console.log('k',k);
      page = Math.floor((pages[0] - 1) / k) * k;
      // console.log('page is ', page, pages[0]);
      if (page) {
        if (page < pages[0]){
          pages.unshift(page);
          slots -= 1;
        }
        level += 1;
      } else {
        slots = 0;
      }
    }
    if (pages[0] != 1){
      pages.unshift(1);
    }
    return pages;
  };

  var fillUpperRange = function (pages) {
    var currPage = paginationInfo.page;
    var maxPages = self.options.maxPages;
    var slots = maxPages - pages.length - 1;
    var upperPages = [];
    var lastPage = pages[pages.length-1];

    var level = 1;
    var full = false;
    var k, page;
    while (!full && slots) {
      k = Math.pow(10,level);
      page = Math.ceil((lastPage + 1) / k) * k;
      if (page < maxPage()) {
        upperPages.push(page);
        lastPage = page;
        slots -= 1;
        level += 1;
      } else {
        full = true;
      }
    }
    
    var max = upperPages[0] || maxPage();
    while (slots) {
      page = pages[pages.length-1] + 1;
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

  var fillUpLowerRange = function(pages) {
    var currPage = paginationInfo.page;
    var idx = pages.indexOf(currPage - 1);
    var capacity = self.options.maxPages - pages.length;
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

  var maxPage = function() {
    return Math.ceil( (paginationInfo.totalCount) / (paginationInfo.perPage) );
  };
  
  var isPaginationInfoCompliant = function() {
    if (source && source.paginationInfo()) {
      var pinfo = source.paginationInfo();
      return pinfo.page && pinfo.perPage && pinfo.totalCount;
    }
    return false;
  };

  return self;
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