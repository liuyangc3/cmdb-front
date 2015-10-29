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

    .directive('projectTableValue',['$compile', '$timeout', 'HTTPService', function($compile, $timeout, HTTPService){
        return {
            //priority: 1000,  // 指令内部 加入了 ng-click 所以指令需要先被编译
            //terminal: true, // 忽略指令内部的其他指令,后面通过调用 $compile去编译他们
            restrict: 'AE',
            templateUrl: 'views/project/directive/rowValue.html',
            scope: {
                currentDb: '=',
                bindKey: '=',
                bindValue: '=',
                pushAlert: '&',
                modifyRowValue: '&'
            },
            replace: true,
            //compile: function(element, attrs, transclude) {
            //    var b = element.find('b');
            //    return {
            //        pre: function(scope, iElement, iAttrs, controller) {},
            //        post: function(scope, iElement, iAttrs, controller) {}
            //    }
            //},
            link: function(scope, element, attr){
                var input = element.find('input');
                var b = element.find('b');
                scope.showThis = true;


                if('services' === scope.bindKey) {
                    // services 是当前项目添加的服务
                    scope.services = angular.fromJson(scope.bindValue);
                    scope.inputText = '';
                    // 获取所有的services
                    HTTPService.list(scope.currentDb, 'service').success(function(data){
                        scope.servicesPool = angular.fromJson(data);

                    }).error(function(error){console.log(error);});

                    //var html = '';
                    //angular.forEach(scope.services, function(service, i) {
                    //    html += '<a href="service/{0}">{0}</a><a href ng-click="delService(i)">x</a>'.format(service);
                    //});
                    ////b.html(html);
                    //$compile(html)(scope, function(cloned, scpoe) {
                    //    // 避免ng-click re-compiled
                    //    b.append(cloned);
                    //});

                    // 监视 input的 变化
                    scope.$watch(function() {return scope.inputText}, function(newValue, oldValue) {
                        if(newValue) {
                            scope.match = []; // 下拉菜单
                            angular.forEach(scope.servicesPool, function(service) {
                                if (service.indexOf(newValue) >= 0) {
                                    scope.match.push(service);
                                }
                            });
                            if(0 != scope.match.length) {scope.matched = true;}

                        } else {
                            scope.match = [];
                            scope.matched = false;
                        }
                    });


                } else {
                    // 不是 services 的 key
                    scope.inputText = scope.bindValue;
                }
                scope.saveService = function(service) {
                    // scope.services
                    if(scope.services.indexOf(service) == -1) {
                        scope.services.push(service);
                        scope.modifyRowValue({
                            key: scope.bindKey,
                            value: scope.services
                        })();
                    }
                    scope.inputText = '';
                };
                scope.delService  = function(i) {
                    scope.services.splice(i, 1);
                    scope.modifyRowValue({
                        key: scope.bindKey,
                        value: scope.services
                    })();
                };
                scope.transServiceEditState = function() {
                    scope.showThis = !scope.showThis;
                    scope.inputText = '';
                };

                // services 不显示对号按钮
                scope.showButton = function() {
                    if('services' === scope.bindKey) {
                        return false;
                    } else {
                        return !scope.showThis;
                    }
                };

                // services 不显示 span
                scope.show = function () {
                    if('services' === scope.bindKey) {
                        return false;
                    } else {
                        return scope.showThis;
                    }
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