/**
 * Created by web on 2015/8/25.
 */
'use strict';
angular.module('cmdb')
    .controller('HeaderCtrl', ['$scope', '$state', '$cookieStore', 'databases', 'globalService',
        function ($scope, $state, $cookieStore, databases, globalService) {
            var self = this;

            // 操作cookie
            self.user = $cookieStore.get("user");

            // 如果直接将 $scope 的属性传递到 ui-select
            // 页面上看不到数据，必须将属性放在一个对象里
            self.wrapperObj = {
                databases: databases
            };


            // 如果之前已经选择过环境,全局service有数据
            // reload 后直接显示
            self.setSelectedDb = function() {
                self.wrapperObj.database = globalService.currentDB;
            };

            // 监听页面导航 环境下拉菜单
            // 将数据存放到全局service
            $scope.$watch(function(){return self.wrapperObj.database}, function (newValue, oldValue) {
                if (newValue) {
                    globalService.currentDB = newValue;
                    self.setSelectedDb();
                }
            });
            self.search = function() {
                alert($scope.inputText);
            };
            self.logout = function() {
                $cookieStore.remove("user");
                location.reload();
            }
    }])

    .controller('MainCtrl', ['$scope', '$state', 'globalService', 'HTTPService',
        function($scope, $state, globalService, HTTPService) {
            var self = this;
            self.databases = globalService.databases;
            $scope.$watch(function(){return globalService.currentDB}, function(newValue,o) {
                // 监视导航条 选择环境
                if(newValue) {
                    self.database = newValue;
                    HTTPService.list(newValue, 'service').then(function(resp){
                        self.services = angular.fromJson(resp.data);
                    });
                    HTTPService.list(newValue, 'project').then(function(resp){
                        self.projects = angular.fromJson(resp.data);
                    });
                }
            });
    }])

    .controller('DatabaseCtrl', ['$scope', '$http', '$state', 'globalService', 'cmdbApiPrefix',
        function($scope, $http, $state, globalService, cmdbApiPrefix) {
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
                    $state.go('root', null, {reload: true});
                }).error(function(error) {
                    self.alerts.push({type: 'danger', msg: angular.fromJson(error)});
                });
            };
            self.delDatabase = function() {
                $http.delete(cmdbApiPrefix + '/database/' + self.wrapperObj.database).success(function(data) {
                    self.alerts.push({type: 'success', msg: angular.fromJson(data)});
                    $state.go('root', null, {reload: true});
                }).error(function(error) {
                    self.alerts.push({type: 'danger', msg: angular.fromJson(error)});
                });
            };

    }])

    //////////////////////////
    // Services Controllers //
    //////////////////////////

    .controller('ServiceCtrl',
    ['$state', '$stateParams', '$state', 'service', 'dataTransService', 'TableService', 'HTTPService',
        function($state, $stateParams, $scope, service, dataTransService, TableService, HTTPService) {
            var self = this;
            self.alerts = [];
            self.closeAlert = function(index){
                self.alerts.splice(index, 1);
            };

            /*
             controller 传递内部函在 directive 内部被调用
             内部函数必须在DOM上调用

             例如controller TestCtrl中
             self.funcFoo = function(arg1,arg2) {...}

             在DOM中将 funcFoo 传递到指令 foo
             "<foo func-bar="TestCtrl.funcFoo(arg1, arg2)></foo>"

             在指令 foo 的 scope 内使用 funcBar 接收 controller 的函数
             scope :{ funcBar: '&'}

             这样在指令foo的link过程中调用funcBar 其结果与调用 TestCtrl 的 funcFoo 相同

             这种把funcFoo写成闭包的形式,可以实现controller函数 子指令内link中被调用
            */
            self.pushAlert = function(msg) {
                return function(){
                    self.alerts.push({type: 'danger', msg: msg});
                }
            };
            self.database = $stateParams.database;
            self.sid = $stateParams.sid;
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
                HTTPService.put(self.database, self.type, self.sid, dataTransService.revert(self.service))
                    .success(function(data) {
                        $state.go($state.current, null, {reload: true});
                    })
                    .error(function(error){
                        self.alerts.push({type: 'danger', msg: error});
                    });
            };
            self.deleteTable = function() {
                HTTPService.del(self.database, self.type, self.sid)
                    .success(function(resp) {
                        $state.go('root.listService', {database: self.database}, {reload: true});
                    })
                    .error(function(error) {
                        self.alerts.push({type: 'danger', msg: error});
                    });
            };
    }])

    .controller('ServiceAddCtrl',['$stateParams', 'HTTPService',
        function($stateParams, HTTPService){
            var self = this;
            self.formData = {};
            self.alerts = [];
            self.type = 'service';
            self.database = $stateParams.database;

            self.closeAlert = function(index){
                self.alerts.splice(index, 1);
            };

            self.submit = function(fromDataInvalid) {
                if(fromDataInvalid) {
                    self.alerts.push({type: 'danger', msg: '格式错误'});
                    return false;
                }
                HTTPService.post(self.database, self.type, self.service_id, self.formData)
                    .success(function(resp) {
                        self.alerts.push({type: 'success', msg: resp});
                })
                    .error(function(resp) {
                        self.alerts.push({type: 'danger', msg: resp});
                });
            };
    }])

    //////////////////////////
    // Projects Controllers //
    //////////////////////////


    .controller('ProjectCtrl',
    ['$stateParams', '$state', '$scope', 'project', 'dataTransService', 'TableService', 'HTTPService',
        function($stateParams, $state, $scope, project, dataTransService, TableService, HTTPService) {
            var self = this;
            self.type = 'project';
            self.database = $stateParams.database;
            self.pid = $stateParams.pid;
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
                HTTPService.put(self.database, self.type, self.pid, dataTransService.revert(self.project))
                    .success(function(data) {
                        $state.go($state.current, null, {reload : true})
                    })
                    .error(function(error) {
                        self.alerts.push({type: 'danger', msg: error})
                });
            };
            self.deleteTable = function(){
                HTTPService.del(self.database, self.type, self.pid)
                    .success(function(data) {
                        $state.go('root.listProject', {database: self.database}, {reload: true});
                    })
                    .error(function(error) {
                        self.alerts.push({type: 'danger', msg: error});
                    });
            };
    }])

    .controller('ProjectAddCtrl',['$stateParams', '$scope', 'HTTPService',
        function($stateParams, $scope, HTTPService){
            var self = this;
            self.type = 'project';
            self.projectSubmitPermission = true;
            self.database = $stateParams.database;
            self.projects = [];
            angular.forEach($stateParams.projects, function(row) {
                self.projects.push(row.name);
            });
            self.servicesPool = $stateParams.servicesPool;

            self.alerts = [];
            self.closeAlert = function(index){
                self.alerts.splice(index, 1);
            };

            self.formData = {}; // 表单数据
            self.servicesAdded = []; // 表单services input 已添加的数据


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

                // 检查表单name 是否已经存在于projects
                angular.forEach(self.projects, function(projectName) {
                    if(self.formData.name === projectName) {
                        self.alerts.push({type: 'danger', msg: "Name: " + projectName +" exist"});
                        self.projectSubmitPermission = false;
                    }
                });

                // 提交表单
                if(self.projectSubmitPermission){
                    HTTPService.post(self.database, self.type, self.formData.name, data)
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
                }

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