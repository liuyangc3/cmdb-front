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
            // 全局 state
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
                        controller: ['$scope', 'databases', 'globalService', function ($scope, databases, globalService) {
                            // 不能将 $scope 的一级对象传递到 ui-select
                            // 否则选择的时候 检测不到数据的变化
                            $scope.wrapperObj = {databases: databases};
                            $scope.$watch('wrapperObj.database', function (newValue, oldValue) {
                                if (newValue) {
                                    globalService.currentDB = newValue;
                                }
                            });
                        }]
                    },
                    'sidebar': {
                        templateUrl: 'views/sidebar.html'
                    }
                }
            })


            .state('root.body', {
                url: '/',
                views: {
                    'main@': {
                        templateUrl: 'views/main.html',
                        controller: 'MainCtrl',
                        controllerAs: 'mCtrl'
                    }
                }
            })

            .state('root.addDatabase', {
                url: '/addDatabase',
                views: {
                    'main@': {
                        templateUrl: 'views/database/addDatabase.html',
                        controller: 'DatabaseCtrl as dbCtrl',
                    }
                }
            })

            .state('root.delDatabase', {
                url : '/delDatabase',
                views: {
                    'main@': {
                        templateUrl: 'views/database/delDatabase.html',
                        controller: 'DatabaseCtrl',
                        controllerAs: 'dbCtrl'
                    }
                }
            });
                //
                //.state('/:database/service', {
                //    templateUrl: 'views/service/listService.html',
                //    controller: 'ServiceCtrl',
                //    controllerAs: 'sCtrl',
                //    resolve: {
                //        services: ['$route', 'HTTPService', function($route, HTTPService){
                //            return HTTPService.list($route.current.params.database, 'service').then(function(resp){
                //                return angular.fromJson(resp.data);
                //            });
                //        }]
                //    }
                //})
                //.state('/:database/service/add', {
                //    templateUrl: 'views/service/addservice.html',
                //    controller: 'ServiceAddCtrl',
                //    controllerAs: 'sCtrl'
                //})
                //.state('/:database/service/:service_id', {
                //    templateUrl: 'views/service/service.html',
                //    controller: 'ServiceIdCtrl',
                //    controllerAs: 'sidCtrl',
                //    resolve: {
                //        service: ['$route', 'dataTransService', 'HTTPService',
                //            function($route, dataTransService, HTTPService) {
                //                return HTTPService.get($route.current.params.database, 'service', $route.current.params.service_id)
                //                    .then(function(resp){
                //                        return dataTransService.init(
                //                            dataTransService.excludeKey(angular.fromJson(resp.data), ['_id'])
                //                        )
                //                    });
                //            }]
                //    }
                //})
                //.state('/:database/project', {
                //    templateUrl: 'views/project/listProject.html',
                //    controller: 'ProjectCtrl',
                //    controllerAs: 'pCtrl',
                //    resolve: {
                //        projects: ['$route', 'HTTPService', function($route, HTTPService){
                //            return HTTPService.list($route.current.params.database, 'project').then(function(resp){
                //                return angular.fromJson(resp.data);
                //            })
                //        }]
                //    }
                //})
                //.state('/:database/project/add', {
                //    templateUrl: 'views/project/addProject.html',
                //    controller: 'ProjectAddCtrl',
                //    controllerAs: 'pCtrl',
                //    resolve: {
                //        services: ['$route', 'HTTPService', function ($route, HTTPService) {
                //            return HTTPService.list($route.current.params.database, 'service').then(function (resp) {
                //                return angular.fromJson(resp.data);
                //            });
                //        }]
                //    }
                //})
                //.state('/:database/project/:project_id', {
                //    templateUrl: 'views/project/project.html',
                //    controller: 'ProjectIdCtrl',
                //    controllerAs: 'pidCtrl',
                //    resolve: {
                //        project: ['$route', 'dataTransService', 'HTTPService',
                //            function($route, dataTransService, HTTPService) {
                //            return HTTPService.get($route.current.params.database, 'project', $route.current.params.project_id)
                //                .then(function(resp) {
                //                    return dataTransService.init(
                //                        dataTransService.excludeKey(angular.fromJson(resp.data), ['_id'])
                //                    );
                //                })
                //        }]
                //    }
                //});



                //otherwise({
                //    redirectTo: '/'
                //});

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
        $state.transitionTo('root.body');
    }
]);