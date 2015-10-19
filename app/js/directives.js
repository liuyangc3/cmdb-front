/**
 * Created by web on 2015/10/15.
 */
'use strict';
angular.module('cmdb')

  .directive('rowKey',[function(){
        return {
            restrict: 'AE',
            templateUrl: 'views/service/directive/rowKey.html',
            scope: {
                bindValue: '=',
                deleteRow: '&',
                modifyTableKey: '&'
            },
            replace: true,
            link : function(scope, element, attr){
                // 并行指令通知机制
                //scope.$parent.$broadcast('keyModify', someValue);

                scope.praviteKey = function(){
                    return (scope.bindValue == '_id' || scope.bindValue == '_rev');

                };
                scope.yes = true;
                scope.valueBefore = scope.bindValue;
                scope.reservedKey = function(){
                    // 只有非保留字段才能删除
                    switch(scope.bindValue){
                        case '_id': return true;
                        case '_rev': return true;
                        case 'type': return true;
                        case 'ip': return true;
                        case 'port': return true;
                        case 'name': return true;
                        default : return false
                    }
                };
                scope.transToInputbox = function(){
                    scope.yes = !scope.yes;
                };
                scope.saveKey = function(){
                    scope.yes = !scope.yes;
                    if(scope.bindValue == scope.valueBefore){
                        return
                    }
                    try {
                        scope.modifyTableKey({
                            key: scope.valueBefore,
                            newkey: scope.bindValue
                        })();
                    } catch(error) {
                        alert(error); // TODO：提示更友好一些
                        scope.bindValue = scope.valueBefore;
                    }
                };
            }
        }
    }])
    .directive('rowValue',[function(){
        return {
            restrict: 'AE',
            templateUrl: 'views/service/directive/rowValue.html',
            scope: {
                bindKey: '=',
                bindValue: '='
            },
            replace: true,
            link: function(scope, element, attr){
                scope.yes = true;
                scope.transformNgShow = function(){
                    scope.yes = !scope.yes;
                };

            }
        }
    }])
;