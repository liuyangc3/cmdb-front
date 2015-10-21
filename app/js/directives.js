    /**
 * Created by web on 2015/10/15.
 */
'use strict';
angular.module('cmdb')

    .directive('serviceTableKey', ['$timeout', function($timeout) {
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
                // 并行指令通知机制
                //scope.$parent.$broadcast('keyModify', someValue);

                scope.isReservedKey = function () {
                    // 不能删除, 不能修改名称的 key
                    return (
                        scope.bindValue == '_rev' ||
                        scope.bindValue == 'ip'   ||
                        scope.bindValue == 'port' ||
                        scope.bindValue == 'type' ||
                        scope.bindValue == 'name'
                    );
                };
                var input = element.find('input');
                scope.showThis = true;
                scope.inputText = scope.bindValue;
                scope.transEditState = function () {
                    if (!scope.isReservedKey()) {
                        scope.showThis = !scope.showThis;
                        // 自动获得焦点
                        // 因为DOM 改变后input 元素才出现
                        // 这里需要异步执行 input.focus
                        // 第三个参数 false 表示不把匿名函数包裹在 $apply里执行
                        $timeout(function() {
                            input.focus();
                            input.select();
                        }, 0, false)
                    }
                };
                scope.saveKey = function () {
                    scope.showThis = !scope.showThis;
                    if (scope.inputText == scope.bindValue) {
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

    .directive('serviceTableValue',['$timeout', function($timeout) {
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
                var input = element.find('input');
                console.log(attr);
                scope.showThis = true;
                //scope.$watch(attr.showThis, function(v){
                //    console.log(v);
                //});
                scope.inputText = scope.bindValue;
                scope.transEditState = function() {
                    // 不能编辑的 key
                    if(
                        '_rev' != scope.bindKey &&
                        'ip'   != scope.bindKey &&
                        'port' != scope.bindKey &&
                        'type' != scope.bindKey)
                    {
                        scope.showThis = !scope.showThis;
                        $timeout(function() {
                            input.focus();
                            input.select();
                        }, 0, false)
                    }
                };
                scope.saveValue = function() {
                    scope.showThis = !scope.showThis;
                    if(scope.inputText == scope.bindValue) {return}
                    scope.modifyRowValue({
                        key: scope.bindKey,
                        value: scope.inputText
                    })();
                };
            }
        }}])

    // project --------------------------------------------------------------------------------

    .directive('projectTableKey', ['$timeout', function($timeout) {
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
            link: function(scope, element){
                var input = element.find('input');
                scope.showThis = true;
                scope.inputText = scope.bindValue;
                scope.isReservedKey = function() {
                    // 不能删除的 key
                    return (
                        scope.bindValue == '_rev' ||
                        scope.bindValue == 'type' ||
                        scope.bindValue == 'services'
                    );
                };
                scope.transEditState = function() {
                    // 不能编辑的 key
                    if('_rev' != scope.bindValue &&
                        'type' != scope.bindValue &&
                        'services' != scope.bindValue)
                    {
                        scope.showThis = !scope.showThis;
                        $timeout(function() {
                            input.focus();
                            input.select();
                        }, 0, false);
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

    .directive('projectTableValue',['$timeout', function($timeout){
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
            controller: function($scope, $element) {
                if('services' === $scope.bindKey) {
                    $scope.services = angular.fromJson($scope.bindValue);
                    var html = '';
                    var b = $element.find('b');
                    angular.forEach($scope.services, function(service) {
                        html += '<a href="service/'+ service + '">' + service + '</a>'
                    });
                    b.html(html);
                }
                //console.log('controller');
        },
            compile: function(element, attrs, transclude) {
                return {
                    pre: function() {
                        var b = element.find('b');
                        console.log(b);


                    }
                }
            },
            link: function(scope, element, attr){
                var input = element.find('input');
                //var b = element.find('b');
                scope.showThis = true;

                if('services' === scope.bindKey) {
                    scope.services = angular.fromJson(scope.bindValue);
                    scope.inputText = '';
                    var html = '';
                    angular.forEach(scope.services, function(service) {
                        html += '<a href="service/'+ service + '">' + service + '</a>'
                    });
                    b.html(html);
                    scope.$watch(function() {return scope.inputText}, function(newValue, oldValue) {
                        if(newValue) {console.log(newValue, oldValue);}
                    });
                } else {
                    scope.inputText = scope.bindValue;
                }

                scope.show = function () {
                    // services not show
                    if('services' === scope.bindKey) {
                        return false;
                    } else {
                        return scope.showThis;
                    }
                };

                scope.transServiceEditState = function() {
                    //b.empty();
                    scope.showThis = !scope.showThis;

                };

                scope.transEditState = function() {
                    // 不能编辑的 value
                    if(
                        '_rev' != scope.bindKey &&
                        'type' != scope.bindKey
                    ) {
                        scope.showThis = !scope.showThis;
                        $timeout(function() {
                            input.focus();
                            input.select();
                        }, 0, false);
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