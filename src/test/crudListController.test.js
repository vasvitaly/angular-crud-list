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
      modelName: 'phone',
      rowActions: {
        edit: { templateUrl: 'someUrl' },
        remove: {}
      },
      listActions: {
        new: { templateUrl: 'someUrl'}
      }
    };
    newRow = { id: null, name: 'new Item' };
    scope.dataSource = jasmine.createSpyObj('dataSource', ['newRecord', 'save', 'remove']);
    scope.dataSource.newRecord.and.returnValue(newRow);
    
  }));

  describe('checking RowActions', function(){
    
    it('show section when actions present',function(){
      createSut();
      expect(scope.showActions.rowActions).toEqual(true);
    });

    it('does not show section when no actions found',function(){
      scope.options.rowActions = {};
      createSut();
      expect(scope.showActions.rowActions).toEqual(false);
    });

    it('set action name from action key',function(){
      createSut();
      expect(scope.rowActions.edit.name).toEqual('edit');
    });

    it('set action title from action name when not set',function(){
      createSut();
      expect(scope.rowActions.edit.title).toEqual("edit");
    });

    it('set action title from action key when empty',function(){
      scope.options.rowActions.edit.title = '';
      createSut();
      expect(scope.rowActions.edit.title).toEqual('edit');
    });
    
    describe('when action has no action, url, templateUrl', function(){
      it('sets corresponding action from scope for `remove`', function(){
        createSut();
        expect(scope.rowActions.remove.action).toEqual(scope.remove);
      });

      it('adds it to errors', function(){
        scope.options.rowActions['details'] = {};
        createSut();
        expect(scope.errors[0]).toEqual('Action "details" has nothing to do.');
      });

      it('adds it to errors when action is not function', function(){
        scope.options.rowActions['details'] = {action: 'runDetails'};
        createSut();
        expect(scope.errors[0]).toEqual('Action "details" has nothing to do.');
      });

      it('adds it to errors when url is empty', function(){
        scope.options.rowActions['details'] = {url: ''};
        createSut();
        expect(scope.errors[0]).toEqual('Action "details" has nothing to do.');
      });
    });
  });

  describe('checking listActions', function(){
    
    it('show section when actions present',function(){
      createSut();
      expect(scope.showActions.listActions).toEqual(true);
    });

    it('does not show section when no actions found',function(){
      scope.options.listActions = {};
      createSut();
      expect(scope.showActions.listActions).toEqual(false);
    });

    it('set action name from action key',function(){
      createSut();
      expect(scope.listActions.new.name).toEqual('new');
    });

    it('set action title from action name when not set',function(){
      createSut();
      expect(scope.listActions.new.title).toEqual("new");
    });

    it('set action title from action key when empty',function(){
      scope.options.listActions.new.title = '';
      createSut();
      expect(scope.listActions.new.title).toEqual('new');
    });
    
    describe('when action has no action, url, templateUrl', function(){
      it('sets corresponding action from scope for `new`', function(){
        createSut();
        expect(scope.listActions.new.action).toEqual(scope.new);
      });

      it('adds it to errors', function(){
        scope.options.listActions['details'] = {};
        createSut();
        expect(scope.errors[0]).toEqual('Action "details" has nothing to do.');
      });

      it('adds it to errors when action is not function', function(){
        scope.options.listActions['details'] = {action: 'runDetails'};
        createSut();
        expect(scope.errors[0]).toEqual('Action "details" has nothing to do.');
      });

      it('adds it to errors when url is empty', function(){
        scope.options.listActions['details'] = {url: ''};
        createSut();
        expect(scope.errors[0]).toEqual('Action "details" has nothing to do.');
      });
    });

  });

  describe('when instantiated', function(){
    beforeEach(function(){
      createSut();
    });
  
    it('gets columns from options', function(){
      expect(scope.columns).toEqual(scope.options.columns);
    });

    it('gets modelName from options', function(){
      expect(scope.modelName).toEqual(scope.options.modelName);
    });


    it('returns row view template for row in default state', function(){
      expect(scope.rowTpl({state: null})).toEqual('crud-list/row.html');
    });

    it('returns row edit template for row in editing state', function(){
      expect(scope.rowTpl({state: 'edit'})).toEqual('crud-list/edit_row.html');
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
    
  });



  describe('formattedValue', function(){

    beforeEach(function(){
      createSut();
    });

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

  describe('newRowTpl', function(){

    beforeEach(function(){
      createSut();
    });

    it('returns `` when there is no new row', function(){
      scope.row = null;
      expect(scope.newRowTpl()).toEqual('');
    });

    it('returns `` when the new row.state is not `new` ', function(){
      scope.row = {};
      expect(scope.newRowTpl()).toEqual('');
    });

    it('returns add_form tpl when the new row.state is `new`', function(){
      scope.row = {state: 'new'};
      expect(scope.newRowTpl()).toEqual('crud-list/add_form.html');
    });

  });

  describe('creating new row', function(){

    beforeEach(function(){
      createSut();
    });

    it('should set scope.row with dataSource newRecord call result', function(){
      scope.new();
      expect(scope.dataSource.newRecord).toHaveBeenCalled();
      expect(scope.row).toEqual(newRow);
    });

    it('should return scope.row', function(){
      expect(scope.new()).toEqual(newRow);
    });

    it('should set scope.row.state to `new`', function(){
      scope.new();
      expect(scope.row.state).toBe('new');
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
      createSut();
    });

    it('returns false', function(){
      expect(scope.cancel(row)).toBe(false);
    });

    it('should nullify row.state and action', function(){
      scope.cancel(row);
      expect(row.state).toBe(null);
      expect(row.action).toBe(null);
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
      createSut();
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

      describe('on success save ', function(){

        it('should nullify row.state  ', function(){
          callSaveRow();
          expect(row.state).toBe(null);
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

  describe('removing row', function(){
    var row;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item'
      };
      createSut();
    });

    it('should call dataSource.remove with row.id', function(){
      scope.remove(row);
      expect(scope.dataSource.remove).toHaveBeenCalledWith(row.id);
    });
  });
    
  describe('actionUrl', function(){
    var row, action;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item',
        path: 'some-existing-item'
      };
      action = {
        url: 'some/item/:id/:path:non_existent_prop'
      };
      createSut();
    });

    it('should return empty string when action has no url', function(){
      expect(scope.actionUrl({}, row)).toEqual('');
    });

    it('should add # to action.url when url stated from /', function(){
      action.url = '/just/an/url';
      expect(scope.actionUrl(action,row)).toEqual('#'+action.url);
    });

    it('should not add # for other types of url', function(){
      action.url = 'http://just.an/url';
      expect(scope.actionUrl(action,row)).toEqual(action.url);
    });

    it('should replace all :propName placeholders with appropriate values from row', function(){
      expect(scope.actionUrl(action,row)).toEqual(action.url.replace(':id',row.id).replace(':path',row.path));
    });
  });

  describe('doAction', function(){
    var row, action;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item'
      };
      action = {
        name: 'myAction',
        action: jasmine.createSpy('myAction')
      };
      createSut();
    });

    it('should return false when action has no action or templateUrl', function(){
      expect(scope.doAction({}, row)).toBe(false);
    });

    it('should set confirmation and action to row when action has confirmation and return false', function(){
      action.confirmation = {yesText: 'Yes', noText: 'no'};
      expect(scope.doAction(action, row)).toBe(false);
      expect(row.confirmation).toEqual(action.confirmation);
      expect(row.action).toEqual(action);
    });

    it('should set row.state to action name when action has templateUrl', function(){
      action.templateUrl = 'someUrl';
      scope.doAction(action, row);
      expect(row.state).toBe(action.name);
    });

    it('should call doConfirmedAction with action and row', function(){
      spyOn(scope, 'doConfirmedAction');
      scope.doAction(action, row);
      expect(scope.doConfirmedAction).toHaveBeenCalledWith(action, row);
    });
  });

  describe('doConfirmedAction', function() {
    var row, action, newRowCreated;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item',
        prepared: false,
        before_called: false,
        after_called: false
      };
      newRowCreated  = {name: 'newRowCreated'};
      action = {
        name: 'myAction',
        action: function(row) {
          row.prepared = row.before_called;
          row.broken = row.after_called;
          row.action_performed = true;
          return row;
        },
        before: function(row) {
          if (row) {
            row.before_called = true;
          }
          return row;
        },
        after: function(row) {
          row.after_called = true;
          return row;
        }
      };
      createSut();
    });

    it('calls before callback before calling action',function(){
      scope.doConfirmedAction(action, row);
      expect(row.prepared).toEqual(true);
    });

    it('calls action with row',function(){
      scope.doConfirmedAction(action, row);
      expect(row.action_performed).toEqual(true);
    });

    it('calls after callback after calling action',function(){
      scope.doConfirmedAction(action, row);
      expect(row.broken).toEqual(false);
    });

    it('uses results of action call for after callback when row not sent',function(){
      action.action = function(row){
        return newRowCreated;
      }
      action.after = jasmine.createSpy('after');
      scope.doConfirmedAction(action);
      expect(action.after).toHaveBeenCalledWith(newRowCreated);
    });

    it('returns row when sent',function(){
      expect(scope.doConfirmedAction(action, row)).toEqual(row);
    });

    it('returns results of action when row have not sent',function(){
      action.action = function(row){
        return newRowCreated;
      }
      action.after = jasmine.createSpy('after');
      expect(scope.doConfirmedAction(action)).toEqual(newRowCreated);
    });

  });

  describe('helpers', function(){
    beforeEach(function(){
      createSut();
    });
    
    it('nullifies row.confirmation on cancelling Action', function(){
      var row = {confirmation:{text: 'some text'}};
      scope.cancelAction(row);
      expect(row.confirmation).toEqual(null);
    });

    it('actionCssClass returns action cssClass', function(){
      var action = {cssClass: 'someClass'};
      expect(scope.actionCssClass(action)).toEqual('someClass');
    });

    it('actionCssClass returns predefined cssClass for action.name', function(){
      var actionName;
      var expectedClasses = {
        new: 'btn-primary',
        remove: 'btn-danger btn-xs',
        edit: 'btn-info btn-md'
      };
      for (actionName in expectedClasses) {
        expect(scope.actionCssClass({'name': actionName})).toEqual(expectedClasses[actionName]);
      }
    });

    it('actionCssClass returns empty string when no class found for it', function(){
      expect(scope.actionCssClass({name: 'someSpecialAction'})).toEqual('');
    });

  });


  function createSut(){
    sut = controller(vvvCrudListController, {$scope: scope});
  };

});


