describe('i18n filter', function(){
  'use strict';
  var sut, filter;

  beforeEach(module('vasvitaly.i18n'));

  beforeEach(inject(function($filter){
    sut = $filter('i18n');
    window.I18n = jasmine.createSpyObj('I18n', ['t']);
  }));

  describe('when prefix not sent', function(){
    var key;
    
    beforeEach(function(){
      key = 'someKey';
      sut(key);
    });

    it('sends key and options defaultValue equal to key to i18n', function(){
      expect(I18n.t).toHaveBeenCalledWith(key, {defaultValue: key});
    });
    
  });

  describe('when prefix sent', function(){
    var key, prefix, shortCutPrefix;

    beforeEach(function(){
      key = 'someKey';
      prefix = 'some.translation.branch';
    })

    it('sends key when prefix is blank', function(){
      sut(key, '');
      expect(I18n.t).toHaveBeenCalledWith(key, {defaultValue: key});
    });
    
    it('adds key to the end of prefix and sends to i18n', function(){
      sut(key, prefix);
      expect(I18n.t).toHaveBeenCalledWith(prefix+'.'+key, {defaultValue: key});
    });

    it('replaces ARA shortcut at prefix start to activerecord.attributes', function(){
      var shortCutPrefix = 'ARA.'+prefix;
      sut(key, shortCutPrefix);
      expect(I18n.t).toHaveBeenCalledWith('activerecord.attributes.'+prefix+'.'+key, {defaultValue: key});
    });

    it('replaces ARM shortcut at prefix start to activerecord.models', function(){
      var shortCutPrefix = 'ARM.'+prefix;
      sut(key, shortCutPrefix);
      expect(I18n.t).toHaveBeenCalledWith('activerecord.models.'+prefix+'.'+key, {defaultValue: key});
    });

    it('replaces enum shortcut at prefix start to enumerize.defaults', function(){
      var shortCutPrefix = 'enum.'+prefix;
      sut(key, shortCutPrefix);
      expect(I18n.t).toHaveBeenCalledWith('enumerize.defaults.'+prefix+'.'+key, {defaultValue: key});
    });

    it('does not replaces shortcut not at start of prefix', function(){
      var shortcuts = ['ARA','ARM','enum'];
      for (var shortcut in shortcuts) {
        shortCutPrefix = ['start',shortcut,prefix].join('.');
        sut(key, shortCutPrefix);
        expect(I18n.t).toHaveBeenCalledWith(shortCutPrefix+'.'+key, {defaultValue: key});
      }
    });
    
  });


});