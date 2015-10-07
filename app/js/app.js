/**
 * Created by web on 2015/8/25.
 */
angular.module('cmdb', ['ngRoute'])
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
                controller: 'MainCtrl as mainCtrl'
            })
            .when('/service/add',{
                templateUrl: 'views/service/service_add.html',
                controller: 'ServiceCtrl'
            })
            .when('/service/:service_id',{
                templateUrl: 'views/service.html',
                controller: 'ServiceCtrl'
            })
            .when('/:project/:service',{
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
