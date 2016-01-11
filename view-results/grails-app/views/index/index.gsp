<!DOCTYPE html>
<html ng-app="ViewResults">
<head>
	<title>Test</title>
	<base href="/index/index">
	<link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="/css/app.css">
	<link rel="stylesheet" href="/font-awesome-4.3.0/css/font-awesome.min.css">
	%{-- jquery --}%
	<script src="/js/jquery-2.1.4.min.js"></script>
	%{-- angular --}%
	<script src="/js/angular.min.js"></script>
	<script src="/js/angular-route.min.js"></script>
	<script src="/js/ng-infinite-scroll.min.js"></script>
	%{-- bootstrap --}%
	<script src="/js/bootstrap.min.js"></script>
	<script src="/js/moment.min.js"></script>
</head>
<body ng-controller="MainController">
	
	
	<div class="container-fluid">
	<div class="row">
		<div id="sidenav" class="col-md-1">
			<a href="TestHistory">TestHistory</a>
			<a href="RawTests">RawTestsRuns</a>
			<a href="SuiteRuns">SuiteHistory</a>
			<a href="RawSuiteRuns">RawSuiteRuns</a>
		</div>
		<div class="col-md-11">
			<div id="view-wrap" ng-view></div>
		</div>
	</div>	
	</div>
	
	<script src="/js/ace/ace.js"></script>
	<script src="/js/app.js"></script>
</body>
</html>
