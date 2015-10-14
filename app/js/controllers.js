/** * Created by web on 2015/8/25. */angular.module('cmdb')    .controller('MainCtrl', ['initData', function (initData) {            var self = this;            self.projects = initData.getProjects;    }])    .controller('ServiceCtrl', ['initData', function(initData){            var self = this;            self.services = initData.getServices;      }])    .controller('ServiceIdCtrl', ['$routeParams', 'ServiceService',        function($routeParams, ServiceService) {        var self = this;        self.service_id = $routeParams.service_id;        ServiceService.get(self.service_id).success(function(data){            self.servicedata = angular.fromJson(data);            self.service = {};            angular.forEach(self.servicedata, function(value, field){                //if (!field.startsWith('_') && !self.isConstField(field)){                self.service[field] = {                    key: field,                    value: value,                    filedTransform: false,                    valueTransform: false                }            });        });        self.isPrivateField = function(field){            return field.startsWith('_')        };        self.isConstField = function(field){            return field == "ip" || field == "port" || field == "type"        };        var addFieldCount = 0;        self.addField = function(){            // TODO 自动获得焦点 点保存按钮 data值进行检查            var field = 'unnamed ' + addFieldCount;            self.service[field] = {                key: field,                value: 'null',                filedTransform: true,                valueTransform: false            };            addFieldCount += 1;        };        self.deleteAttr = function(filed){            delete self.service[filed];        };        self.transformField = function(field){            if (self.isConstField(field)){                alert('this field not allowed edit');            }            else {                self.service[field].filedTransform = !self.service[field].filedTransform;            }        };        self.transformValue = function(field){            if (self.isConstField(field)){                alert('this field not allowed edit');            }else {                self.service[field].valueTransform = !self.service[field].valueTransform;            }        };    }])    .controller('ServiceAddCtrl',['$http', 'ServiceService', 'cmdbApiPrefix',        function($http, ServiceService, cmdbApiPrefix){            var self = this;            self.serviceFormData = {};            self.alerts = [];            self.closeAlert = function(index){                self.alerts.splice(index, 1);            };            self.serviceSubmit = function(){                $http({                    url: cmdbApiPrefix + 'service/' + self.service_id,                    method: "POST",                    data: self.serviceFormData                }).success(function(resp){                    self.alerts.push({                        type: 'success',                        msg: resp                    });                }).error(function(error){                    self.alerts.push({                        type: 'danger',                        msg: error                    });                });            };    }])    .controller('ProjectCtrl',        ['ProjectService', '$routeParams',        function(ProjectService, $routeParams){            var self = this;            self.projectname = $routeParams.projectName;            ProjectService.getServiceIp($routeParams.projectName).then(                function(resp){                    self.ipArray = eval(resp.data);            });    }])    .controller('ProjectDeploymentCtrl',        ['DeploymentService', '$routeParams',        function (DeploymentService, $routeParams){            var self = this;            self.projectname = $routeParams.projectName;            self.ip = $routeParams.ip;            self.range = function(n) {return new Array(n)};            DeploymentService.getDeployment(self.projectname, self.ip)                .then(function(resp) {                    self.dateArray = eval(resp.data);                    // current 目录一直指向最新的日期,就是数组的最后的一项(如果服务已排序)                    self.currentIndex = self.dateArray.length - 1;                    self.currentDate = self.dateArray[self.currentIndex];                });    }])    .controller('ProjectDeploymentDetailCtrl',        ['DeploymentService','$routeParams',        function(DeploymentService, $routeParams){            var self = this;            self.projectname = $routeParams.projectName;            DeploymentService.getDeploymentDetail(                self.projectname, $routeParams.ip, $routeParams.deployDate)                .then(function(resp){                    self.detail = angular.fromJson(resp.data)                });        }]);