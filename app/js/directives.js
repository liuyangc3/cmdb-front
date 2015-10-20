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
                modifyRowKey: '&'
            },
            replace: true,
            link: function (scope, element) {
                // ����ָ��֪ͨ����
                //scope.$parent.$broadcast('keyModify', someValue);

                scope.isReservedKey = function () {
                    // ����ɾ��, �����޸����Ƶ� key
                    return (
                        scope.bindValue == '_rev' ||
                        scope.bindValue == 'ip'   ||
                        scope.bindValue == 'port' ||
                        scope.bindValue == 'type' ||
                        scope.bindValue == 'name'
                    );
                };
                scope.showThis = true;
                scope.inputText = scope.bindValue;
                scope.transEditState = function () {
                    if (!scope.isReservedKey()) {
                        scope.showThis = !scope.showThis;
                    }
                };
                scope.saveKey = function () {
                    scope.showThis = !scope.showThis;
                    if (scope.inputText == scope.bindValue) {
                        // δ���κ��޸�
                        return
                    }
                    try {
                        scope.modifyRowKey({
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
                bindValue: '=',
                modifyRowValue: '&'
            },
            replace: true,
            link: function(scope, element, attr){
                scope.showThis = true;
                scope.inputText = scope.bindValue;
                scope.transEditState = function() {
                    // ���ܱ༭�� key
                    if(
                        '_rev' != scope.bindKey &&
                        'ip'   != scope.bindKey &&
                        'port' != scope.bindKey &&
                        'type' != scope.bindKey
                    ) {
                        scope.showThis = !scope.showThis;
                    }
                };
                scope.saveValue = function() {
                    scope.showThis = !scope.showThis;
                    if(scope.inputText == scope.bindValue) {
                        return
                    }
                    scope.modifyRowValue({
                        key: scope.bindKey,
                        value: scope.inputText
                    })();
                };
            }
        }}])

    .directive('projectTableKey',[function(){
        return {
            restrict: 'AE',
            templateUrl: 'views/project/directive/rowKey.html',
            scope: {
                bindValue: '=',
                pushAlert: '&',
                deleteRow: '&',
                modifyTableKey: '&'
            },
            replace: true,
            link: function(scope){
                scope.showThis = true;
                scope.inputText = scope.bindValue;
                scope.isReservedKey = function() {
                    // ����ɾ���� key
                    return (
                        scope.bindValue == '_rev' ||
                        scope.bindValue == 'type' ||
                        scope.bindValue == 'services'
                    );
                };
                scope.transEditState = function() {
                    // ���ܱ༭�� key
                    if(
                        '_rev' != scope.bindValue &&
                        'type' != scope.bindValue &&
                        'services' != scope.bindValue
                    ) {
                        scope.showThis = !scope.showThis;
                        scope.inputText = scope.bindValue;
                    }
                };
                scope.saveKey = function() {
                    scope.showThis = !scope.showThis;
                    if (scope.inputText == scope.bindValue) {
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
            }
        }}])

    .directive('projectTableValue',[function(){
        return {
            restrict: 'AE',
            templateUrl: 'views/project/directive/rowValue.html',
            scope: {
                bindKey: '=',
                bindValue: '=',
                pushAlert: '&',
                modifyRowValue: '&'
            },
            replace: true,
            link: function(scope, element, attr){
                scope.showThis = true;
                scope.inputText = scope.bindValue;
                scope.transEditState = function() {
                    // ���ܱ༭�� value
                    if(
                        '_rev' != scope.bindKey &&
                        'type' != scope.bindKey
                    ) {
                        scope.showThis = !scope.showThis;
                    }
                };
                scope.saveValue = function() {
                    scope.showThis = !scope.showThis;
                    if(scope.inputText == scope.bindValue) {
                        return
                    }
                    try {
                        scope.modifyRowValue({
                            key: scope.bindKey,
                            value: scope.inputText
                        })();
                    } catch(error) {
                        scope.pushAlert({msg: error})();
                        scope.inputText = scope.bindValue;
                    }
                };
            }
        }}])
;