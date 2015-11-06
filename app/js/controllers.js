/**
 * Created by web on 2015/8/25.
 */
'use strict';
angular.module('cmdb')
    .controller('MainCtrl', ['$scope', 'globalService',
        function($scope, globalService) {
            var self = this;
            self.databases = globalService.databases;
            $scope.$watch(function(){return globalService.currentDB}, function(newValue,o) {
                // 监视 导航条的数据变化
                if(newValue) {self.database = newValue}
            });
    }])

    .controller('DatabaseCtrl', ['$scope', '$http', '$state', 'globalService', 'cmdbApiPrefix',
        function($scope, $http, $route, globalService, cmdbApiPrefix) {
            var self = this;
            self.alerts = [];
            self.closeAlert = function(index){
                self.alerts.splice(index, 1);
            };

            self.wrapperObj = {databases: globalService.databases};

            self.addDatabase = function(invalid) {
                if(invalid) {
                    return false;
                }
                $http.post(cmdbApiPrefix + '/database/' + self.wrapperObj.database).success(function(data) {
                    self.alerts.push({type: 'success', msg: angular.fromJson(data)});
                }).error(function(error) {
                    self.alerts.push({type: 'danger', msg: angular.fromJson(error)});
                });
            };
            self.delDatabase = function() {
                $http.delete(cmdbApiPrefix + '/database/' + self.wrapperObj.database).success(function(data) {
                    self.alerts.push({type: 'success', msg: angular.fromJson(data)});
                    $state.go($state.root, {}, {reload: true});
                }).error(function(error) {
                    self.alerts.push({type: 'danger', msg: angular.fromJson(error)});
                });
            };

    }])

    .controller('ServiceCtrl', ['$routeParams','$route', 'services',
        function($routeParams, $route, services){
            var self = this;
            self.services = services;
            self.database = $routeParams.database;
            self.reload = function(){
                $route.reload();
            };
      }])

    .controller('ServiceIdCtrl',
    ['$route', '$routeParams', '$scope', '$location',
    'service', 'dataTransService', 'TableService', 'HTTPService',
        function($route, $routeParams, $scope, $location, service, dataTransService, TableService, HTTPService) {
            var self = this;
            self.alerts = [];
            self.closeAlert = function(index){
                self.alerts.splice(index, 1);
            };
            self.pushAlert = function(msg) {
            /*
             controller 传递内部函数给 directive 的时候
             内部函数必须在DOM上调用
             例如指令foo 的 scope 是 { bar: '&'}
             这样写是可以的：
             <foo bar="modifyTableKey(arg1, arg2)></foo>"
             在指令中可以这样调用:
             bar({arg1: true_arg1, arg2: true_arg2})

             而这样写不可以：
             <foo bar="modifyTableKey"></foo>"

             写成闭包的形式,可以使函数在指令内link中调用
             而不是把它传入指令的时候被调用
             */
                return function(){
                    self.alerts.push({type: 'danger', msg: msg});
                }
            };
            self.database = $routeParams.database;
            self.service_id = $routeParams.service_id;
            self.type = 'service';
            self.service = service;
            self.isReservedKey = function(key) {
                // 保存的key的名字不能使用下面的
                return ('_id' == key || 'ip' == key || 'port' == key)
            };

            self.newTableRow = function() {
                var name = TableService.getRowName(self.service);
                self.service[name] = {v: 'null'};
                self.modified = true;
            };
            self.deleteTableRow = function(key){
                delete self.service[key];
                self.modified = true;
            };
            self.modifyRowKey = function(key, newkey) {
                return function(){
                    if(self.service.hasOwnProperty(newkey)) {
                        throw newkey + ' already in services';
                    } else if(self.isReservedKey(newkey)) {
                        throw 'can not use this reserved name: ' + newkey;
                    } else {
                        var value = self.service[key].v;
                        delete self.service[key];
                        self.service[newkey] = {v: value};
                        self.modified = true;
                    }
                }
            };
            self.modifyRowValue = function(key, value) {
                return function() {
                    self.service[key] = {v: value};
                    self.modified = true;
                }
            };
            self.saveTable = function() {
                if(!self.modified){return}
                HTTPService.put(self.database, self.type, self.service_id, dataTransService.revert(self.service))
                .success(function(data) {
                    $route.reload();
                }).error(function(error){
                    self.alerts.push({type: 'danger', msg: error});
                });
            };
            self.deleteTable = function() {
                HTTPService.del(self.database, self.type, self.service_id)
                .success(function(){
                    $location.path(self.database + '/service'); //.replace().reload(true);
                }).error(function(error){
                    self.alerts.push({type: 'danger', msg: error});
                });
            };
    }])

    .controller('ServiceAddCtrl',['$routeParams', 'HTTPService', function($routeParams, HTTPService){
        var self = this;
        self.formData = {};
        self.alerts = [];
        self.type = 'service';
        self.database = $routeParams.database;

        self.closeAlert = function(index){
            self.alerts.splice(index, 1);
        };

        self.submit = function(fromDataInvalid){
            if(fromDataInvalid) {
                self.alerts.push({type: 'danger', msg: '格式错误'});
                return false;
            }
            HTTPService.post(self.database, self.type, self.service_id, self.formData)
            .success(function(resp){
                self.alerts.push({type: 'success', msg: resp});
            })
            .error(function(resp){
                self.alerts.push({type: 'danger', msg: resp});
            });
        };
    }])

    .controller('ProjectCtrl', ['$routeParams', '$route', 'projects',
        function($routeParams, $route, projects){
            var self = this;
            self.database = $routeParams.database;
            self.projects = projects;
            self.reload = function(){
                $route.reload();
            };
    }])

    .controller('ProjectAddCtrl',['$routeParams', '$scope', 'services', 'HTTPService',
        function($routeParams, $scope, services, HTTPService){
            var self = this;
            self.type = 'project';
            self.database = $routeParams.database;

            self.alerts = [];
            self.closeAlert = function(index){
                self.alerts.splice(index, 1);
            };

            self.formData = {}; // 表单数据
            self.servicesAdded = []; // 表单services input 已添加的数据
            self.servicesPool = services;
            // 对input输入的字符进行service匹配
            $scope.$watch(function(){return self.formData.services},
                function(newValue, oldValue) {
                    if (newValue) {
                        self.match = [];
                        angular.forEach(self.servicesPool, function(service) {
                            if (service.indexOf(newValue) >= 0) {
                                self.match.push(service);
                            }
                        });
                        if(0 != self.match.length) {self.matched = true;}
                    } else {
                        self.match = [];
                        self.matched = false;
                    }
            });
            self.saveService = function(sid){
                self.servicesAdded.push(sid);
                // 添加过的service, 下次不会再进行匹配
                angular.forEach(self.servicesPool, function(service, i){
                    if(sid == service) {
                        delete  self.servicesPool[i];
                    }
                });
                self.formData.services = '';
            };
            self.deleteService = function(added, index) {
                // 从 ng-repeat 数组删除 item 如果使用下面的方式
                // delete self.servicesAdded[index];
                // 一些内部元素并不会被清除,必须使用 splice 方法
                self.servicesAdded.splice(index, 1);
                self.servicesPool.push(added);
            };
            self.submit = function(){
                var data = angular.copy(self.formData);
                data.services = angular.copy(self.servicesAdded);
                HTTPService.post(self.database, self.type, self.project_id, data)
                    .success(function(resp){
                        self.alerts.push({type: 'success', msg: resp});
                    })
                    .error(function(resp){
                        self.alerts.push({type: 'danger', msg: resp});
                    });
                // post的数据加回servicesPool
                angular.forEach(self.servicesAdded, function (service, index) {
                    self.servicesAdded.splice(index, 1);
                    self.servicesPool.push(service);
                });
            };
    }])

    .controller('ProjectIdCtrl',
    ['$routeParams', '$scope', '$location', '$route',
     'project', 'dataTransService', 'TableService', 'HTTPService',
        function($routeParams, $scope, $location, $route, project, dataTransService, TableService, HTTPService) {
            var self = this;
            self.database = $routeParams.database;
            self.type = 'project';
            self.project_id = $routeParams.project_id;
            self.project = project;

            self.alerts = [];
            self.closeAlert = function(index){
                self.alerts.splice(index, 1);
            };
            self.pushAlert = function(msg) {
                return function(){
                    self.alerts.push({type: 'danger', msg: msg});
                }
            };

            self.isReservedKey = function(key) {
                // 保存的key的名字不能使用下面的
                return ('_id' == key || 'type' == key || 'services' == key)
            };


            self.newTableRow = function() {
                var key = TableService.getRowName(self.project);
                self.project[key] = {v: 'null'};
                self.modified = true;
            };
            self.deleteTableRow = function(key){
                delete self.project[key];
                self.modified = true;
            };
            self.modifyRowKey = function(key, newkey) {
                return function(){
                    if(self.project.hasOwnProperty(newkey)) {
                        throw newkey + ' already in project';
                    } else if(self.isReservedKey(newkey)) {
                        throw 'can not use this reserved name: ' + newkey;
                    } else {
                        var value = self.project[key].v;
                        delete self.project[key];
                        self.project[newkey] = {v: value};
                        self.modified = true;
                    }
                }
            };
            self.modifyRowValue = function(key, value) {
                return function() {
                    self.project[key] = {v: value};
                    self.modified = true;
                }
            };
            self.saveTable = function() {
                if(!self.modified) {return}
                HTTPService.put(self.database, self.type, self.project_id, dataTransService.revert(self.project))
                .success(function(data) {
                    $route.reload();
                }).error(function(error) {
                    self.alerts.push({type: 'danger', msg: error})
                });
            };
            self.deleteTable = function(){
                HTTPService.del(self.database, self.type, self.project_id)
                    .success(function(data) {
                        $location.path(self.database + '/project').replace().reload(true);
                    })
                    .error(function(error) {
                        self.alerts.push({type: 'danger', msg: error});
                    });
            };
    }])
;
//.controller('ProjectDeploymentCtrl',
//    ['DeploymentService', '$routeParams',
//    function (DeploymentService, $routeParams){
//        var self = this;
//        self.projectname = $routeParams.projectName;
//        self.ip = $routeParams.ip;
//        self.range = function(n) {return new Array(n)};
//        DeploymentService.getDeployment(self.projectname, self.ip)
//            .then(function(resp) {
//                self.dateArray = eval(resp.data);
//                // current 目录一直指向最新的日期,就是数组的最后的一项(如果服务已排序)
//                self.currentIndex = self.dateArray.length - 1;
//                self.currentDate = self.dateArray[self.currentIndex];
//            });
//}])
//.controller('ProjectDeploymentDetailCtrl',
//    ['DeploymentService','$routeParams',
//    function(DeploymentService, $routeParams){
//        var self = this;
//        self.projectname = $routeParams.projectName;
//        DeploymentService.getDeploymentDetail(
//            self.projectname, $routeParams.ip, $routeParams.deployDate)
//            .then(function(resp){
//                self.detail = angular.fromJson(resp.data)
//            });
//    }])