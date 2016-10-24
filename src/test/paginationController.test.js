describe('vvvPaginationController', function(){
  'use strict';
  var sut, scope, injector, paginationInfo, directive;

  beforeEach(module('vasvitaly.angular-pagination'));
  
  beforeEach(inject(function($injector, $rootScope) {
    injector = $injector;
    directive = injector.get('vvvPaginationDirective')[0];
    scope = $rootScope;
    scope.settings = {
      showPreviousPage: true,
      showNextPage: true,
      maxPages: 10
    };
    paginationInfo = {
      page: 1,
      perPage: 1,
      totalCount: 100
    };
    
    scope.source = jasmine.createSpyObj('dataSource', ['paginationInfo', 'paginate']);
    scope.source.paginationInfo.and.callFake(function(){
      return paginationInfo;
    });
    
  }));

  describe('is visible', function(){
    
    it('should not be visible when dataSource is not ready', function(){
      paginationInfo = {};
      createSut();
      expect(sut.isVisible()).toEqual(false);
    });

    it('should not be visible when paginationInfo is ready and maxPage < 1', function(){
      paginationInfo = { page: 1, perPage: 10, totalCount: 8 };
      createSut();
      expect(sut.isVisible()).toEqual(false);
    });

    it('should not be visible when paginationInfo is ready and maxPage = 1', function(){
      paginationInfo = { page: 1, perPage: 10, totalCount: 10 };
      createSut();
      expect(sut.isVisible()).toEqual(false);
    });

    it('should be visible when paginationInfo is ready and maxPage > 1', function(){
      createSut();
      expect(sut.isVisible()).toEqual(true);
    });

    it('should became visible when paginationInfo changed and maxPage > 1', function(){
      paginationInfo = { page: 1, perPage: 10, totalCount: 10 };
      createSut();
      expect(sut.isVisible()).toEqual(false);
      
      paginationInfo = { page: 1, perPage: 9, totalCount: 10 };
      scope.$apply();
      expect(sut.isVisible()).toEqual(true);
    });

  });

  describe('set Page', function(){
    beforeEach(function(){
      createSut();
    });

    it('should call paginate on source when page is in pages range and differs from current', function(){
      sut.setPage(2);
      expect(scope.source.paginate).toHaveBeenCalledWith(2);
    });

    it('should not call set page on source when page is not sent', function(){
      sut.setPage();
      expect(scope.source.paginate).not.toHaveBeenCalled();
    });

    it('should not call set page on source when page is <= 0', function(){
      sut.setPage(0);
      sut.setPage(-2);
      expect(scope.source.paginate).not.toHaveBeenCalled();
    });

    it('should not call set page on source when page is > maxPage', function(){
      sut.setPage(101);
      expect(scope.source.paginate).not.toHaveBeenCalled();
    });
  });

  describe('getting previous Page', function() {
    beforeEach(function(){
      createSut();
    });

    it('should return false when there is no previous page', function() {
      expect(sut.previousPage()).toEqual(false);
    });

    it('should return previous page', function() {
      paginationInfo.page = 2;
      scope.$apply();
      expect(sut.previousPage()).toEqual(1);
    });

    it('should return previous page', function() {
      paginationInfo.page = 50;
      scope.$apply();
      expect(sut.previousPage()).toEqual(49);
    });
  });


  describe('getting next Page', function() {
    beforeEach(function(){
      createSut();
    });

    it('should return false when there is no next page', function() {
      paginationInfo.page = 100;
      scope.$apply();
      expect(sut.nextPage()).toEqual(false);
    });

    it('should return next page', function() {
      expect(sut.nextPage()).toEqual(2);
    });

    it('should return next page', function() {
      paginationInfo.page = 99;
      scope.$apply();
      expect(sut.nextPage()).toEqual(100);
    });
  });

  describe('checking if have Previous Page', function() {
    beforeEach(function(){
      createSut();
    });

    it('should return false when options.showPreviousPage false', function() {
      scope.settings.showPreviousPage = false;
      paginationInfo.page = 2;
      createSut();
      expect(sut.havePreviousPage()).toEqual(false);
    });

    it('should return false when there is no previous page', function() {
      expect(sut.havePreviousPage()).toEqual(false);
    });

    it('should return true when have previousPage and option is true', function() {
      paginationInfo.page = 2;
      scope.$apply();
      expect(sut.havePreviousPage()).toEqual(true);
    });

  });


  describe('checking if have Next Page', function() {
    beforeEach(function(){
      createSut();
    });

    it('should return false when options.showNextPage false', function() {
      scope.settings.showNextPage = false;
      paginationInfo.page = 1;
      createSut();
      expect(sut.haveNextPage()).toEqual(false);
    });

    it('should return false when there is no next page', function() {
      paginationInfo.page = 100;
      scope.$apply();
      expect(sut.haveNextPage()).toEqual(false);
    });

    it('should return true when have previousPage and option is true', function() {
      paginationInfo.page = 99;
      scope.$apply();
      expect(sut.haveNextPage()).toEqual(true);
    });

  });

  describe('isCurrentPage', function() {
    beforeEach(function(){
      createSut();
    });

    it('is false when arg is not equal currentPage', function(){
      expect(sut.isCurrentPage(2)).toEqual(false);
    });

    it('is true when arg is equal currentPage', function(){
      expect(sut.isCurrentPage(1)).toEqual(true);
    });

    it('is true when arg is equal currentPage', function(){
      paginationInfo.page = 55;
      scope.$apply();
      expect(sut.isCurrentPage(55)).toEqual(true);
    });
  });

  describe('firstItemNumber', function() {
    var page, expected;
    beforeEach(function(){
      createSut();
    });

    it('returns number of the first line on the page', function(){
      paginationInfo.perPage = 3;
      for (page=1; page <= 100; page++) {
        expected = (page-1)*paginationInfo.perPage+1;
        paginationInfo.page = page;
        scope.$apply();
        expect(sut.firstItemNumber()).toEqual(expected);
      }
    });
  });


  describe('lastItemNumber', function() {
    var page, expected;
    beforeEach(function(){
      createSut();
    });

    it('returns number of the last line on the page', function(){
      paginationInfo.perPage = 3;
      for (page=1; page <= 100; page++) {
        expected = page*paginationInfo.perPage;
        paginationInfo.page = page;
        scope.$apply();
        expect(sut.lastItemNumber()).toEqual(expected);
      }
    });
  });

  it('returns totalCount of rows', function(){
    var total;
    paginationInfo.totalCount = Math.ceil(Math.random()*1000);
    createSut();
    expect(sut.totalCount()).toEqual(paginationInfo.totalCount);
    
    paginationInfo.totalCount = Math.ceil(Math.random()*1000);
    scope.$apply();
    expect(sut.totalCount()).toEqual(paginationInfo.totalCount);
  });


  describe('getting list of pages to show', function(){
    beforeEach(function(){
      paginationInfo = {
        page: 1,
        perPage: 10,
        totalCount: 100
      };
      scope.settings.maxPages = 10;
      createSut();
    });

    it('should show all pages when they fit maxPages', function(){
      for (paginationInfo.page = 1; paginationInfo.page <= 10; paginationInfo.page++) {
        scope.$apply();    
        expect(sut.pages()).toEqual([1,2,3,4,5,6,7,8,9,10]);
      }
    });

    it('should show all pages when they fit maxPages', function(){
      paginationInfo.perPage = 20;
      for (paginationInfo.page = 1; paginationInfo.page <= 5; paginationInfo.page++) {
        scope.$apply();
        expect(sut.pages()).toEqual([1,2,3,4,5]);
      }
    });

    describe('having more pages than maxPages', function(){

      beforeEach(function(){
        paginationInfo.totalCount = 120;
      });

      it('should show first, last, current pages, near range and upper range ', function(){
        for (paginationInfo.page = 1; paginationInfo.page <= 3; paginationInfo.page++) {
          scope.$apply();
          expect(sut.pages()).toEqual([1,2,3,4,5,6,7,8,10,12]);
        }
      });

      it('should show first, last, current pages, near range and upper range ', function(){
        for (paginationInfo.page = 4; paginationInfo.page <= 8; paginationInfo.page++) {
          scope.$apply();
          expect(sut.pages()).toEqual([1,3,4,5,6,7,8,9,10,12]);
        }
      });

      it('should show first, last, current pages, near range and upper range ', function(){
        for (paginationInfo.page = 9; paginationInfo.page <= 12; paginationInfo.page++) {
          scope.$apply();
          expect(sut.pages()).toEqual([1,4,5,6,7,8,9,10,11,12]);
        }
      });

    });

    describe('when totalCount is huge', function(){
      beforeEach(function() {
        paginationInfo.totalCount = 10000;
      });
  
      it('should show first, last, current pages, near range and progressive scale x10', function(){
        for (paginationInfo.page = 4; paginationInfo.page <= 4; paginationInfo.page++) {
          scope.$apply();
          expect(sut.pages()).toEqual([1,3,4,5,6,7,8,10,100,1000]);
        }
      });

      it('should show first, last, current pages, near range and progressive scale x10', function(){
        paginationInfo.page = 8;
        scope.$apply();
        expect(sut.pages()).toEqual([1,4,5,6,7,8,9,10,100,1000]);
      });

      it('should show first, last, current pages, near range and progressive scale x10', function(){
        paginationInfo.page = 9;
        scope.$apply();
        expect(sut.pages()).toEqual([1,8,9,10,11,12,13,20,100,1000]);
      });

      it('should show first, last, current pages, near range and progressive scale x10', function(){
        paginationInfo.page = 10;
        scope.$apply();
        expect(sut.pages()).toEqual([1,9,10,11,12,13,14,20,100,1000]);
      });

      it('should show first, last, current pages, near range and progressive scale x10', function(){
        paginationInfo.page = 15;
        scope.$apply();
        expect(sut.pages()).toEqual([1,10,14,15,16,17,18,20,100,1000]);
      });

      it('should show first, last, current pages, near range and progressive scale x10', function(){
        paginationInfo.page = 19;
        scope.$apply();
        expect(sut.pages()).toEqual([1,10,18,19,20,21,22,30,100,1000]);
      });

      it('should show first, last, current pages, near range and progressive scale x10', function(){
        paginationInfo.page = 20;
        scope.$apply();
        expect(sut.pages()).toEqual([1,10,19,20,21,22,23,30,100,1000]);
      });

      it('should show first, last, current pages, near range and progressive scale x10', function(){
        paginationInfo.page = 99;
        scope.$apply();
        expect(sut.pages()).toEqual([1,90,98,99,100,101,102,110,200,1000]);
      });

      it('should show first, last, current pages, near range and progressive scale x10', function(){
        paginationInfo.page = 100;
        scope.$apply();
        expect(sut.pages()).toEqual([1,90,99,100,101,102,103,110,200,1000]);
      });

      it('should show first, last, current pages, near range and progressive scale x10', function(){
        paginationInfo.page = 990;
        scope.$apply();
        expect(sut.pages()).toEqual([1,900,980,989,990,991,992,993,994,1000]);
      });

      it('should show first, last, current pages, near range and progressive scale x10', function(){
        paginationInfo.page = 998;
        scope.$apply();
        expect(sut.pages()).toEqual([1,900,990,994,995,996,997,998,999,1000]);
      });
  
    });



  });


  function createSut(){
    sut = injector.instantiate(directive.controller, {$scope: scope});
    scope.$apply();
  };

});