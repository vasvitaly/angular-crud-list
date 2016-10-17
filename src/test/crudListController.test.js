describe('vvvCrudListController', function(){
  'use strict';
  var sut, dataSource, listOptions, 
      scope, controller, newRow;

  beforeEach(module('vasvitaly.angular-crud-list'));
  
  beforeEach(inject(function($controller, $rootScope) {
    controller = $controller;
    scope = $rootScope;
    scope.options = {
      columns: [{fieldId: 'id'},{fieldId: 'name'}],
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
      scope.rowStates[101] = ['edit',{}];
      expect(scope.rowTpl({id: 101})).toEqual('crud-list/edit_row.html');
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

    it('returns `` when row not in edit state ', function(){
      scope.row = {};
      scope.rowStates['new'] = null;
      expect(scope.newRowTpl()).toEqual('');
    });

    it('returns add_form tpl when the new row is in `edit` state', function(){
      scope.row = {state: 'new'};
      scope.rowStates['new'] = ['edit',{}];
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

  });


  describe('cancel', function(){
    var row;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item'
      };
      createSut();
      scope.rowStates[row.id] = ['edit',{}];
    });

    it('should nullify state for the row', function(){
      scope.cancel(row);
      expect(scope.rowStates[row.id]).toBe(null);
    });
  });


  describe('save', function(){
    var row, form;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item'
      };
      form = {$invalid: true};
      createSut();
      scope.rowStates[row.id] = ['edit',{}];
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

        it('should nullify state for saved row', function(){
          callSaveRow();
          expect(scope.rowStates[row.id]).toEqual(null);
        });

        it('should nullify scope.row if exactly it was saved', function(){
          scope.row = row;
          callSaveRow();
          expect(scope.row).toEqual(null);
        });

        it('should not nullify scope.row when not new row was saved', function(){
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
      scope.rowStates[row.id] = ['edit', {}];
    });

    it('should call dataSource.remove with row.id', function(){
      scope.remove(row);
      expect(scope.dataSource.remove).toHaveBeenCalledWith(row.id);
    });

    it('should nullify state for saved row', function(){
      scope.remove(row);
      expect(scope.rowStates[row.id]).toEqual(null);
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
    var row, action, event;

    beforeEach(function(){
      row = {
        id: Math.round(Math.random()*100),
        name: 'some existing item'
      };
      action = {
        name: 'myAction',
        action: jasmine.createSpy('myAction'),
        url: '/#/url/for/myAction',
        templateUrl: 'myapp/templates/myAction.html'
      };
      event = jasmine.createSpyObj('event', ['stopImmediatePropagation', 'preventDefault']);
      createSut();
    });

    it('should stopImmediatePropagation on event if present', function(){
      scope.doAction(event, {}, row);
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
    });

    describe('when action has confirmation', function(){

      beforeEach(function(){
        action.confirmation = {
          text: '',
          yesText: 'Yes',
          noText: 'No'
        };
      });
      describe('and have not confirmed yet', function(){
        it('return false', function(){
          expect(scope.doAction(event, action, row)).toBe(false);
        });

        it('sets row state to confirmation of action', function(){
          scope.doAction(event, action, row);
          expect(scope.rowStates[row.id]).toEqual(['confirmation', action]);
        });

        it('preventDefault on event', function(){
          scope.doAction(event, action, row);
          expect(event.preventDefault).toHaveBeenCalled();
        });
      });

      describe('and confirmed', function(){
        var confirmed;

        beforeEach(function(){
          confirmed = true;
        });

        it('returns true', function(){
          expect(scope.doAction(event, action, row, confirmed)).toBe(true);
        });

      });
    });

    describe('when action has no confirmation', function(){

      beforeEach(function(){
        action.confirmation = null;
      });

      it('returns true', function(){
        expect(scope.doAction(event, action, row)).toBe(true);
      });

    });

    describe('when action has templateUrl', function(){

      it('should preventDefault on event ', function(){
        scope.doAction(event, action, row);
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should set row state to edit with action', function(){
        scope.doAction(event, action, row);
        expect(scope.rowStates[row.id]).toEqual(['edit', action]);
      });

    });

    describe('when action has no templateUrl', function(){
      beforeEach(function(){
        action.templateUrl = null;
      });

      it('should set row state to null', function(){
        scope.doAction(event, action, row);
        expect(scope.rowStates[row.id]).toBe(null);
      });

      it('should not preventDefault on event', function(){
        scope.doAction(event, action, row);
        expect(event.preventDefault).not.toHaveBeenCalled();
      });

      it('should preventDefault on event when action has no url', function(){
        action.url = '';
        scope.doAction(event, action, row);
        expect(event.preventDefault).toHaveBeenCalled();
      });

    });

    describe('doAction', function() {
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

      it('calls before-callback before calling action',function(){
        scope.doAction(event, action, row);
        expect(row.prepared).toEqual(true);
      });

      it('calls action with row',function(){
        scope.doAction(event, action, row);
        expect(row.action_performed).toEqual(true);
      });

      it('calls after-callback after calling action',function(){
        scope.doAction(event, action, row);
        expect(row.broken).toEqual(false);
      });

      it('uses results of action call for after callback when row not sent',function(){
        action.action = function(row){
          return newRowCreated;
        }
        action.after = jasmine.createSpy('after');
        scope.doAction(event, action);
        expect(action.after).toHaveBeenCalledWith(newRowCreated);
      });

    });

  });


  describe('helpers', function(){
    beforeEach(function(){
      createSut();
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

    describe('rowState', function() {
      it('returns empty string when no state set for row', function(){
        expect(scope.rowState({id: 'no_id'})).toEqual('');
      });

      it('returns empty string when state is not array', function(){
        scope.rowStates[1] = {};
        expect(scope.rowState({id: 1})).toEqual('');
      });

      it('returns row state when set', function(){
        scope.rowStates[1] = ['edit', {action:''}];
        expect(scope.rowState({id: 1})).toEqual('edit');
      });
    });

    describe('rowAction', function() {
      it('returns empty object when no state set for row', function(){
        expect(scope.rowAction({id: 'no_id'})).toEqual({});
      });

      it('returns empty object when action is not set in rowStates', function(){
        scope.rowStates[1] = {};
        expect(scope.rowAction({id: 1})).toEqual({});
      });

      it('returns row action when set', function(){
        var rowAction = {action: 'edit'};
        scope.rowStates[1] = ['edit', rowAction];
        expect(scope.rowAction({id: 1})).toEqual(rowAction);
      });
    });

    describe('rowConfirmation', function() {
      it('returns empty object when row has no curent action', function(){
        expect(scope.rowConfirmation({id: 'no_id'})).toEqual({});
      });

      it('returns empty object when row action has no confirmation', function(){
        scope.rowStates[1] = ['edit',{action:{action: ''}}];
        expect(scope.rowConfirmation({id: 1})).toEqual({});
      });

      it('returns row confirmation object when row action has it', function(){
        var rowConfirmation = {text: 'someText'};
        var rowAction = {action: 'edit', confirmation: rowConfirmation};
        scope.rowStates[1] = ['edit', rowAction];
        expect(scope.rowConfirmation({id: 1})).toEqual(rowConfirmation);
      });
    });

  });


  function createSut(){
    sut = controller(vvvCrudListController, {$scope: scope});
  };

});


