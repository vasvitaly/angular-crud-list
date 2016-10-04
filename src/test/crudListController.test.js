describe('vvvCrudListController', function(){
  'use strict';
  var sut, dataSource, listOptions, 
      scope, controller, newRow;

  beforeEach(module('vasvitaly.angular-crud-list'));
  
  beforeEach(inject(function($controller, $rootScope) {
    controller = $controller;
    scope = $rootScope;
    scope.options = {
      columns: [1,2,3],
      modelName: 'phone'
    };
    newRow = { id: null, name: 'new Item' };
    scope.dataSource = jasmine.createSpyObj('dataSource', ['newRecord', 'save', 'remove']);
    scope.dataSource.newRecord.and.returnValue(newRow);
    createSut();
  }));

  
  it('gets columns from options', function(){
    expect(scope.columns).toEqual(scope.options.columns);
    expect(scope.modelName).toEqual(scope.options.modelName);
  });

  it('returns row view template for row in default state', function(){
    expect(scope.rowTpl({editing: false})).toEqual('crud-list/row.html');
  });

  it('returns row edit template for row in editing state', function(){
    expect(scope.rowTpl({editing: true})).toEqual('crud-list/edit_row.html');
  });

  describe('cellTpl', function(){
    it('returns templateUrl when present in column options', function(){
      var url = 'someTemplateUrl';
      expect(scope.cellTpl({templateUrl: url})).toEqual(url);
    });

    it('returns render-link tpl', function(){
      expect(scope.cellTpl({url: 'someUrl'})).toEqual('crud-list/link.html');
    });

    it('returns plain_value template url', function(){
      expect(scope.cellTpl({})).toEqual('crud-list/plain_value.html');
    });

  });


  describe('formattedValue', function(){

    describe('when column.formatter is not defined', function(){
      var row;

      beforeEach(function(){
        row = {
          id: 123,
          name: 'My new phone',
          model: {
            id: 5,
            name: 'Nexus 5',
            make: {
              name:'Google'
            }
          }
        };
      });

      it('returns value of the column.fieldId', function(){
        expect(scope.formattedValue(row, {'fieldId': 'id'})).toEqual(row.id);
      });

      it('returns value of the . namespaced column.fieldId', function(){
        expect(scope.formattedValue(row, {'fieldId': 'model.id'})).toEqual(row.model.id);
      });

      it('returns value of the . namespaced column.fieldId', function(){
        expect(scope.formattedValue(row, {'fieldId': 'model.name'})).toEqual(row.model.name);
      });

      it('returns value of the deep . namespaced column.fieldId', function(){
        expect(scope.formattedValue(row, {'fieldId': 'model.make.name'})).toEqual(row.model.make.name);
      });

    });

    describe('when column.formatter is defined as function', function(){
      var row, formatter;

      beforeEach(function(){
        row = {
          id: 123,
          weight: 10
        };
        formatter = function(value) {
          return value+1;
        }
      });

      it('returns value of the column.fieldId formatted with formatter', function(){
        expect(scope.formattedValue(row, {
          'fieldId': 'weight', 
          'formatter': formatter
        })).toEqual(formatter(row.weight));
      });

    });

  });

  describe('addRowTpl', function(){

    it('returns button tpl when there is no new row', function(){
      scope.row = null;
      expect(scope.addRowTpl()).toEqual('crud-list/add_button.html');
    });

    it('returns button tpl when the new row is not in editing mode', function(){
      scope.row = {};
      expect(scope.addRowTpl()).toEqual('crud-list/add_button.html');
    });

    it('returns add_form tpl when the new row is in editing mode', function(){
      scope.row = {'editing': true};
      expect(scope.addRowTpl()).toEqual('crud-list/add_form.html');
    });

  });

  describe('newUrl', function(){
    it('returns options.newUrl prefixed with #', function(){
      scope.options.newUrl = 'some/item/new';
      expect(scope.newUrl()).toEqual('#'+scope.options.newUrl);
    });

    it('returns blank string when newUrl is not defined', function(){
      expect(scope.newUrl()).toEqual('');
    });
  });

  describe('adding new item', function(){

    it('returns true when options.newUrl is set', function(){
      scope.options.newUrl = 'some/item/new';
      expect(scope.new()).toBe(true);
    });

    describe('when options.newUrl is not set', function(){

      beforeEach(function(){
        scope.options.newUrl = null;
      });

      it('should return scope.row', function(){
        expect(scope.new()).toEqual(newRow);
      });

      it('should set scope.row with dataSource newRecord call result', function(){
        scope.new();
        expect(scope.dataSource.newRecord).toHaveBeenCalled();
        expect(scope.row).toEqual(newRow);
      });

      it('should set scope.row.editing true', function(){
        scope.new();
        expect(scope.row.editing).toBe(true);
      });

      it('should call options.onCreate with scope.row', function(){
        scope.options.onCreate = jasmine.createSpy('onCreate');
        scope.new();
        expect(scope.options.onCreate).toHaveBeenCalledWith(scope.row);
      });

    });

  });
    
  describe('editUrl', function(){
    it('returns options.editUrl prefixed with # and populated with row.id', function(){
      scope.options.editUrl = 'some/item/:id/edit';
      expect(scope.editUrl({id: 123})).toEqual('#'+scope.options.editUrl.replace(':id', 123));
    });

    it('returns blank string when options.editUrl is not defined', function(){
      expect(scope.editUrl()).toEqual('');
    });
  });

  describe('editing item', function(){
    var row;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item'
      };
    });

    it('returns true when options.editUrl is set', function(){
      scope.options.editUrl = 'some/item/:id/edit';
      expect(scope.edit(row)).toBe(true);
    });

    describe('when options.editUrl is not set', function(){

      beforeEach(function(){
        scope.options.editUrl = null;
      });

      it('should return false', function(){
        expect(scope.edit(row)).toEqual(false);
      });

      it('should set row.editing mode true', function(){
        scope.edit(row);
        expect(row.editing).toBe(true);
      });

      it('should call options.onEdit with row', function(){
        scope.options.onEdit = jasmine.createSpy('onEdit');
        scope.edit(row);
        expect(scope.options.onEdit).toHaveBeenCalledWith(row);
      });

    });
  });

  describe('cancel', function(){
    var row;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item',
        editing: true
      };
    });

    it('returns false', function(){
      expect(scope.cancel(row)).toBe(false);
    });

    it('should switch off row.editing mode', function(){
      expect(scope.cancel(row)).toBe(false);
    });
  });

  describe('save', function(){
    var row, form;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item',
        editing: true
      };
      form = {$invalid: true};
    });

    it('returns false when form has errors', function(){
      expect(scope.save(row, form)).toBe(false);
    });

    describe('when form has no errors', function(){

      beforeEach(function(){
        form.$invalid = false;
        row.errors = {name: 'should be filled'};
      });

      it('should clear row errors', function(){
        scope.save(row, form);
        expect(row.errors).toEqual({});
      });

      it('should call dataSource save method with row, flag to add row to rows list and callBack', function(){
        scope.save(row, form);
        expect(scope.dataSource.save).toHaveBeenCalledWith(row, true, jasmine.any(Function));
      });

      describe('on successs save ', function(){

        it('should switch row.editing mode off ', function(){
          callSaveRow();
          expect(row.editing).toBe(false);
        });

        it('should nullify scope.row if exactly it was saved', function(){
          scope.row = row;
          callSaveRow();
          expect(scope.row).toEqual(null);
        });

        it('should not nullify scope.row if just another row was saved', function(){
          var someNewRow = {id: null, name: 'some new row'};
          scope.row = someNewRow;
          callSaveRow();
          expect(scope.row).toEqual(someNewRow);
        });

        function callSaveRow() {
          var callback;
          scope.save(row, form);
          callback = scope.dataSource.save.calls.mostRecent().args[2];
          callback(row);
        }
      });

    });

  });

  describe('deleting row', function(){
    var row;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item'
      };
    });

    it('should call dataSource.remove with row.id', function(){
      scope.delete(row);
      expect(scope.dataSource.remove).toHaveBeenCalledWith(row.id);
    });
  });

  describe('actionUrl', function(){
    var row, action;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item'
      };
      action = {
        url: 'some/item/:id/url'
      };
    });

    it('should return empty string when action has no url', function(){
      expect(scope.actionUrl({},row)).toEqual('');
    });

    it('should return action.url as app url and populated with row.id', function(){
      expect(scope.actionUrl(action,row)).toEqual('#'+action.url.replace(':id', row.id));
    });
  });

  describe('doCustomAction', function(){
    var row, action;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item'
      };
      action = {
        action: jasmine.createSpy('customAction')
      };
    });

    it('should return false when action has no custom action', function(){
      expect(scope.doCustomAction({}, row)).toBe(false);
    });

    it('should return true when action has no custom action', function(){
      expect(scope.doCustomAction(action, row)).toBe(true);
    });

    it('should call action.action with row', function(){
      scope.doCustomAction(action, row);
      expect(action.action).toHaveBeenCalledWith(row);
    });
  });


  function createSut(){
    sut = controller(vvvCrudListController, {$scope: scope});
  };

});


