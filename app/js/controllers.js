/** * Created by web on 2015/8/25. */'use strict';angular.module('cmdb')    //.controller('MainCtrl', ['initData', function (initData) {    //        var self = this;    //        self.projects = initData.getProjects;    //}])    .controller('ServiceCtrl', ['$scope', '$route', 'services', 'msgBus',        function($scope, $route, services, msgBus){            var self = this;            // TODO : data cong service 初始化的            //  需要改成这里初始化            self.services = services;            self.reload = function(){                $route.reload();            };            //msgBus.onMsg('reloadData', $scope, function (){            //    alert('get msg');            //    //$route.reload();            //});            //$scope.$on('$destroy', function(){            //    alert('des troyed ');            //})      }])    .controller('ServiceIdCtrl', ['$route', '$routeParams', '$scope', '$location',        'tableData', 'msgBus', 'ServiceService',        function($route, $routeParams, $scope, $location, tableData, msgBus, ServiceService){        var self = this;        self.service_id = $routeParams.service_id;        ServiceService.get(self.service_id).success(function(data){            // 从后端获取 service 表格的数据            self.service = tableData.init(angular.fromJson(data));        });                self.addTableRow = function() {            var unnameArray = [];            angular.forEach(self.service, function(v,k){                if(k == 'unnamed'){                    unnameArray.push(0);                }                if(k.startsWith('unnamed ')){                    var index = parseInt(k.substr(8));                    if (angular.isNumber(index)){                        unnameArray.push(index);                    }                }            });            var rowIndex = 0;            if (unnameArray.length != 0) {                unnameArray.sort();                while(1){                    if(rowIndex in unnameArray){                        rowIndex++;                    } else if(rowIndex) {                        self.service['unnamed ' + rowIndex] = {v: 'null'};                        unnameArray.push(rowIndex);                        break;                    } else {                        self.service['unnamed'] = {v: 'null'};                        unnameArray.push(0);                        break;                    }                }            } else {                self.service['unnamed'] = {v: 'null'};                unnameArray.push(0);            }        };        self.deleteTableRow = function(key){            // 删除表格的一行            delete self.service[key];                    };        self.modifyRowKey = function(key, newkey){            /*             controller 传递内部函数给 directive 的时候             内部函数必须在DOM上调用             例如指令foo 的 scope 是 { bar: '&'}             这样写是可以的：             <foo bar="modifyTableKey(arg1, arg2)></foo>"             在指令中可以这样调用:             bar({arg1: true_arg1, arg2: true_arg2})             而这样写不可以：             <foo bar="modifyTableKey"></foo>"             我期望modifyTableKey在指令内数据改变的时候被调用             而不是我把它传入指令的时候被调用             所以这里和下面的 modifyTableValue 不同             我把 modifyTableKey 写成闭包的形式             */            return function(){                if(self.service.hasOwnProperty(newkey)){                    throw newkey+' already in services'                } else {                    var value = self.service[key].v;                    delete self.service[key];                    self.service[newkey] = {v: value};                }            }        };        self.save = function(){            var formData = tableData.revert(self.service);            var fields = ['_id', '_rev', 'ip', 'port', 'type'];            for (var i= 0; i < fields.length; i++) {                delete formData[fields[i]];            }            ServiceService.put(self.service_id, formData);            $route.reload();        };        self.delete = function(){            ServiceService.del(self.service_id);            //msgBus.emitMsg('reloadData');            //alert('send');            $location.path('/service').replace().reload(true);        };    }])    //.controller('ServiceIdCtrl', ['$routeParams', 'ServiceService',    //    function($routeParams, ServiceService) {    //    var self = this;    //    self.service_id = $routeParams.service_id;    //    ServiceService.get(self.service_id).success(function(data){    //        self.servicedata = angular.fromJson(data);    //        self.service = {};    //        angular.forEach(self.servicedata, function(value, field){    //            //if (!field.startsWith('_') && !self.isConstField(field)){    //            self.service[field] = {    //                key: field,    //                value: value,    //                filedTransform: false,    //                valueTransform: false    //            }    //        });    //    });    //    self.isPrivateField = function(field){    //        return field.startsWith('_')    //    };    //    self.isConstField = function(field){    //        return field == "ip" || field == "port" || field == "type"    //    };    //    var addFieldCount = 0;    //    self.addField = function(){    //        // TODO 自动获得焦点 点保存按钮 data值进行检查    //        var field = 'unnamed ' + addFieldCount;    //        self.service[field] = {    //            key: field,    //            value: 'null',    //            filedTransform: true,    //            valueTransform: false    //        };    //        addFieldCount += 1;    //    };    //    self.deleteAttr = function(filed){    //        delete self.service[filed];    //    };    //    self.transformField = function(field){    //        if (self.isConstField(field)){    //            alert('this field not allowed edit');    //        }    //        else {    //            self.service[field].filedTransform = !self.service[field].filedTransform;    //        }    //    };    //    self.transformValue = function(field){    //        if (self.isConstField(field)){    //            alert('this field not allowed edit');    //        }else {    //            self.service[field].valueTransform = !self.service[field].valueTransform;    //        }    //    };    //}])    .controller('ServiceAddCtrl',['ServiceService', function(ServiceService){            var self = this;            self.formData = {};            self.alerts = [];            self.closeAlert = function(index){                self.alerts.splice(index, 1);            };            self.submit = function(){                ServiceService.post(self.service_id, self.formData)                .success(function(resp){                    self.alerts.push({type: 'success', msg: resp});                })                .error(function(resp){                    self.alerts.push({type: 'danger', msg: resp});                });            };    }])    .controller('ProjectCtrl', ['$route', 'projects',        function($route, projects){            var self = this;            self.projects = projects;            self.reload = function(){                $route.reload();            };    }])    .controller('ProjectAddCtrl',['$scope', 'services', 'ProjectService',        function($scope, services, ProjectService){            var self = this;            self.alerts = [];            self.closeAlert = function(index){                self.alerts.splice(index, 1);            };            self.formData = {}; // 表单数据            self.servicesAdded = []; // 表单services input 已添加的数据            self.servicesPool = services; // 所有的 service_id            // 对input输入的字符进行service匹配            $scope.$watch(function(){return self.formData.service},                function(newValue, oldValue) {                    if (newValue) {                        self.match = [];                        angular.forEach(self.servicesPool, function(service) {                            if (service.indexOf(newValue) >= 0) {                                self.match.push(service);                            }                        });                        if(0 != self.match.length) {self.matched = true;}                    } else {                        self.match = [];                        self.matched = false;                    }            });            self.saveService = function(sid){                self.servicesAdded.push(sid);                // 添加过的service, 下次不会再进行匹配                angular.forEach(self.servicesPool, function(service, i){                    if(sid == service) {                        delete  self.servicesPool[i];                    }                });                self.formData.service = '';            };            self.deleteService = function(added, index) {                // 从 ng-repeat 数组删除 item 如果使用下面的方式                // delete self.servicesAdded[index];                // 一些内部元素并不会被清除,必须使用 splice 方法                self.servicesAdded.splice(index, 1);                self.servicesPool.push(added);            };            self.submit = function(){                // TODO: 需要优化，在post的时候 还要把数据加回servicesPool                var data = angular.copy(self.formData);                data.services = self.servicesAdded;                ProjectService.post(self.project_id, data)                    .success(function(resp){                        self.alerts.push({type: 'success', msg: resp});                    })                    .error(function(resp){                        self.alerts.push({type: 'danger', msg: resp});                    });            };    }])    .controller('ProjectIdCtrl', ['$routeParams',        function($routeParams) {            var self = this;            self.project_id = $routeParams.project_id;    }])    //.controller('ProjectDeploymentCtrl',    //    ['DeploymentService', '$routeParams',    //    function (DeploymentService, $routeParams){    //        var self = this;    //        self.projectname = $routeParams.projectName;    //        self.ip = $routeParams.ip;    //        self.range = function(n) {return new Array(n)};    //        DeploymentService.getDeployment(self.projectname, self.ip)    //            .then(function(resp) {    //                self.dateArray = eval(resp.data);    //                // current 目录一直指向最新的日期,就是数组的最后的一项(如果服务已排序)    //                self.currentIndex = self.dateArray.length - 1;    //                self.currentDate = self.dateArray[self.currentIndex];    //            });    //}])    //.controller('ProjectDeploymentDetailCtrl',    //    ['DeploymentService','$routeParams',    //    function(DeploymentService, $routeParams){    //        var self = this;    //        self.projectname = $routeParams.projectName;    //        DeploymentService.getDeploymentDetail(    //            self.projectname, $routeParams.ip, $routeParams.deployDate)    //            .then(function(resp){    //                self.detail = angular.fromJson(resp.data)    //            });    //    }]);