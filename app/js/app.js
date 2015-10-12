/**
 * Created by web on 2015/8/25.
 */
angular.module('cmdb', ['ngRoute', 'ui.bootstrap'])
.value('utils',{
        join: function() {
            var path = "/api/v1";
            angular.forEach(arguments, function(arg){
                path = path + '/' + arg;
            });
            return path
        }
})

.config(['$routeProvider', '$locationProvider',
    function($routeProvider,$locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl as mainCtrl',
                resolve: {
                    inc: function(MainService){
                        return MainService.fuck()
                    }
                }
            })
            .when('/service', {
                templateUrl: 'views/service/service.html',
                controller: 'ServiceCtrl as sCtrl',
                resolve: {
                    services: function($http, util){
                        return $http.get(
                            util.join('service', 'list')
                        )
                        .then(function (resp) {
                            return resp.data
                        })
                    }
                }
            })
            .when('/service/add',{
                templateUrl: 'views/service/addservice.html',
                controller: 'ServiceCtrl as sCtrl'
            })
            .when('/service/:service_id',{
                templateUrl: 'views/service/service_id.html',
                controller: 'ServiceCtrl as sCtrl'
            })
            .when('/project/:project_id',{
                templateUrl: 'views/project.html',
                controller: 'ProjectCtrl as pCtrl'
            }).
            when('/:ip/deployment',{
                templateUrl: 'views/deployment.html',
                controller: 'ProjectDeploymentCtrl as pdmCtrl'
            }).
            when('/:projectName/:ip/deployment/:deployDate/detail',{
                templateUrl: '../views/deploymentdetail.html',
                controller: 'ProjectDeploymentDetailCtrl as pddCtrl'
            }).
            otherwise({
                redirectTo: '/'
            });
        // 如果浏览器不支持html5,$locationProvider使用注释行配置
        //$locationProvider.html5Mode(false).hashPrefix('!');
        $locationProvider.html5Mode(true);
    }]);
