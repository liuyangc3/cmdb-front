/**
 * Created by web on 2015/8/25.
 */
'use strict';
// 给String增加startsWith function
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}

angular.module('cmdb', ['ngRoute', 'ui.bootstrap'])
    // 定义api前缀常量
    .constant('cmdbApiPrefix', '/api/v1/')

    .config(['$compileProvider', '$routeProvider', '$locationProvider',
        function($compileProvider, $routeProvider, $locationProvider) {
            // 使用 http 的情况下, 在 link 中不会出现unsafe
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
            $routeProvider
                .when('/', {
                    templateUrl: 'views/main.html'
                    }
                )
                .when('/service', {
                    templateUrl: 'views/service/listService.html',
                    controller: 'ServiceCtrl',
                    controllerAs: 'sCtrl',
                    resolve: {
                        services: ['ServiceService', function(ServiceService){
                            return ServiceService.list().then(function(resp){
                                return angular.fromJson(resp.data);
                            });
                        }]
                    }
                })
                .when('/service/add', {
                    templateUrl: 'views/service/addservice.html',
                    controller: 'ServiceAddCtrl',
                    controllerAs: 'sCtrl'
                })
                .when('/service/:service_id', {
                    templateUrl: 'views/service/service.html',
                    controller: 'ServiceIdCtrl',
                    controllerAs: 'sidCtrl'
                })
                .when('/project', {
                    templateUrl: 'views/project/listProject.html',
                    controller: 'ProjectCtrl',
                    controllerAs: 'pCtrl',
                    resolve: {
                        projects: ['ProjectService', function(ProjectService){
                            return ProjectService.list().then(function(resp){
                                return angular.fromJson(resp.data);
                            })
                        }]
                    }
                })
                .when('/project/add', {
                    templateUrl: 'views/project/addProject.html',
                    controller: 'ProjectAddCtrl',
                    controllerAs: 'pCtrl',
                    resolve: {
                        services: ['ServiceService', function (ServiceService) {
                            return ServiceService.list().then(function (resp) {
                                return angular.fromJson(resp.data);
                            });
                        }]
                    }
                })
                .when('/project/:project_id', {
                    templateUrl: 'views/project/project.html',
                    controller: 'ProjectIdCtrl',
                    controllerAs: 'pidCtrl'
                }).
                //when('/:ip/deployment', {
                //    templateUrl: 'views/deployment.html',
                //    controller: 'ProjectDeploymentCtrl as pdmCtrl'
                //}).
                //when('/:projectName/:ip/deployment/:deployDate/detail', {
                //    templateUrl: '../views/deploymentdetail.html',
                //    controller: 'ProjectDeploymentDetailCtrl as pddCtrl'
                //}).
                otherwise({
                    redirectTo: '/'
                });
            // 如果浏览器不支持html5,$locationProvider使用注释行配置
            //$locationProvider.html5Mode(false).hashPrefix('!');
            $locationProvider.html5Mode(true);
        }]);
