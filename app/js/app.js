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
var latestId = 0;

angular.module('cmdb', ['ngRoute', 'ngSanitize', 'ui.select', 'ui.bootstrap'])
    // 定义api前缀常量
    .constant('cmdbApiPrefix', '/api/v1')

    // ui select config
    .constant('uiSelectConfig', {
        theme: 'bootstrap',
        searchEnabled: true,
        sortable: false,
        placeholder: '', // Empty by default, like HTML tag <select>
        refreshDelay: 1000, // In milliseconds
        closeOnSelect: true,
        generateId: function() {
            return latestId++;
        },
        appendToBody: false
    })

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
                        databases: ['$http', 'cmdbApiPrefix', function($http, cmdbApiPrefix) {
                            return $http.get(cmdbApiPrefix + '/database/list').then(function(resp) {
                                return angular.fromJson(resp.data);
                            });
                        }],
                        services: ['$route', 'HTTPService', 'globalService', function($route, HTTPService, globalService){
                            return HTTPService.list(globalService.currentDB, 'service').then(function(resp){
                                return angular.fromJson(resp.data);
                            });
                        }],
                        projects: ['$route', 'HTTPService', 'globalService', function($route, HTTPService, globalService){
                            return HTTPService.list(globalService.currentDB, 'project').then(function(resp){
                                return angular.fromJson(resp.data);
                            })
                        }]
                    }
                })

                .when('/addDatabase', {
                    templateUrl: 'views/database/addDatabase.html',
                    controller: 'DatabaseCtrl',
                    controllerAs: 'dbCtrl',
                    resolve: {
                        databases: ['$http', 'cmdbApiPrefix', function ($http, cmdbApiPrefix) {
                            return $http.get(cmdbApiPrefix + '/database/list').then(function (resp) {
                                return angular.fromJson(resp.data);
                            });
                        }]
                    }
                })

                .when('/delDatabase', {
                    templateUrl: 'views/database/delDatabase.html',
                    controller: 'DatabaseCtrl',
                    controllerAs: 'dbCtrl',
                    resolve: {
                        databases: ['$http', 'cmdbApiPrefix', function ($http, cmdbApiPrefix) {
                            return $http.get(cmdbApiPrefix + '/database/list').then(function (resp) {
                                return angular.fromJson(resp.data);
                            });
                        }]
                    }
                })

                .when('/:database/service', {
                    templateUrl: 'views/service/listService.html',
                    controller: 'ServiceCtrl',
                    controllerAs: 'sCtrl',
                    resolve: {
                        services: ['$route', 'HTTPService', function($route, HTTPService){
                            return HTTPService.list($route.current.params.database, 'service').then(function(resp){
                                return angular.fromJson(resp.data);
                            });
                        }]
                    }
                })
                .when('/:database/service/add', {
                    templateUrl: 'views/service/addservice.html',
                    controller: 'ServiceAddCtrl',
                    controllerAs: 'sCtrl'
                })
                .when('/:database/service/:service_id', {
                    templateUrl: 'views/service/service.html',
                    controller: 'ServiceIdCtrl',
                    controllerAs: 'sidCtrl',
                    resolve: {
                        service: ['$route', 'dataTransService', 'HTTPService',
                            function($route, dataTransService, HTTPService) {
                                return HTTPService.get($route.current.params.database, 'service', $route.current.params.service_id)
                                    .then(function(resp){
                                        return dataTransService.init(
                                            dataTransService.excludeKey(angular.fromJson(resp.data), ['_id'])
                                        )
                                    });
                            }]
                    }
                })
                .when('/:database/project', {
                    templateUrl: 'views/project/listProject.html',
                    controller: 'ProjectCtrl',
                    controllerAs: 'pCtrl',
                    resolve: {
                        projects: ['$route', 'HTTPService', function($route, HTTPService){
                            return HTTPService.list($route.current.params.database, 'project').then(function(resp){
                                return angular.fromJson(resp.data);
                            })
                        }]
                    }
                })
                .when('/:database/project/add', {
                    templateUrl: 'views/project/addProject.html',
                    controller: 'ProjectAddCtrl',
                    controllerAs: 'pCtrl',
                    resolve: {
                        services: ['$route', 'HTTPService', function ($route, HTTPService) {
                            return HTTPService.list($route.current.params.database, 'service').then(function (resp) {
                                return angular.fromJson(resp.data);
                            });
                        }]
                    }
                })
                .when('/:database/project/:project_id', {
                    templateUrl: 'views/project/project.html',
                    controller: 'ProjectIdCtrl',
                    controllerAs: 'pidCtrl',
                    resolve: {
                        project: ['$route', 'dataTransService', 'HTTPService',
                            function($route, dataTransService, HTTPService) {
                            return HTTPService.get($route.current.params.database, 'project', $route.current.params.project_id)
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

//angular.module('cmdb')
//    .filter('propsFilter', function() {
//    return function(items, props) {
//        var out = [];
//
//        if (angular.isArray(items)) {
//            var keys = Object.keys(props);
//
//            items.forEach(function(item) {
//                var itemMatches = false;
//
//                for (var i = 0; i < keys.length; i++) {
//                    var prop = keys[i];
//                    var text = props[prop].toLowerCase();
//                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
//                        itemMatches = true;
//                        break;
//                    }
//                }
//
//                if (itemMatches) {
//                    out.push(item);
//                }
//            });
//        } else {
//            // Let the output be the input untouched
//            out = items;
//        }
//
//        return out;
//    };
//});