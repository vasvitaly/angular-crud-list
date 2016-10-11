# angular-crud-list
Table based CRUD list angular directive 
designed to work with [angular-data-source](https://github.com/vasvitaly/angular-data-source).

Current templates designed to work with bootstrap ~3

## Install

```shell
bower install vasvitaly/angular-crud-list
```


## Usage
1. Include the `crud-list.js` script and `crud-list.css` into your app.
2. Add `vasvitaly.angular-crud-list` as a module dependency to your app.

```javascript
angular.module('myApp', ['vasvitaly.angular-crud-list']);
```

### In a controller 

```javascript

controllers.controller("ItemsController", 
['$scope', 'vvvDataSource', 'Item', function($scope, DataSource, Item) {
  var dsOptions = {};
  var uc = $scope;
  $scope.uc = uc;

  $scope.dataSource = new DataSource(Item, dsOptions);
  $scope.dataSource.query();

  $scope.listOptions = {
    columns: [
      { 
        fieldId: 'id', 
        title: 'id',
        url: '/phones/:id',
        width: '130'
      },
      { 
        fieldId: 'name', 
        title: 'name'
      }
    ],
    listActions = {
      add: {
        title: 'add',
        url: '/items/add',
        templateUrl: 'yourAppFolder/addItem.html',
        action: function(){},
        confirmation: {
          text: 'Do you really want to add?',
          yesText: 'Sure',
          noText: 'No'
        },
        cssClass: 'btn-info btn-md'
      },
      customAction: {
        title: 'Detailed List',
        url: '/items/detailed',
        cssClass: 'btn-detailed btn-md'
      }
    },
    rowActions = {
      remove: {
        confirmation: {
          yesText: 'Remove completely',
          noText: 'No'
        }
      },
      edit: {
        templateUrl: 'yourAppFolder/editItem.html'
      },
      details: {
        title: 'more info',
        url: '/items/:id'
      }
    },
    modelName: 'phone'
  };
}]);

```

### In the template
```html
<vvv-crud-list data-options="listOptions" data-source="dataSource"></vvv-crud-list>
```

## API

### Available directive options:
* *data-options* - options hash set in your controller or main directive
* *data-source* - data providing service

#### options possible key-values
  * *columns* - array of objects, describing columns of the table
  * *listActions* - object describing list actions, e.g. 'new', 'go to other list', 'mark all'.
  * *rowActions* - object, describing row actions, e.g. 'edit', 'remove', 'more info'.
  * *modelName* - string with object name as it is in translation file. 

### Column description object 

  * **fieldId** - string, key to get data from row in dataSource. E.g. fieldId='name', data will be retrieved from dataSource.rows[i]['name']. 
  * **title** - string, column title, will be translated using i18n. 
    Translation schema: modelName.column.title | i18n : column.titlePrefix
  * **url** - string, url template, when present will transform column value into link, populating placeholders,
  looking :propertyName with row's property value. 
  * **width** - string or number, sets fixed width for the column using `width` property of the `th` tag 
  * **notSortable** - boolean or number (0|1), when true disables sorting feature on the column.
  * **templateUrl** - string, url of the custom template for the column cell. Could be used to show images or complex html code in the cell.


### listActions and rowActions hashes

Both action lists have the same possible attributes. 

```javascript
list: {
  add: {
    title: 'add',
    url: '/items/add',
    templateUrl: 'yourAppFolder/addItem.html',
    action: function(){},
    confirmation: {
      text: 'Do you really want to add?',
      yesText: 'Sure',
      noText: 'No'
    },
    cssClass: 'btn-info btn-md'
  }
}
```

Each key:value pair describes one action. Key is action name. Value is a action options hash.

#### Action options:

* **title** - Action title, will be get from action name when not set.
* **url** - Url template to make local or global link. Local link should start from `/`. 
  placeholders looks like :propertyName. :string will be treaten as placeholder only when row has appropriate property.  
* **templateUrl** - template url for inline actioning row. Good for inline edit form.
* **action** - action function. When present will be called as action.
  Directive has predefined action 'remove'. 
* **confirmation** - hash, to set up action's inline confirmation. Remove action has default confirmation.
```javascript
  confirmation: {
    text: 'Do you really want to add?',
    yesText: 'Sure',
    noText: 'No'
  }
```
  * **text** - string, confirmation text
  * **yesText** - string, agree button label, default value is 'sure'
  * **noText** - string, cancel button label, default value is 'cancel'

* **cssClass** - string, css classes to be added to the action link.
* **formatter** - function, if present will be called with cell value to make transformations, returned value will be showed in the cell. Could be handy for date formatting.
* **before** - function, called before action with row as argument.
* **after** - function, called after action with row or action call result (in case row not sent, for list actions) as argument.

#### Bundled actions

- Actions **new**, **edit** and **remove** have internal support.
- Actions have default css classes, **new** and **remove** have appropriate methods, which will be used as default in case no action or url set. 
- **New** and **edit** actions requires `templateUrl` for the edit item form.
- You can use **save** method in your form for saving item.
- Use **cancel** method to cancel creating/editing item.


### Translations

List supports translation of all the labels using [i18n-js](https://github.com/fnando/i18n-js) translation library and additional included filter **i18n**.

#### i18n

In html it can be used like any other angular filter:
```html
<div>{{'key' | i18n : 'prefix'}}</div>
```

* **key** - string, translation text key in the translations.js file, E.g. 'yes', 'no', 'remove', 'hello'...
* **prefix** - string, dot separated path to translation in the translations.js file.
  Also accepts some RAILS specific names as part of prefix: 
  * **ARA** - 'activerecord.attributes'
  * **ARM** - 'activerecord.models'
  * **enum** - 'enumerize.defaults'
  So, with it prefix will look like 'ARA.modelname'

When translation is not found it will fall back to the translation key. So, 

```html
<div>{{'Hello' | i18n : 'mainpage.greetings'}}</div>
```
when translation file has no 'mainpage.greetings.Hello' translation will output

```html
<div>Hello</div>
```
