/**
 * Created by web on 2015/8/25.
 */
'use strict';

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

angular.module('cmdb', [
    'ngCookies',
    'ngSanitize',
    'ui.router',
    'ui.select',
    'ui.bootstrap'
])


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

.config([
    '$compileProvider', '$locationProvider', '$stateProvider', '$urlRouterProvider',
    function($compileProvider, $locationProvider, $stateProvider, $urlRouterProvider) {

        // 不使用 https 的情况下, 在 link 中的 url 不会出现 unsafe
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

        /////////////////////////////
        // Redirects and Otherwise //
        /////////////////////////////

        // 无效的 url 重定向到 '/'
        $urlRouterProvider.otherwise("/");


        //////////////////////////
        // State Configurations //
        //////////////////////////

        $stateProvider
            .state('root', {
                url: '',
                //abstract: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        resolve: {
                            databases: ['$http', 'cmdbApiPrefix', 'globalService',
                                function ($http, cmdbApiPrefix, globalService) {
                                    return $http.get(cmdbApiPrefix + '/database/list').then(function (resp) {
                                        var databases = angular.fromJson(resp.data);
                                        globalService.databases = databases;
                                        return databases;
                                    });
                                }]
                        },
                        controller: ['$scope', '$cookieStore', 'databases', 'globalService', function ($scope, $cookieStore, databases, globalService) {
                            //$scope.user = $cookieStore.get("user");
                            // 不能将 $scope 的一级对象传递到 ui-select
                            // 否则选择的时候 检测不到数据的变化
                            $scope.wrapperObj = {databases: databases};
                            // 如果之前已经选择过环境,reload后直接显示
                            //if(globalService.currentDB){$scope.$select.selected = globalService.currentDB;}
                            $scope.$watch('wrapperObj.database', function (newValue, oldValue) {
                                if (newValue) {
                                    globalService.currentDB = newValue;
                                }
                            });
                            $scope.search = function() {
                                alert($scope.inputText);
                            };
                        }]
                    },
                    'sidebar': {
                        templateUrl: 'views/sidebar.html'
                    },
                    'main': {
                        templateUrl: 'views/main.html',
                        controller: 'MainCtrl as mCtrl'
                    }
                }
            })


            .state('root.addDatabase', {
                url: '/addDatabase',
                views: {
                    'main@': {
                        templateUrl: 'views/database/addDatabase.html',
                        controller: 'DatabaseCtrl as dbCtrl'
                    }
                }
            })

            .state('root.delDatabase', {
                url: '/delDatabase',
                views: {
                    'main@': {
                        templateUrl: 'views/database/delDatabase.html',
                        controller: 'DatabaseCtrl as dbCtrl'
                    }
                }
            })

            .state('root.listService', {
                url: '/:database/service',
                params: {
                  services: null
                },
                views: {
                    'main@': {
                        templateUrl: 'views/service/listService.html',
                        controller: ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
                            $scope.services = $stateParams.services;
                            $scope.database = $stateParams.database;
                            $scope.reload = function(){
                                $state.go($state.current, {services: $scope.services}, {reload: true});
                            };
                        }]
                    }
                }
            })


            // 单个 service 展示 修改
            .state('root.service', {
                url: '/:database/service/:sid',
                views:{
                    'main@': {
                        templateUrl: 'views/service/service.html',
                        controller: 'ServiceCtrl as sCtrl',
                        resolve: {
                            service: ['$stateParams', 'HTTPService', 'dataTransService',
                                function($stateParams, HTTPService, dataTransService) {
                                return HTTPService.get($stateParams.database, 'service', $stateParams.sid).
                                    then(function(resp){
                                        // 对原始数据进行处理，用于页面展示
                                        return dataTransService.init(
                                            dataTransService.excludeKey(angular.fromJson(resp.data), ['_id'])
                                        );
                                    });
                            }]
                        }
                    }
                }
            })

            // 添加一个 service
            .state('root.serviceAdd',{
                url: '/:database/service/add',
                views: {
                    'main@': {
                        templateUrl: 'views/service/addservice.html',
                        controller: 'ServiceAddCtrl as sCtrl'
                    }
                }
            })

            .state('root.listProject', {
                url: '/:database/project',
                params: {
                    projects: null
                },
                views: {
                    'main@': {
                        templateUrl: 'views/project/listProject.html',
                        controller: ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
                            $scope.projects = $stateParams.projects;
                            $scope.database = $stateParams.database;
                            $scope.reload = function(){
                                $state.go($state.current, {projects: $scope.projects}, {reload: true});
                            };
                        }]
                    }
                }
            })

            // 单个 project 展示 修改
            .state('root.project', {
                url: '/:database/project/:pid',
                views:{
                    'main@': {
                        templateUrl: 'views/project/project.html',
                        controller: 'ProjectCtrl as pCtrl',
                        resolve: {
                            project: ['$stateParams', 'HTTPService', 'dataTransService',
                                function($stateParams, HTTPService, dataTransService) {
                                    return HTTPService.get($stateParams.database, 'project', $stateParams.pid).
                                        then(function(resp){
                                            // 对原始数据进行处理，用于页面展示
                                            return dataTransService.init(
                                                dataTransService.excludeKey(angular.fromJson(resp.data), ['_id'])
                                            );
                                        });
                                }]
                        }
                    }
                }
            })

            // 添加一个 project
            .state('root.projectAdd', {
                url: '/:database/project/add',
                params: {servicesPool: null},
                views: {
                    'main@': {
                        templateUrl: 'views/project/addProject.html',
                        controller: 'ProjectAddCtrl as pCtrl'
                        //resolve: {
                            //servicesPool: ['$stateParams', 'HTTPService', function ($stateParams, HTTPService) {
                            //    return HTTPService.list($stateParams.database, 'service').then(function (resp) {
                            //        return angular.fromJson(resp.data);
                            //    });
                            //}]
                        //}
                    }
                }
            });


            // 如果浏览器不支持html5,$locationProvider使用注释行配置
            //$locationProvider.html5Mode(false).hashPrefix('!');
            $locationProvider.html5Mode(true);
    }
])

.run([
    '$rootScope', '$state', '$stateParams',
    function ($rootScope, $state, $stateParams) {

        // 将 $state 和 $stateParams 的引用加入 $rootScope 非常有用
        // 这样你可以在 app 的任意 scope 都可以访问它们. 例如,
        // <li ng-class="{ active: $state.includes('contacts.list') }">
        // 当激活contacts.list或者一个他的子孙, 会将 <li> 设为 active
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $state.transitionTo('root');
    }
]);