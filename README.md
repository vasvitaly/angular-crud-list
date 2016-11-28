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
or 
```javascript
angular.module('myApp', [
  'vasvitaly.angular-crud-list', 
  'vasvitaly.angular-pagination'
]);
```
to also have pagination.


### In a controller 

You should have vvvDataSource or similar to provide data for the list.

```javascript
angular.module('myApp').factory("Phone", ["$resource", function($resource) {
  return $resource('/examples/phones/:id.:format', { id: "@id", format: 'json' });
}
])
.controller('HomeCtrl', ['$scope', 'Phone', 'vvvDataSource', 
  function($scope, Phone, DataSource) {

  var options = {
    newItemDefaults: {
      name: 'new phone', 
      age: 1, 
      imageUrl: 'http://images.google.com/1', 
      snippet: 'Some description here'
    },
    filter: {name: 'Moto'},
    sorting: {fieldId: 'age', desc: true},
    clearFilter: {name: ''},
    perPage: 5,
    page: 1
  };

  $scope.ds = new DataSource(Phone, options);
  $scope.ds.query();
  $scope.filter = $scope.ds.filter;
```

```javascript
  # place for putting rows, selected by multiselect feature.
  $scope.selectedRows = [];

  # setting up list options
  $scope.listOptions = {
    # columns - list of columns you have list to show in.
    
    columns: [
      { 
        fieldId: 'id', # propery name in the data-object
        title: 'id', # title for the list header
        url: '/phones/:id', # url template to make showed data link
        width: '130' # when you need column to have fixed width (in px)
      },
      { 
        fieldId: 'imageUrl',
        title: 'image',
        # custom template to render cell
        templateUrl: '/examples/pages/home/phoneImage.html', 
        width: '100', 
        # disable sorting feature for this field
        notSortable: true 
      },
      { 
        fieldId: 'name',
        title: 'name',
        width: '300'
      },
      { 
        fieldId: 'age',
        title: 'Phone Age',
        width: '70'
      },
      { 
        fieldId: 'snippet',
        title: 'description'
      }
    ],
    
    # used to build right label translation path for i18n
    modelName: 'phone', 
    
    # actions for the whole list, showed in the panel above the list
    listActions: { 
      new: {
        # action template
        templateUrl: '/examples/pages/home/editPhoneForm.html' 
      },
      newDefaults: {
        # action name, when not present, got from action key
        action: 'new', 
        # action button title
        title: 'Rich new', 
        templateUrl: '/examples/pages/home/phoneFormRich.html',
        # action button css classes
        cssClass: 'btn-info', 
        # when you need confirmation for action 
        confirmation: { 
          yesText: 'Really do rich?',
          noText: 'Oh no!'
        }
      },
      detailed: {
        title: 'Detailed List',
        # action acting as a link
        url: '/phones', 
        cssClass: 'btn-success',
        confirmation: {
          text: 'Do you really want a lot of data? It could be slooowly....',
          yesText: 'Yeah really, man.',
          noText: 'No! I need it right now!'
        }
      },
      toggleMultiSelect: {
        title: 'Toggle Multiselect',
        action: function(row, scope) { # action method
          scope.toggleMultiSelect();
        },
        cssClass: 'btn-info'
      }
    },
    # actions, showed in action cell of each row
    rowActions: { 
      edit: {
        templateUrl: '/examples/pages/home/editPhoneForm.html',
        # condition for showing action button
        showedWhen: function(row){return row.age <= 10;} 
      },
      remove: {
        # condition for action button to be enabled
        activeWhen: function(row){return row.age > 10;} 
      },
      details: {
        title: 'details',
        url: '/phones/:id/details',
        cssClass: 'btn-success btn-md'
      }
    },
    # options for the multiselect feature
    multiSelect: { 
      # is enabled by default, you can enable in in runtime
      enabled: false, 
      # onChange event callback 
      onChange: function(scope){ 
        $scope.selectedRows = scope.getSelectedRowIds();
      }
    },
    # you can inject your controller scope for using in templates inside of crud-list
    # this option will be translated into $scope.upScope of directive.
    scope: $scope
  };
```

