/**
@toc
1. setup - whitelist, appPath, html5Mode
*/

'use strict';

angular.module('myApp', [
'ngResource',
'ngRoute', 	//additional angular modules
'vasvitaly.angular-data-source',
'vasvitaly.angular-crud-list',
'vasvitaly.angular-pagination'
]).
config(['$routeProvider', '$locationProvider', '$compileProvider', function($routeProvider, $locationProvider, $compileProvider) {
	/**
	setup - whitelist, appPath, html5Mode
	@toc 1.
	*/
	$locationProvider.html5Mode(false);		//can't use this with github pages / if don't have access to the server
	
	// var staticPath ='/';
	var staticPath;
	// staticPath ='/angular-services/angular-data-source/';		//local
	staticPath ='/examples/';		//nodejs (local)
	// staticPath ='/angular-data-source/';		//gh-pages
	var appPathRoute ='/';
	var pagesPath = staticPath + 'pages/';
	
	
	$routeProvider.when(appPathRoute+'home', {templateUrl: pagesPath+'home/home.html'});
	$routeProvider.when(appPathRoute+'phones', {templateUrl: pagesPath+'home/phones.html'});

	$routeProvider.otherwise({redirectTo: appPathRoute+'home'});
	
}]);