describe('crud-list directive', function(){
  'use strict';
  var scope, elm, compile, listCustomActions, ds, rows, sortedByField, newRow;

  beforeEach(module('vasvitaly.angular-crud-list'));

  angular.module('vasvitaly.angular-crud-list').run(['$templateCache', function($templateCache) {          
    $templateCache.put('external/block.html',
      "<div class=\"block\" ng-bind=\"formattedValue(row, column)\"></div>"
    );
    $templateCache.put('editPhoneForm.html',
      '<form name="editForm">'+
      '<input name="phone.name" ng-model="row.name" required>'+
      '<input name="phone.weight" ng-model="row.weight">'+
      '<button ng-click="save(row, editForm)">Save</button>'+
      '<button ng-click="cancel(row)">Cancel</button>'+
      '</form>'
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
    newRow = {
      name: 'new item', 
      weight: 1
    }

    ds = jasmine.createSpyObj('dataSource', [
      'sortBy','isOrderedByField','sortingInfo','filteredRows',
      'newRecord', 'save']);
    ds.filteredRows.and.returnValue(rows);
    ds.newRecord.and.returnValue(newRow);
    ds.save.and.callFake(function(row, addToList, callBack){
      if (addToList) {
        rows.unshift(row);
      }
      if (callBack) {
        callBack(row);
      }
      return row;
    });

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
        new: { templateUrl: 'editPhoneForm.html' },
        newWithConfirmation: { 
          title: 'New confirmed',
          templateUrl: 'editPhoneForm.html',
          action: jasmine.createSpy('newWithConfirmation').and.callFake(function(){
            return {name: 'newWithConfirmationItem',weight: 100}
          }),
          confirmation: {
            text: 'Really?',
            yesText: 'Sure!',
            noText: 'No'
          },
          cssClass: 'new-with-confirmation'
        },
        detailedList: {title: 'Detailed List', url: 'pages/phones/detailed', cssClass: 'detailed'}
      },
      
      rowActions: {
        edit: { templateUrl: 'editPhoneForm.html' },
        remove: { },
        details: {
          url: '/phones/:id/details'
        }
      }
    };

  }));

  describe('List actions', function(){

    beforeEach(function(){
      compileDir();
    });

    it('shows new button', function(){
      var link = elm.find('.row.listActionsPanel a.btn.btn-primary');
      expect(link.length).toEqual(1);
      expect(link.text()).toEqual('new');
    });

    it('shows additional list action', function(){
      var link = elm.find('.row.listActionsPanel a.btn.detailed');
      expect(link.length).toEqual(1);
      expect(link.text()).toEqual('Detailed List');
      expect(link.attr('href')).toEqual('pages/phones/detailed');
    });

    describe('`new` button', function(){
      var panel, buttNew, newItemPanel;
      
      beforeEach(function(){
        panel = elm.find('.row.listActionsPanel');
        buttNew = panel.find('a.btn.btn-primary');
        buttNew.click();
        newItemPanel = panel.next('.row');
      });

      it('shows new item panel', function(){
        expect(newItemPanel.length).toEqual(1);
      });

      it('new item panel has header', function(){
        var newItemHeader = newItemPanel.find('h2.sub-header');
        expect(newItemHeader.length).toEqual(1);
        expect(newItemHeader.text()).toEqual('add_new.phone');
      });

      it('new item panel has phone form ', function(){
        var newItemHeader = newItemPanel.find('form');
        expect(newItemHeader.length).toEqual(1);
        expect(newItemHeader.attr('name')).toEqual('editForm');
      });

      describe('new item form', function(){
        var newItemForm;

        beforeEach(function(){
          newItemForm = newItemPanel.find('form');
        });

        it('has inputs', function(){
          var inputs = newItemForm.find('input');
          expect(inputs.length).toEqual(2);
        });

        it('inputs prefilled with newItem data', function(){
          var inputs = newItemForm.find("input");
          var i, input, inputEl, attrName;
          for (i=0; i<inputs.length; i++) {
            input = inputs[i];
            inputEl = angular.element(input);
            attrName = inputEl.attr('ng-model').replace('row');
            expect(inputEl.value).toEqual(newRow[attrName]);
          }
        });

        describe('can be saved', function(){
          var buttons;

          beforeEach(function(){
            buttons = newItemForm.find('button');
          });

          it('calls dataSource save method with new row on save', function(){
            angular.element(buttons[0]).click();
            expect(ds.save).toHaveBeenCalledWith(newRow, true, jasmine.any(Function));
          });

          it('doesnt call dataSource save method when row form has errors', function(){
            var input = newItemForm.find("input")[0];
            input.value = '';
            input = angular.element(input);
            input.change();
            angular.element(buttons[0]).click();
            expect(ds.save).not.toHaveBeenCalled();
          });

          it('closes form on success saving', function(){
            angular.element(buttons[0]).click();
            newItemPanel = panel.next('.new-item-block');
            expect(newItemPanel.length).toEqual(0);
          });
        });

        it('closes form on cancel', function(){
          var buttons = newItemForm.find('button');
          angular.element(buttons[1]).click();
          newItemPanel = panel.next('.new-item-block');
          expect(newItemPanel.length).toEqual(0);
        });

      });

    });

    describe('action With Confirmation', function(){
      var panel, buttNew, newItemPanel, confirmationBlock;
      
      beforeEach(function(){
        panel = elm.find('.row.listActionsPanel');
        buttNew = panel.find('.listActions a.new-with-confirmation');
        buttNew.click();
        confirmationBlock = panel.find('.action-confirmation-block');
      });

      it('hides action buttons', function(){
        var actionButtons = panel.find('.listActions a');
        expect(actionButtons.length).toEqual(0);
      });
      
      describe('confirmation block', function(){
        var confirmedAction, confirmationObj;

        beforeEach(function(){
          confirmedAction = scope.listOptions.listActions.newWithConfirmation;
          confirmationObj = confirmedAction.confirmation;
        });

        it('showed', function(){
          expect(confirmationBlock.length).toEqual(1);
        });

        it('has question text', function(){
          var question = confirmationBlock.find('.question');
          expect(question.text()).toEqual(confirmationObj.text);
        });

        
        describe('Yes button', function(){
          var button;
          
          beforeEach(function(){
            button = confirmationBlock.find('a.btn.btn-danger.btn-xs');
          });

          it('have appropriate text from confirmation setting', function(){
            expect(button.text()).toEqual(confirmationObj.yesText);
          });

          it('have `sure` text when confirmation setting text is blank', function(){
            confirmationObj.yesText = '';
            compileDir();
            expect(button.text()).toEqual('sure');
          });

          it('clicked calls action', function(){
            button.click();
            expect(confirmedAction.action).toHaveBeenCalled();
          });

          it('clicked hides confirmation block', function(){
            button.click();
            confirmationBlock = panel.find('.action-confirmation-block');
            expect(confirmationBlock.length).toBe(0);
          });

          it('clicked shows action buttons', function(){
            button.click();
            var buttons = panel.find('.listActions');
            expect(buttons.length).toBe(1);
          });


        });
        
        describe('No/cancel button', function(){
          var button;
          
          beforeEach(function(){
            button = confirmationBlock.find('button.btn.btn-default');
          });

          it('has no button', function(){
            expect(button.text()).toEqual(confirmationObj.noText);
          });

          it('clicked hides confirmation block', function(){
            button.click();
            confirmationBlock = panel.find('.action-confirmation-block');
            expect(confirmationBlock.length).toBe(0);
          });

          it('clicked shows action buttons', function(){
            button.click();
            var buttons = panel.find('.listActions');
            expect(buttons.length).toBe(1);
          });
        
        });

      });


    });


  });
    

  describe('shows row actions', function(){
    var actionCell;

    beforeEach(function(){
      compileDir();
      actionCell = elm.find('table.table tbody tr:first-child td.actions div.action-block'); 
    });
    
    it('shows actions column', function(){
      var expected = elm.find('.row.items-list table thead tr th:last-child');
      expect(expected.length).toEqual(1);
      expect(expected.text()).toEqual('actions');
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

  describe('Row actions', function(){
    var row, actionCell;

    beforeEach(function(){
      compileDir();
      row = elm.find('table.table tbody tr:first-child');
      actionCell = row.find('td.actions div.action-block'); 
    });
  
    describe('edit action', function(){
      var actionButton;
      
      beforeEach(function(){
        actionButton = actionCell.find("a.btn.btn-info.btn-md")[0];
        actionButton = angular.element(actionButton);
      });

      it('has correct title', function(){
        expect(actionButton.text()).toEqual('edit');
      });

      describe('clicked changes row template to edit', function(){
        var cells, cell;

        beforeEach(function(){
          actionButton.click();
          row = elm.find('table.table tbody tr:first-child');
          cells = row.find('td');
          cell = angular.element(cells[0]);
        });

        it('have only one cell', function(){
          expect(cells.length).toEqual(1);
        });

        it('has `row` class', function(){
          expect(cell.hasClass('row')).toEqual(true);
        });

        it('colspans on all the table', function(){
          expect(cell.attr('colspan')*1).toEqual(scope.listOptions.columns.length+1);
        });

        it('includes edit form ', function(){
          var form = cell.find('form');
          expect(form.length).toEqual(1);
        });

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
          expect(cell).toEqual(cellData.title);
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

