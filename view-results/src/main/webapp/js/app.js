angular.module('app-services',[]);
angular.module('app-directives',[]);
var app = angular.module("ViewResults", ['app-services','app-directives','infinite-scroll','ngRoute']);

app.controller("MainController", function($scope, $route, $routeParams, $location) {
	$location.path('/SuiteRuns');
});

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/SingleTest/:testId', {
	  templateUrl: '/html/single-test-view.html',
	  controller: 'SingleTestController'
	}).when('/TestHistory', {
	  templateUrl: '/html/test-history-view.html',
	  controller: 'TestHistoryController'
	}).when('/RawTests', {
	  templateUrl: '/html/test-raw-controller.html',
	  controller: 'TestRawController'
	}).when('/SuiteRuns', {
	  templateUrl: '/html/suite-history-view.html',
	  controller: 'SuiteHistoryController'
	}).when('/SingleSuite/:suiteId', {
	  templateUrl: '/html/single-suite-view.html',
	  controller: 'SingleSuiteController'
	}).when('/RawSuiteRuns', {
	  templateUrl: '/html/test-raw-controller.html',
	  controller: 'RawSuiteController'
	})//.otherwise('/SuiteRuns');
  // configure html5 to get links working on jsfiddle
  $locationProvider.html5Mode(true);
});

app.controller("TestHistoryController", function(
	$location,
	$rootScope,
	$scope,
	$http) {

	$scope.rows = [];
	$scope.sortBy = 'value[0].status';
	$scope.sortReverse = false;
	$scope.limitRowsTo = 20;
	$scope.init = false;
	$scope.search = ''
	
	var fetchParams = {};
	fetchParams.search = '';
	fetchParams.offset = 0;
	fetchParams.chuckSize = 40;
	fetchParams.orderBy = 'order_num';
	fetchParams.orderByReverse = 'asc';// 'asc' or 'desc'

	$scope.$watch('search', function(newValue, oldValue) {
		fetchParams.search = $scope.search;
		fetch(true);
	});

	var sortClick = function($event, sortBy){
		fetchParams.orderBy = sortBy;
		fetchParams.orderByReverse = fetchParams.orderByReverse == 'asc' ? 'desc' : 'asc';
		fetch(true);
	};

	var loadMore = function(){
		$scope.init && fetch();
	};

	var onSearch = function(search){
		fetch();
	};

	var getRuns = function(row){
		var runs = [];

		var dates = row.execution_dates.split(',');
		var ids = row.ids.split(',');
		var users = row.users.split(',');
		var statuses = row.statuses.split(',');
		var len = dates.length

		for (var i = 0; i < len; i++) {
			runs.push({
				execution_date:dates[i],
				id:ids[i],
				user:users[i],
				status:statuses[i]
			});
		};

		runs.sort(function(a,b){
			return a.execution_date < b.execution_date ? 1 : -1;
		});

		return runs;
	};

	var fetch = function(override){
		if (override){
			fetchParams.offset = 0;
		}

		$scope.tablePromise = $http.get("/index/groupByTestName",{
			params:angular.extend({}, fetchParams)
		}).success(function(res){
			if (override){
				$scope.rows = res;
			}else{
				$scope.rows = $scope.rows.concat(res);
			}
			
			$scope.init = true;
		});
		with(fetchParams){offset+=chuckSize;};
	};

	$scope.sortClick = sortClick;
	$scope.getRuns = getRuns;
	$scope.loadMore = loadMore;

});

