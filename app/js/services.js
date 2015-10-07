/**
 * Created by web on 2015/8/25.
 */

angular.module('cmdb')
    .factory('MainService', ['$http', 'utils', function($http, utils){
            return {
                get: function(){
                    return $http.get(utils.join('project/'));
                }
            }
    }])

    .factory('ServiceService',['$http', 'utils', function($http, utils){
        return {
            get: function(service_id){
               return $http.get(utils.join('service', service_id))
            },
            post: function(service_id){
                return $http.post(utils.join('service', service_id))
            },
            put: function(service_id){
                return $http.put(utils.join('service', service_id))
            },
            del: function(service_id){
                return $http.delete(utils.join('service', service_id))
            }
        }
    }])

    .factory('ProjectService',['$http', '_path',
        function($http, _path){
            return {
                getServiceIp: function(projectName){
                    return $http.get(_path.join(projectName, 'service/tomcat'));
                }
            }
        }
    ])
    .factory('DeploymentService', ['$http', '_path',
        function($http, _path) {
            return {
                getDeployment: function(projectName, ip) {
                    return $http.get(_path.join(projectName, ip, 'deployments'));
                },
                getDeploymentDetail: function(projectName, ip, deployDate) {
                    return $http.get(_path.join(projectName, ip, 'deployments', deployDate, 'detail'));
                },
                doDeploy: function(ip){
                    return $http.post();
                },
                rollback: function(ip){
                    return $http.post();
                }
            }
        }])
;