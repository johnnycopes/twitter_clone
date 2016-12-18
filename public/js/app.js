const app = angular.module('twitter-clone', ['ui.router', 'ngCookies']);

// ========================
// SERVICE
// ========================


app.factory('api', function($cookies, $http, $rootScope, $state) {
  let service = {};

  function setRootScopeLoginData() {
    let cookie = $cookies.getObject('cookieData');
    $rootScope.user_id = cookie.user_id;
    $rootScope.token = cookie.token;
    $rootScope.loggedIn = true;
  }

  // set cookie data to username or guest
  if (!$cookies.getObject('cookieData')) {
    $rootScope.user_id = null;
    $rootScope.loggedIn = false;
  }
  else {
    setRootScopeLoginData();
  }
  // logout
  $rootScope.logout = function() {
    $cookies.remove('cookieData');
    $rootScope.user_id = null;
    $rootScope.token = null;
    $rootScope.loggedIn = false;
    $state.go('home');
  };

  service.global = function() {
    let url = '/api/global';
    return $http({
      method: 'GET',
      url: url
    });
  };

  service.login = function(data) {
    let url = '/api/login';
    return $http({
      method: 'POST',
      data: data,
      url: url
    })
    .then(function(loggedIn) {
      // Store cookie and update login state variables
      $cookies.putObject('cookieData', loggedIn.data.info);
      setRootScopeLoginData();
    });
  };

  service.modifyFollowStatus = function(data) {
    let url = '/api/modifyFollowStatus';
    return $http({
      method: 'POST',
      data: data,
      url: url
    });
  };

  service.profile = function(userID) {
    let url = '/api/profile/' + userID;
    return $http({
      method: 'GET',
      url: url
    });
  };

  service.signup = function(data) {
    let url = '/api/signup';
    return $http({
      method: 'POST',
      data: data,
      url: url
    });
  };

  service.timeline = function() {
    let url = '/api/timeline';
    return $http({
      method: 'GET',
      params: {username: $rootScope.user_id},
      url: url
    });
  };

  service.writeTweet = function(message) {
    let url = '/api/timeline';
    let data = {
      user_id: $rootScope.user_id,
      text: message,
    };
    return $http({
      method: 'POST',
      data: data,
      url: url
    });
  }

  return service;
});



// ========================
// CONTROLLERS
// ========================

app.controller('GlobalController', function($scope, $state, api) {
  api.global()
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
    api.login(data)
      .then(function() {
        $state.go('profile' + data.username);
      })
      .catch(function(err) {
        console.log('Failed:', err.message);
      });
  };
});


app.controller('ProfileController', function($rootScope, $scope, $state, $stateParams, api) {
  // $scope.isFollowing = true;
  api.profile($stateParams.userID)
    .then((results) => {
      $scope.results = results.data;
      console.log(results.data);
      console.log(results.data.user.followers.indexOf($rootScope.user_id));
      if (results.data.user.followers.indexOf($rootScope.user_id) === -1) {
        $scope.isFollowing = false;
      }
      else {
        $scope.isFollowing = true;
      }
      console.log($scope.isFollowing);
    })
    .catch((err) => {
      console.error('Error!');
      console.log(err.message);
    });
  $scope.modifyFollowStatus = () => {
    let data = {
      userLoggedIn: $rootScope.user_id,
      userToFollow: $stateParams.userID,
      isFollowing: $scope.isFollowing
    };
    api.modifyFollowStatus(data)
      .then(() => {
        $state.go($state.current, {}, {reload: true});
      });
  }
});


app.controller('SignupController', function($scope, $state, api) {
  $scope.signUp = function() {
    let data = {
      username: $scope.username,
      email: $scope.email,
      password: $scope.password
    };
    api.signup(data)
      .then((results) => {
        return results;
      })
      .then(() => {
        return api.login(data);
      })
      .then(() => {
        $state.go('global');
      })
      .catch(function(err) {
        console.log('Failed: ', err.stack);
      });
  };
});


app.controller('TimelineController', function($scope, $state, api) {
  api.timeline()
    .then(function(results) {
      $scope.results = results.data.response;
    })
    .catch(function(err) {
      console.log('Error!');
      console.log((err.message));
    });

  $scope.writeTweet = function() {
    let message = $scope.tweet;
    api.writeTweet(message)
      .then(function() {
        console.log('front-end post successful');
        $scope.tweet = '';
        $state.go($state.current, {}, {reload: true});
      })
      // .then(function() {
      //   return api.login(data);
      // })
      // .then(function() {
      //   $state.go('global');
      // })
      .catch(function(err) {
        console.log('Failed: ', err.stack);
      });
  };

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
      url: '/profile/{userID}',
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