app.controller("SuiteHistoryController", function(
	$location,
	$rootScope,
	$scope,
	$http) {

	$scope.rows = [];
	$scope.sortBy = 'value[0].status';
	$scope.sortReverse = false;
	$scope.limitRowsTo = 20;
	$scope.init = false;
	$scope.search = ''
	$scope.hasMore = true;
	
	var fetchParams = {};
	fetchParams.search = '';
	fetchParams.offset = 0;
	fetchParams.chuckSize = 40;
	fetchParams.orderBy = 'order_num';
	fetchParams.orderByReverse = 'asc';// 'asc' or 'desc'

	$scope.$watch('search', function(newValue, oldValue) {
		fetchParams.search = $scope.search;
		$scope.hasMore = true;
		fetch(true);
	});

	var sortClick = function($event, sortBy){
		fetchParams.orderBy = sortBy;
		fetchParams.orderByReverse = fetchParams.orderByReverse == 'asc' ? 'desc' : 'asc';
		fetch(true);
	};

	var onRunClick = function(runId){
		$location.path('SingleTest/'+runId);
	};

	var loadMore = function(){
		if ($scope.init && $scope.hasMore) {
			fetch();
		}
	};

	var onSearch = function(search){
		fetch();
	};

	var getRuns = function(row){
		var runs = [];

		var dates = row.execution_dates.split(',');
		var ids = row.ids.split(',');
		var users = row.users.split(',');
		var statuses = row.statuses.split(',');
		var len = dates.length

		for (var i = 0; i < len; i++) {
			runs.push({
				execution_date:dates[i],
				id:ids[i],
				user:users[i],
				status:statuses[i]
			});
		};

		runs.sort(function(a,b){
			return a.execution_date < b.execution_date ? 1 : -1;
		});

		return runs;
	};

	var fetch = function(override){
		if (override){
			fetchParams.offset = 0;
		}

		$scope.tablePromise = $http.get("/index/getSuiteHistory",{
			params:angular.extend({}, fetchParams)
		}).success(function(res){
			if (override){
				$scope.rows = res;
			}else{
				$scope.rows = $scope.rows.concat(res);
			}

			if (res.length === 0) {
				$scope.hasMore = false;
			}
			
			$scope.init = true;
		});
		with(fetchParams){offset+=chuckSize;};
	};

	$scope.sortClick = sortClick;
	$scope.onRunClick = onRunClick;
	$scope.getRuns = getRuns;
	$scope.loadMore = loadMore;

});

app.controller("SingleTestController", function(
	dateService,
	$rootScope,
	$window,
	$routeParams,
	$scope,
	$http) {
	$scope.test = {};
	var testId = $routeParams.testId; 

	var setTest = function(test){
		var json = JSON.parse(test.json);
		var stacktrace = json.stackTrace
		var merged = angular.extend(test, json);
		var stacktrace = merged.stackTrace;

		delete merged.json;
		delete merged.stackTrace;

		$scope.test = test;
		$scope.stacktrace = stacktrace;
		$scope.formatDate = dateService.formatDate;
	};

	var goBack = function(){
		$window.history.back()
	};

	var getTestById = function(id){
		$scope.testPromise = $http.get("/index/getSingleTestInfo",{
			params:{
				id:id
			}
		}).success(function(res){
			setTest(res)
		});
	}

	getTestById(testId);

	$scope.goBack = goBack;
});

app.controller("TestRawController", function(
	$rootScope,
	$routeParams,
	$scope,
	$http) {
	$scope.limitRowsTo = 20;
	$scope.sortReverse = false;

	var clickSort = function(sortBy){
		$scope.sortBy = sortBy;
		$scope.sortReverse = !$scope.sortReverse;
	};

	var loadMore = function(){
		$scope.limitRowsTo+= 20;
	};

	setTimeout(function(){
		$scope.tablePromise = $http.get("/index/getTestResults").success(function(res){
			$scope.rows = res;
			$scope.keys = Object.keys(res[0]);
		});
	},0);

	$scope.loadMore = loadMore;
	$scope.clickSort = clickSort;
});

app.controller("SingleSuiteController", function($window,$routeParams,$scope,$http,dateService) {
	var suiteId = $routeParams.suiteId;

	var goBack = function(){
		$window.history.back()
	};

	var setSuite = function(suite){
		var json = JSON.parse(suite.json);
		var merged = angular.extend(suite, json);

		delete merged.json;

		$scope.suite = suite;
	};


	var getSuiteById = function(id){
		$scope.suitePromise = $http.get("/index/getSingleSuiteInfo",{
			params:{
				id:id
			}
		}).success(function(res){
			setSuite(res)
		});
	};

	var getSuiteRuns = function(id){
		$scope.testRunsPromise = $http.get("/index/getTestRunsForSuite",{
			params:{
				id:id
			}
		}).success(function(res){
			$scope.keys = Object.keys(res[0]);
			$scope.rows = res;
		});
	};

	var getSuiteTestRuns

	getSuiteById(suiteId);
	getSuiteRuns(suiteId);

	$scope.goBack = goBack;
	$scope.formatDate = dateService.formatDate;
});

app.controller("RawSuiteController", function($rootScope,$routeParams,$scope,$http) {
	$scope.limitRowsTo = 20;
	$scope.sortReverse = false;
	$scope.isSuite = true;

	console.log('RawSuiteController');

	var clickSort = function(sortBy){
		$scope.sortBy = sortBy;
		$scope.sortReverse = !$scope.sortReverse;
	};

	var loadMore = function(){
		$scope.limitRowsTo+= 20;
	};

	setTimeout(function(){
		$scope.tablePromise = $http.get("/index/getSuiteTestResults").success(function(res){
			$scope.rows = res;
			$scope.keys = Object.keys(res[0]);
		});
	},0);

	$scope.loadMore = loadMore;
	$scope.clickSort = clickSort;
});

