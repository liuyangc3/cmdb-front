/**
 * Created by web on 2015/10/15.
 */
'use strict';
angular.module('cmdb')
  .directive('myTr', [function(){
        return {
            restrict: 'AE',
            templateUrl: 'views/service/directive/mytr.html',
            scope: {
                bindValue: '='
            },
            replace: true,
            link: function(scope){
                scope.showKey = true;
                scope.showValue = true;
                scope.transformNgShow = function(value){
                    value = !value
                };
            }
        }

    }])
  .directive('row',[function(){
        return {
            restrict: 'AE',
            templateUrl: 'views/service/directive/row.html',
            scope: {
                bindKey: '=',
                bindValue: '='
            },
            replace: true,
            link: function(scope){
                scope.showKey = true;
                scope.showValue = true;
                scope.transformNgShow = function(value){
                    value = !value
                };
            }
        }
    }])
  .directive('rowKey',[function(){
        return {
            restrict: 'AE',
            templateUrl: 'views/service/directive/rowKey.html',
            scope: {
                bindValue: '='
            },
            replace: true,
            link: function(scope){
                scope.yes = true;
                scope.transformNgShow = function(){
                    scope.yes = !scope.yes;
                };
            }
        }
    }])
    .directive('rowValue',[function(){
        return {
            restrict: 'AE',
            templateUrl: 'views/service/directive/rowValue.html',
            scope: {
                bindValue: '='
            },
            replace: true,
            link: function(scope){
                scope.yes = true;
                scope.transformNgShow = function(){
                    scope.yes = !scope.yes;
                };
            }
        }
    }])
;