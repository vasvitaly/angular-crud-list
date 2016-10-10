describe('crud-list directive', function(){
  'use strict';
  var scope, elm, compile, listCustomActions, ds, rows, sortedByField;

  beforeEach(module('vasvitaly.angular-crud-list'));

  angular.module('vasvitaly.angular-crud-list').run(['$templateCache', function($templateCache) {          
    $templateCache.put('external/block.html',
      "<div class=\"block\" ng-bind=\"formattedValue(row, column)\"></div>"
    );
  }]);

  beforeEach(inject(function($rootScope, $compile){

    window.I18n = jasmine.createSpyObj('I18n', ['t']);
    window.I18n.t.and.callFake(function(key){
      return key.join('.');
    });

    scope = $rootScope.$new();
    compile = $compile;
    sortedByField = ''; 

    rows = [
      { id: 1,
        name: 'alpha item', 
        weight: 10
      }, {
        id: 2, 
        name: 'beta item', 
        weight: 8
      }
    ];

    ds = jasmine.createSpyObj('dataSource', ['sortBy','isOrderedByField','sortingInfo','filteredRows']);
    ds.filteredRows.and.returnValue(rows);
    ds.isOrderedByField.and.callFake(function(fieldId) {
      return sortedByField == fieldId;
    });
    ds.sortingInfo.and.returnValue({desc: false});

    elm = angular.element(
      '<vvv-crud-list data-options="listOptions" data-source="ds"></vvv-crud-list>'
    );

    scope.ds = ds;

    scope.listOptions = {
      columns: [
        { 
          fieldId: 'id', 
          title: 'id',
          url: '/phones/:id',
          width: '130'
        },
        { 
          fieldId: 'name',
          title: 'name',
          width: '300'
        },
        { 
          fieldId: 'weight',
          title: 'weight',
          templateUrl: 'external/block.html',
          notSortable: true
        }
      ],
      modelName: 'phone',
      listActions: {
        new: { templateUrl: 'pages/editPhoneForm.html' }
      },
      rowActions: {
        edit: { templateUrl: 'pages/editPhoneForm.html' },
        remove: { },
        details: {
          url: '/phones/:id/details'
        }
      }
    };

  }));

  describe('processing available actions option', function(){

    beforeEach(function(){
      compileDir();
    });

    it('shows create button', function(){
      var link = elm.find('.row.listActionsPanel a.btn.btn-primary');
      expect(link.length).toEqual(1);
      expect(link.text()).toEqual('new');
    });

    it('shows actions column', function(){
      var expected = elm.find('.row.items-list table thead tr th:last-child');
      expect(expected.length).toEqual(1);
      expect(expected.text()).toEqual('actions');
    });

    describe('shows row actions', function(){
      var actionCell;

      beforeEach(function(){
        actionCell = elm.find('table.table tbody tr:first-child td.actions div.action-block'); 
      });

      it('shows edit button', function(){
        var editBtn = actionCell.find("a.btn.btn-info.btn-md")[0];
        editBtn = angular.element(editBtn);
        expect(editBtn.text()).toEqual('edit');
      });

      it('shows remove button', function(){
        expect(actionCell.find("a.btn.btn-danger.btn-xs").text()).toEqual('remove');
      });

      it('shows additional action', function(){
        var expectedUrl = '#' + scope.listOptions.rowActions.details.url.replace(':id', ds.filteredRows()[0].id);
        var btn = actionCell.find("span:last-child a.btn");
        expect(btn.text()).toEqual('details');
        expect(btn.attr("href")).toEqual(expectedUrl);
      });
    });

  });

  describe('showing columns', function(){
    var headCells;

    beforeEach(function(){
      compileDir();
    });

    describe('renders header', function() {

      beforeEach(function(){
        headCells = elm.find('table.table thead tr th');
      });

      it('renders columns in right order', function(){
        var cell, cellData;
        
        for (var i=0; i < scope.listOptions.columns.length; i++) {
          cell = angular.element(headCells[i]).text();
          cellData = scope.listOptions.columns[i];
          expect(cell).toEqual(scope.listOptions.modelName + '.' + cellData.title);
        };
      });

      it('adds .clickable style for each sortable column', function(){
        var cell, cellData;
        
        for (var i=0; i < scope.listOptions.columns.length; i++) {
          cell = angular.element(headCells[i]);
          cellData = scope.listOptions.columns[i];
          expect(cell.hasClass('clickable')).toBe(!cellData.notSortable);
        };
      });

      it('adds span.icon each sortable column', function(){
        var cell, cellData;
        
        for (var i=0; i < scope.listOptions.columns.length; i++) {
          cell = angular.element(headCells[i]).find('span.icon');
          cellData = scope.listOptions.columns[i];
          expect(cell.length).toEqual(cellData.notSortable ? 0 : 1);
        };
      });

    });

    describe('renders data', function() {
      var rowCells;

      beforeEach(function(){
        rowCells = elm.find('table.table tbody tr:first-child td');
      });

      it('shows data cells in right order', function(){
        var cell, cellData;
        for (var i=0; i < scope.listOptions.columns.length; i++) {
          cell = angular.element(rowCells[i]).text();
          cellData = rows[0][scope.listOptions.columns[i].fieldId];
          expect(cell).toEqual(cellData.toString());
        };
      });

      it('creates link when column has url rule', function(){
        var cell, cellData;
        cellData = scope.listOptions.columns[0].url;
        cellData = '#' + cellData.replace(':id', rows[0].id);
      
        cell = angular.element(rowCells[0]).find('a');
        expect(cell.length).toEqual(1);
        expect(cell.attr('href')).toEqual(cellData);
      });

      it('renders external template for columns having templateUrl', function(){
        var cell, cellData;
        
        cellData = rows[0][scope.listOptions.columns[2].fieldId].toString();
        cell = angular.element(rowCells[2]).find('div.block');
        
        expect(cell.length).toEqual(1);
        expect(cell.text()).toEqual(cellData);
      });

    });

  });


  describe('sorting data', function(){
    var headCells;

    beforeEach(function(){
      compileDir();
      headCells = elm.find('table.table thead tr th');
    });

    it('calls dataSource sortBy method with fieldId when clicked on that column head', function(){
      angular.element(headCells[0]).click();
      expect(ds.sortBy).toHaveBeenCalledWith(scope.listOptions.columns[0].fieldId);
    });

    it('sorting icon state depends on sorting column', function(){
      var fId, i, icon;
      sortedByField = scope.listOptions.columns[0].fieldId;
      scope.$digest();
      for (i=0; i<scope.listOptions.columns.length; i++) {
        fId = scope.listOptions.columns[i].fieldId;
        icon = angular.element(headCells[i]).find('span.icon');
        expect(icon.hasClass('ordered')).toBe(fId == sortedByField);
      };
    });

    it('sorting icon ordered direction depends on datasource.sortingInfo', function(){
      sortedByField = scope.listOptions.columns[0].fieldId;
      ds.sortingInfo.and.returnValue({desc: true});
      scope.$digest();
      var icon = angular.element(headCells[0]).find('span.icon');
      expect(icon.hasClass('reverse')).toBeTruthy();
    });


  });

  function compileDir(){
    compile(elm)(scope);
    scope.$digest();
  };

});

