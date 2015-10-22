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

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str){
        return this.slice(-(str.length)) == str;
    };
}

if (typeof String.prototype.format != 'function') {
    String.prototype.format = function(){
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(m, i){
            return typeof args[i] != 'undefined' ? args[i] : m;
        });
    }
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
                    templateUrl: 'views/main.html',
                    controller: 'MainCtrl',
                    controllerAs: 'mCtrl',
                    resolve: {
                        services: ['ServiceService', function(ServiceService){
                            return ServiceService.list().then(function(resp){
                                return angular.fromJson(resp.data);
                            });
                        }],
                        projects: ['ProjectService', function(ProjectService){
                            return ProjectService.list().then(function(resp){
                                return angular.fromJson(resp.data);
                            })
                        }]
                    }
                })
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
                    controllerAs: 'sidCtrl',
                    resolve: {
                        rawData: ['$route', 'dataTransService', 'ServiceService',
                            function($route, dataTransService, ServiceService) {
                                return ServiceService.get($route.current.params.service_id)
                                    .then(function(resp){
                                        return dataTransService.init(
                                            dataTransService.excludeKey(angular.fromJson(resp.data), ['_id'])
                                        )
                                    });
                            }]
                    }
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
                    controllerAs: 'pidCtrl',
                    resolve: {
                        rawData: ['$route', 'dataTransService', 'ProjectService',
                            function($route, dataTransService, ProjectService) {
                            return ProjectService.get($route.current.params.project_id)
                                .then(function(resp) {
                                    return dataTransService.init(
                                        dataTransService.excludeKey(angular.fromJson(resp.data), ['_id'])
                                    );
                                })
                        }]
                    }
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
