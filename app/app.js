'use strict';

var app = angular.module('loginApp', [
  'ui.router'
])
.config(function($stateProvider, $urlRouterProvider)
{
  $stateProvider
    // available for anybody
    .state('public',{
        url : '/public',
        template : '<div>public</div>',
    })
    // just for authenticated
    .state('main',{
        url : '/main',
        template : '<div>main for authenticated</div>',
        data : {requireLogin : true },
    })
    // just for authenticated
    .state('other',{
        url : '/other',
        template : '<div>other for authenticated</div>',
        data : {requireLogin : true },
    })
    // the log-on screen
    .state('login',{
        url : '/login',
        templateUrl : 'views/login.html',
        controller : 'LoginCtrl',
    })
    
  $urlRouterProvider.otherwise("/other");
})
.factory('Auth',function() { return { isLoggedIn : false}; })
.service('ParseService', function ($http) {
    var baseURL = "https://parseapi.back4app.com/";
    //var baseURL = "https://api.parse.com/1/";
    var authenticationHeaders = {
        "x-parse-application-id": "appid",
        "x-parse-rest-api-key": "appkey"
    };
    this.login = function(credentials) {
        var settings = {
            headers: authenticationHeaders,
            // params are for query string parameters
            params: {
                "username": (credentials && credentials.username),
                "password": (credentials && credentials.password)
            }
        };
        var promise = $http.get(baseURL + 'login', settings)
        .then(function (response) {
            // In the response resp.data contains the result
            // check the console to see all of the data returned
            console.log('login', response);
            return response.data;
        });
        return promise;
    }
})
.controller('LoginCtrl',['$scope', 'Auth', 'ParseService', function($scope, Auth, ParseService) 
{ 
    $scope.credentials = {};
    //$scope.auth = Auth;
    $scope.doLoginAction =  function () {
            ParseService.login($scope.credentials).then(function (_loggedInUser) {
            // successful response from the service, the user is
            // logged in and we have a user object
            alert("User Logged In " + _loggedInUser.username);
            Auth.isLoggedIn = true;
        }, function error(_errorResponse) {
            // if error occurred anywhere above, this code will
            // be executed
            alert("ERROR " + _errorResponse);
            Auth.isLoggedIn = false;
        });
    }
}])

app.run(function ($rootScope, $state, $location, Auth) {
  
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
      
      var shouldLogin = toState.data !== undefined
                    && toState.data.requireLogin 
                    && !Auth.isLoggedIn ;
      
      // NOT authenticated - wants any private stuff
      if(shouldLogin)
      {
        $state.go('login');
        event.preventDefault();
        return;
      }
      
      
      // authenticated (previously) comming not to root main
      if(Auth.isLoggedIn) 
      {
        var shouldGoToMain = fromState.name === ""
                          && toState.name !== "main" ;
          
        if (shouldGoToMain)
        {
            $state.go('main');
            event.preventDefault();
        } 
        return;
      }
      
      // UNauthenticated (previously) comming not to root public 
      var shouldGoToPublic = fromState.name === ""
                        && toState.name !== "public"
                        && toState.name !== "login" ;
        
      if(shouldGoToPublic)
      {
          $state.go('public');console.log('p')
          event.preventDefault();
      } 
      
      // unmanaged
    });
});
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    