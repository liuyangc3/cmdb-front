/**
 * Created by web on 2015/8/25.
 */
'use strict';
angular.module('cmdb')
    //.factory('msgBus', ['$rootScope', function($rootScope){
    //    return {
    //        emitMsg: function (msg) {
    //            $rootScope.$emit(msg);
    //        },
    //        onMsg: function (msg, scope, func) {
    //            var unbound = $rootScope.$on(msg, func);
    //            scope.$on('$destroy', unbound);
    //        }
    //    }
    //}])

    .factory('globalService', function() {
        return {
           currentDB: ''
        }
    })

    .factory('dataTransService', function(){
        // 数据格式转化，用于页面展示
        // {key: value} --> {key: {v: value}}
        // {key: {v: value}} --> {key: value}
        return {
            init: function (data) {
                var _data = {};
                angular.forEach(data, function(value, key) {
                    _data[key] = {v:value}
                });
                return _data;
            },
            revert: function(data) {
                var _data = {};
                angular.forEach(data, function(valueObj, key) {
                    _data[key] = valueObj.v;
                });
                return _data;
            },
            excludeKey: function(data, array) {
                angular.forEach(array, function(exclude) {
                    delete data[exclude];
                });
                return data;
            }
        }
    })
    .factory('HTTPService', ['$http', 'cmdbApiPrefix',
    function($http, cmdbApiPrefix) {
        return {
            // 在 angular v13 中
            // $http.get() 可以直接返回 promise
            // 这样就不需要 使用 $q.defer()
            // 来处理$http的结果
            //
            // v12 需要这样处理:
            // var deferred = $q.defer();
            // $http.get(_utils.join('couch/list'))
            //   .success(function (data) {deferred.resolve(data)})
            //   .error(function(error){deferred.reject(error)});
            // return deferred.promise;

            list: function (database, type) {
                return $http.get('{0}/{1}/{2}/list'.format(cmdbApiPrefix, database, type))
            },
            get: function (database, type, doc_id) {
                return $http.get('{0}/{1}/{2}/{3}'.format(cmdbApiPrefix, database, type, doc_id))
            },
            post: function (database, type, doc_id, formData) {
                return $http({
                    url: '{0}/{1}/{2}/{3}'.format(cmdbApiPrefix, database, type, doc_id),
                    method: 'POST',
                    data: formData
                })
            },
            put: function (database, type, doc_id, formData) {
                return $http({
                    url: '{0}/{1}/{2}/{3}'.format(cmdbApiPrefix, database, type, doc_id),
                    method: 'PUT',
                    data: formData
                })
            },
            del: function (database, type, doc_id) {
                return $http({
                    url: '{0}/{1}/{2}/{3}'.format(cmdbApiPrefix, database, type, doc_id),
                    method: 'DELETE'
                });
            }
        }
    }])

    .factory('TableService', function() {
        return {
            getRowName: function(data) {
                // new row name format: unnamed n, n is number
                // suffixArray = [0,1,...n]
                var prefix = 'unnamed';
                var suffixArray = [];
                angular.forEach(data, function(value, key) {
                    if(prefix == key) {
                        suffixArray.push(0);
                    }
                    else if(key.startsWith('unnamed ')) {
                        var suffix = parseInt(key.substr(8));
                        if (angular.isNumber(suffix)){
                            suffixArray.push(suffix);
                        }
                    }
                });

                var suffix = 0;
                if (0 == suffixArray.length) {
                    return prefix
                }
                suffixArray.sort();
                while(1) {
                    if(suffix == suffixArray[suffix]) {
                        suffix++;
                    } else {
                        return prefix + ' ' + suffix;
                    }
                }
            }
        }
    })
    //.factory('InitDataService', ['$q', 'ServiceService', 'ProjectService',
    //    function ($q, ServiceService, ProjectService) {
    //    return function() {
    //        var services = ServiceService.list();
    //        var projects = ProjectService.list();
    //        return $q.all([services, projects]).then(function(results){
    //            return {
    //                getServices: angular.fromJson(results[0].data),
    //                getProjects: angular.fromJson(results[1].data)
    //            };
    //        }, function(error){
    //            console.log('ServiceError: InitDataService', error.status, error.data);
    //        });
    //    }
    //}])
;

