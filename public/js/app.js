const app = angular.module('twitter-clone', ['ui.router', 'ngCookies']);

// ========================
// SERVICE
// ========================

app.factory('api', function($cookies, $http, $rootScope, $state) {
  let service = {};

  // set cookie data to username or guest
  if (!$cookies.getObject('cookieData')) {
    $rootScope.displayName = null;
    $rootScope.loggedIn = false;
  }
  else {
    let cookie = $cookies.getObject('cookieData');
    $rootScope.displayName = cookie.username;
    $rootScope.token = cookie.token;
    $rootScope.loggedIn = true;
  }
  // logout
  $rootScope.logout = function() {
    $cookies.remove('cookieData');
    $rootScope.username = null;
    $rootScope.token = null;
    $rootScope.loggedIn = false;
    $state.go('home');
  };

  service.showGlobal = function() {
    let url = '/api/global';
    return $http({
      method: 'GET',
      url: url
    });
  };

  service.showLogin = function(data) {
    let url = '/api/login';
    return $http({
      method: 'POST',
      data: data,
      url: url
    })
    .then(function(loggedIn) {
      // Put information to be stored as cookies here
      $cookies.putObject('username', loggedIn.data.info.user_id);
      $cookies.putObject('token', loggedIn.data.info.token);
      $cookies.putObject('expiry', loggedIn.data.info.timestamp);
      console.log('Info: ', loggedIn.data.info);
    });
  };

  service.showProfile = function() {
    let url = '/api/profile';
    return $http({
      method: 'GET',
      params: {username: 'eliastheredbearded'},
      url: url
    });
  };

  service.showSignup = function(data) {
    let url = '/api/signup';
    return $http({
      method: 'POST',
      data: data,
      url: url
    });
  };

  service.showTimeline = function() {
    let url = '/api/timeline';
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

app.controller('GlobalController', function($scope, $state, api) {
  api.showGlobal()
    .then(function(results) {
      $scope.results = results.data.response;
    })
    .catch(function(err) {
      console.error('Error!');
      console.log(err.message);
    });
});


app.controller('HomeController', function($scope, $state, api) {

});


app.controller('LoginController', function($scope, $state, api) {
  $scope.login = function() {
    let data = {
      username: $scope.username,
      password: $scope.password
    };
    api.showLogin(data)
      .then(function() {
        $state.go('profile');
      })
      .catch(function(err) {
        console.log('Failed:', err.message);
      });
  };
});


app.controller('ProfileController', function($scope, $state, $stateParams, api) {
  let username = $stateParams.username;
  api.showProfile()
    .then(function(results) {
      $scope.results = results.data.response;
    })
    .catch(function(err) {
      console.error('Error!');
      console.log(err.message);
    });
});


app.controller('SignupController', function($scope, $state, api) {
  $scope.signUp = function() {
    let data = {
      username: $scope.username,
      email: $scope.email,
      password: $scope.password
    };
    api.showSignup(data)
      .then(function(results) {
        return results;
      })
      .then(function() {
        return api.showLogin(data);
      })
      .then(function() {
        $state.go('global');
      })
      .catch(function(err) {
        console.log('Failed: ', err.stack);
      });
  };
});


app.controller('TimelineController', function($scope, $state, api) {
  api.showTimeline()
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
      name: 'global',
      url: '/global',
      templateUrl: '/templates/global.html',
      controller: 'GlobalController'
    })
    .state({
      name: 'login',
      url: '/login',
      templateUrl: '/templates/login.html',
      controller: 'LoginController'
    })
    .state({
      name: 'profile',
      url: '/profile',
      templateUrl: '/templates/profile.html',
      controller: 'ProfileController'
    })
    .state({
      name: 'signup',
      url: '/signup',
      templateUrl: '/templates/signup.html',
      controller: 'SignupController'
    })
    .state({
      name: 'timeline',
      url: '/timeline',
      templateUrl: '/templates/timeline.html',
      controller: 'TimelineController'
    });
    $urlRouterProvider.otherwise('/');
});
