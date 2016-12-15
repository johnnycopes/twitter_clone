const app = angular.module('twitter-clone', ['ui.router']);

// ========================
// SERVICE
// ========================

app.factory('TwitterFactory', function($http, $state) {
  let service = {};

  service.showGlobal = function() {
    let url = '/global';
    return $http({
      method: 'GET',
      url: url
    });
  };

  service.showProfile = function() {
    let url = '/profile';
    return $http({
      method: 'GET',
      params: {username: 'eliastheredbearded'},
      url: url
    });
  };

  service.showTimeline = function() {
    let url = '/timeline';
    return $http({
      method: 'GET',
      params: {username: 'eliastheredbearded'},
      url: url
    });
  };

  return service;
});




// ========================
// CONTROLLERS
// ========================

app.controller('GlobalController', function($scope, $state, TwitterFactory) {
  TwitterFactory.showGlobal()
    .then(function(results) {
      $scope.results = results.data.response;
    })
    .catch(function(err) {
      console.error('Error!');
      console.log(err.message);
    });
});


app.controller('HomeController', ($scope, $state, TwitterFactory) => {

});

app.controller('LoginController', function($scope, $state, TwitterFactory) {

});

app.controller('ProfileController', function($scope, $state, TwitterFactory) {
  TwitterFactory.showProfile()
    .then(function(results) {
      $scope.results = results.data.response;
    })
    .catch(function(err) {
      console.error('Error!');
      console.log(err.message);
    });
});


app.controller('SignupController', function($scope, $state, TwitterFactory) {

});

app.controller('TimelineController', function($scope, $state, TwitterFactory) {
  TwitterFactory.showTimeline()
    .then(function(results) {
      $scope.results = results.data.results;
    })
    .catch(function(err) {
      console.log('Error!');
      console.log((err.message));
    });
});



// ========================
// STATES
// ========================

app.config(($stateProvider, $urlRouterProvider) => {
  $stateProvider
    .state({
      name: 'home',
      url: '/',
      templateUrl: '/templates/home.html',
      controller: 'HomeController'
    })
    .state({
      name: 'profile',
      url: '/profile',
      templateUrl: '/templates/profile.html',
      controller: 'ProfileController'
    })
    .state({
      name: 'global',
      url: '/global',
      templateUrl: '/templates/global.html',
      controller: 'GlobalController'
    })
    .state({
      name: 'timeline',
      url: '/timeline',
      templateUrl: '/templates/timeline.html',
      controller: 'TimelineController'
    })
    .state({
      name: 'signup',
      url: '/signup',
      templateUrl: '/templates/signup.html',
      controller: 'SignupController'
    })
    .state({
      name: 'login',
      url: '/login',
      templateUrl: '/templates/login.html',
      controller: 'LoginController'
    })
    ;

    $urlRouterProvider.otherwise('/');
});
