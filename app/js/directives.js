/**
 * Created by web on 2015/10/15.
 */
'use strict';
angular.module('cmdb')

  .directive('serviceTableKey',[function(){
        return {
            restrict: 'AE',
            templateUrl: 'views/service/directive/rowKey.html',
            scope: {
                bindValue: '=',
                deleteRow: '&',
                modifyTableKey: '&'
            },
            replace: true,
            link: function (scope) {
                // 并行指令通知机制
                //scope.$parent.$broadcast('keyModify', someValue);
                scope.reservedKey = function () {
                    // 不能删除,不能编辑的 key
                    return (scope.bindValue == 'name' || scope.bindValue == '_rev');
                };
                scope.showThis = true;
                scope.valueBefore = scope.bindValue;

                scope.transEditState = function () {
                    if (!scope.reservedKey()) {
                        scope.showThis = !scope.showThis;
                    }
                };
                scope.saveKey = function () {
                    scope.showThis = !scope.showThis;
                    if (scope.bindValue == scope.valueBefore) {
                        // 未作任何修改
                        return
                    }
                    try {
                        scope.modifyTableKey({
                            key: scope.valueBefore,
                            newkey: scope.bindValue
                        })();
                    } catch (error) {
                        alert(error); // TODO：提示更友好一些
                        scope.bindValue = scope.valueBefore;
                    }
                };
            } // link end
        }}])

    .directive('serviceTableValue',[function(){
        return {
            restrict: 'AE',
            templateUrl: 'views/service/directive/rowValue.html',
            scope: {
                bindKey: '=',
                bindValue: '='
            },
            replace: true,
            link: function(scope, element, attr){
                scope.showThis = true;
                scope.transEditState = function() {
                    if('_rev' != scope.bindKey) {
                        scope.showThis = !scope.showThis;
                    }
                };
            }
        }}])
;