### In the template
```html
<vvv-crud-list data-options="listOptions" data-source="ds"></vvv-crud-list>
<vvv-pagination data-source="ds" data-options="{maxPages: 20, showInfo: true}">
</vvv-crud-list>
```
vvv-pagination - for the pagination.


## API

### Available directive options:
* *data-options* - options hash set in your controller or main directive
* *data-source* - data providing service

#### options possible key-values
  * *columns* - array of objects, describing columns of the table
  * *listActions* - object describing list actions, e.g. 'new', 'go to other list', 'mark all'.
  * *rowActions* - object, describing row actions, e.g. 'edit', 'remove', 'more info'.
  * *modelName* - string with object name as it is in translation file. 
  * *multiSelect* - object with multiselect feature options
  * *scope* - object, your controller scope, will be translated into $scope.upScope of directive.

### Column description object 

  * **fieldId** - string, key to get data from row in dataSource. E.g. fieldId='name', data will be retrieved from dataSource.rows[i]['name']. 
  * **title** - string, column title, will be translated using i18n. 
    Translation schema: modelName.column.title | i18n : column.titlePrefix
  * **url** - string, url template, when present will transform column value into link, populating placeholders, looking :propertyName with row's property value. 
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
    action: function(row, scope){},
    confirmation: {
      text: 'Do you really want to add?',
      yesText: 'Sure',
      noText: 'No'
    },
    cssClass: 'btn-info btn-md'
    showedWhen: function(row) {},
    activeWhen: function(row) {}
  }
}
```

Each key:value pair describes one action. Key is action name. Value is a action options hash.

#### Action options:

* **title** - Action title, will be get from action name when not set.
* **url** - Url template to make local or global link. Local link should start from `/`. 
  placeholders looks like :propertyName. :string will be treaten as placeholder only when row has appropriate property.  
* **templateUrl** - template url for inline actioning row. Good for inline edit form.
* **action** - action function. When present will be called as action. Takes two args: row, scope. For list actions row is null. Scope is directive's scope. You can access your controller scope as usual $scope.
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
* **showedWhen** - Function to set action visible/hidden. Takes row as argument.
* **activeWhen** - Function to set action active/diabled. Takes row as argument.
#### Bundled actions

- Actions **new**, **edit** and **remove** have internal support.
- Actions have default css classes, **new** and **remove** have appropriate methods, which will be used as default in case no action or url set. 
- **New** and **edit** actions requires `templateUrl` for the edit item form.
- You can use **save** method in your form for saving item.
- Use **cancel** method to cancel creating/editing item.

#### MultiSelect:

Multiselect allows you to select several rows at once using checkboxes.

##### Options
* **enabled** - Boolean. When true, multiselect will be shown on start.
* **onChange** - Callback on changing amount of selected rows. Takes directive's scope as argument.
  In the `scope.multiSelect.selectedRows` you can access selected rows ids. 

#### Handy API methods

* **scope.toggleMultiSelect** - toggles multiSelect feature.
* **scope.enableMultiSelect** - Enables multiSelect feature.
* **scope.disableMultiSelect** - Disables multiSelect feature.
* **scope.multiSelectToggleAll** - Selects/deselects all rows.
* **scope.checkAllRowsSelected** - Checks whether all rows selected.
* **scope.getSelectedRowIds** - Returns array of selected row ids.


### Pagination
Pagination designed to work with angular-data-source and angular-crud-list.
Current templates designed to work with bootstrap ~3.

## Usage
1. Include the `crud-list.js` script and `crud-list.css` into your app.
2. Add `vasvitaly.angular-crud-list` as a module dependency to your app.

```javascript
angular.module('myApp', [
  'vasvitaly.angular-pagination'
]);
```
### In the template
```html
<vvv-pagination data-source="ds" data-options="{maxPages: 20, showInfo: true}">
</vvv-crud-list>
```
## API
### Available directive options:
* *data-options* - options hash set in your controller or main directive
* *data-source* - data providing service

#### data-options options
* **maxPages** - Integer. How many page links to show.
* **showInfo** - Boolean. Whether to show Pagination information, 
Rows `from` - `to` of `totalRows`
* **showPreviousPage** - Boolean. Whether to show Previous Page link.
* **showNextPage** - Boolean. Whether to show Next Page link.

It gets `totalCount` and `perPage` informartion from `data-source`.

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
