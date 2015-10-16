/**
 * Created by web on 2015/8/25.
 */
'use strict';
angular.module('cmdb')
    .factory('tableData', function(){ // 表格数据函数
        return {
            init: function (data) { // {key: value} --> {key: {v: value}}
                var _data = {};
                angular.forEach(data, function(value,key){
                    _data[key] = {v:value}
                });
                return _data;
            },
            revert: function(data) { // {key: {v: value}} --> {key: value}
                var _data = {};
                angular.forEach(data, function(value,key){
                    _data[key] = value.v;

                });
                return _data;
            }
        }
    })
    .factory('ServiceService', ['$http', 'cmdbApiPrefix',
    function($http, cmdbApiPrefix) {
        var serviceApiPrefix = cmdbApiPrefix + 'service/';
        return {
            // 在 angular v13 中
            // $http.get() 可以直接返回 promise
            // 这样就不需要 使用 $q.defer()
            // 来处理$http的结果
            //
            // v12 需要这样处理:
            // var deferred = $q.defer();
            // $http.get(_utils.join('service/list'))
            //   .success(function (data) {deferred.resolve(data)})
            //   .error(function(error){deferred.reject(error)});
            // return deferred.promise;

            list: function () {
                return $http.get(serviceApiPrefix + 'list')
            },
            get: function (service_id) {
                return $http.get(serviceApiPrefix + service_id)
            },
            post: function (service_id, formData) {
                return $http({
                    url: serviceApiPrefix + service_id,
                    method: 'POST',
                    data: formData
                })
            },
            put: function (service_id, formData) {
                return $http({
                    url: serviceApiPrefix + service_id,
                    method: 'PUT',
                    data: formData
                })
            },
            del: function (service_id) {
                return $http({
                    url: serviceApiPrefix + service_id,
                    method: 'DELETE'
                });
            }
        }
    }])

    .factory('ProjectService',['$http','cmdbApiPrefix',
        function($http, cmdbApiPrefix){
            var projectApiPrefix = cmdbApiPrefix + 'project/';
            return {
                list: function(){
                    return $http.get(projectApiPrefix + 'list')
                },
                get: function(project_id){
                    return $http.get(projectApiPrefix + project_id)
                }
            }
        }
    ])

    .factory('InitDataService', ['$q', 'ServiceService', 'ProjectService',
        function ($q, ServiceService, ProjectService) {
        return function() {
            var services = ServiceService.list();
            var projects = ProjectService.list();
            return $q.all([services, projects]).then(function(results){
                return {
                    getServices: angular.fromJson(results[0].data),
                    getProjects: angular.fromJson(results[1].data)
                };
            }, function(error){
                console.log('ServiceError: InitDataService', error.status, error.data);
            });
        }
    }]);