angular.module('app-directives')
.directive('ngSortable', function(sortIconService){
	return {
		restrict: 'A',
		controller: function($scope,$element,$compile) {
			sortIconService.addElement($element);
			$compile($element.contents())($scope);
		}
	};
})
.directive('formatDate', function($compile){
	return {
		restrict: 'E',
		scope: { date: '&' },
		link: function($scope, $element, $attr) {
			var text = $scope.date();

			var formattedDate = moment(text).format('dddd MMMM Do YYYY, h:mm:ss a');
			$element.text(formattedDate);
		}
	};
})
.directive('status', function(){
	return {
		restrict: 'E',
		templateUrl: '/html/status-span.html',
		scope: { row: '&' },
		link: function($scope, $element, $attr){
			$scope.row = $scope.row();
			$scope.getHref = function(row){
				return 'suite' in $attr ? 'SingleSuite/'+row.id : 'SingleTest/'+row.id;
			}
		}
	};
})
.directive('ngTestName', function(){
	return {
		restrict: 'AEC',
		templateUrl: '/html/status-span.html',
		scope: { name: '&' },
		link: function($scope, $element, $attr){
			var pattern = /com.+\./;
			$element.text($scope.name().replace(pattern,''));
		}
	};
})
.directive('ngLoader', function(){
	return {
		restrict: 'A',
		scope: { ngLoader: '=' },
		link: function($scope, $element, $attr){
			$element.css('min-height','500px');
			$scope.$watch('ngLoader',function(promise){
				if (promise && promise.finally !== undefined) {
					var loaderHtml = [
						'<div class="cssload-loader">',
							'<div class="cssload-inner cssload-one"></div>',
							'<div class="cssload-inner cssload-two"></div>',
							'<div class="cssload-inner cssload-three"></div>',
						'</div>'
					].join('')

					var $overlay = $('<div class="overlay">');
					var $loader = $(loaderHtml);
					$element.append($overlay).append($loader);

					promise.finally(function(){
						$element.css('min-height','0px');
						$loader.remove();
						$overlay.fadeOut(1000,function(){
							$overlay.remove();
						});
					});
				}
			});
		}
	};
});

angular.module('app-services')
.service('sortIconService', function(){
	var elements = [];

	var icons = {
		init: '<i class="ng-cylce fa fa-sort"></i> ',
		asending: '<i class="ng-cylce fa fa-sort-asc"></i> ',
		desending: '<i class="ng-cylce fa fa-sort-desc"></i> '
	};

	var transitions = {
		init: 'desending',
		asending: 'desending',
		desending: 'asending'
	};

	var setNewIcon = function($element){
		$element.find('.ng-cylce').remove();
		$element.prepend(icons[$element.data('state')]);
	};

	var resetIcons = function($active){
		for (var i = 0; i < elements.length; i++) {
			var $element = elements[i];
			if (!$active || $element[0] !== $active[0]) {
				$element.data('state','init');
				setNewIcon($element);
			}
		}
	};

	var cyleIcon = function(e){
		var $element = $(e.currentTarget);
		var state = $element.data('state');
		$element.data('state',transitions[state]);
		resetIcons($element);
		setNewIcon($element);
	};

	var addElement = function($element){
		$element.data('state','init');
		$element.prepend(icons.init);
		$element.bind('click', cyleIcon);
		elements.push($element);
	};

	return {
		addElement: addElement,
		resetIcons: resetIcons
	};
}).service('dateService', function(){
	var formatDate = function(date){
		return moment(date).format('dddd MMMM Do YYYY, h:mm:ss a');
	};
	return {
		formatDate: formatDate
	};
});

$(function(){
	var $body = $('body');
	$body.on('mouseenter','[data-toggle="popover"]',function(e){
		var $this = $(this);
		var rawDate = $this.data('content');
		var formattedDate = moment(rawDate).format('dddd MMMM Do YYYY, h:mm:ss a');
		$this.attr('data-content',formattedDate)
		$this.popover('show');
	});
	$body.on('mouseleave','[data-toggle="popover"]',function(e){
		$(this).popover('hide');
	});
	$body.on('click','[data-toggle="popover"]',function(e){
		$(this).popover('destroy');
	});
});