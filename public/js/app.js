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
  return service;
});




// ========================
// CONTROLLERS
// ========================

// why don't ES6 arrow functions work here?

app.controller('HomeController', ($scope, $state, TwitterFactory) => {

});

app.controller('ProfileController', ($scope, $state, TwitterFactory) => {

});

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

app.controller('FeedController', ($scope, $state, TwitterFactory) => {

});



// ========================
// STATES
// ========================

app.config(($stateProvider, $urlRouterProvider) => {
  $stateProvider
    .state({
      name: 'home',
      url: '/',
      templateUrl: 'img/tiger_face.svg',
      controller: 'HomeController'
    })
    .state({
      name: 'profile',
      url: '/profile',
      templateUrl: 'profile.html',
      controller: 'ProfileController'
    })
    .state({
      name: 'global',
      url: '/global',
      templateUrl: '/templates/global.html',
      controller: 'GlobalController'
    })
    .state({
      name: 'feed',
      url: '/feed',
      templateUrl: 'feed.html',
      controller: 'FeedController'
    });

    $urlRouterProvider.otherwise('/');
});
