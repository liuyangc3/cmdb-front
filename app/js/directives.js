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
                pushAlert: '&',
                deleteRow: '&',
                modifyTableKey: '&'
            },
            replace: true,
            link: function (scope, element) {
                // 并行指令通知机制
                //scope.$parent.$broadcast('keyModify', someValue);

                scope.reservedKey = function () {
                    // 不能删除,不能编辑的 key
                    return (scope.bindValue == 'name' || scope.bindValue == '_rev');
                };
                scope.showThis = true;
                scope.inputText = scope.bindValue;
                scope.transEditState = function () {
                    if (!scope.reservedKey()) {
                        scope.showThis = !scope.showThis;
                    }
                };
                scope.saveKey = function () {
                    scope.showThis = !scope.showThis;
                    if (scope.inputText == scope.bindValue) {
                        // 未作任何修改
                        return
                    }
                    try {
                        scope.modifyTableKey({
                            key: scope.bindValue,
                            newkey: scope.inputText
                        })();
                    } catch (error) {
                        scope.pushAlert({msg: error})();
                        scope.inputText = scope.bindValue;
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
                scope.valueBefore = scope.bindValue;
                scope.transEditState = function() {
                    if('_rev' != scope.bindKey) {
                        scope.showThis = !scope.showThis;
                        scope.bindValue = scope.valueBefore;
                    }
                };
            }
        }}])
    .directive('projectTableKey',[function(){
        return {
            restrict: 'AE',
            templateUrl: 'views/project/directive/rowKey.html',
            scope: {
                bindValue: '='
            },
            replace: true,
            link: function(scope){
                scope.showThis = true;
                scope.inputText = scope.bindValue;
                scope.reservedKey = function() {
                    // 不能删除的 key
                    return (scope.bindValue == 'services' || scope.bindValue == '_rev');
                };
                scope.isEditable = function() {
                    // 不能编辑的key
                    return  scope.bindValue == '_rev';
                };
                scope.transEditState = function() {
                    if('_rev' != scope.bindKey) {
                        scope.showThis = !scope.showThis;
                        scope.inputText = scope.bindValue;
                    }
                };
            }
        }}])
;