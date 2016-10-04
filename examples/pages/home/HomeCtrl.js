'use strict';

angular.module('myApp').factory("Phone", ["$resource", function($resource) {
  return $resource('/examples/phones/:id.:format', { id: "@id", format: 'json' });
}
])
.controller('HomeCtrl', ['$scope', 'Phone', 'vvvDataSource', function($scope, Phone, DataSource) {

  var options = {
    newItemDefaults: {name: '', colors: [{name: '', name_lat: '', show_in_list: 0}]},
    filter: {name: 'Moto'},
    sorting: {fieldId: 'age', desc: true},
    clearFilter: {name: ''},
    perPage: 5,
    page: 1
  };

  var uc = $scope;
  $scope.uc = uc;

  $scope.ds = new DataSource(Phone, options);
  $scope.ds.query();
  $scope.filter = $scope.ds.filter;

  $scope.listOptions = {
    columns: [
      { 
        fieldId: 'id', 
        title: 'id',
        url: '/phones/:id',
        width: '130'
      },
      { 
        fieldId: 'imageUrl',
        title: 'image',
        templateUrl: '/examples/pages/home/phoneImage.html',
        width: '100',
        notSortable: true
      },
      { 
        fieldId: 'name',
        title: 'name',
        width: '300'
      },
      { 
        fieldId: 'age',
        title: 'age',
        width: '70'
      },
      { 
        fieldId: 'snippet',
        title: 'description'
      }
    ],
    modelName: 'phone',
    editTemplateUrl: '/examples/pages/home/editPhoneForm.html'

  };
  $scope.listCustomActions = [
    {
      title: 'details',
      url: '/phones/:id/details'
    }
  ];

}]);