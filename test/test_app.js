/**
 * Created by web on 2015/9/29.
 */

'use strict';

describe('app test case', function() {
    beforeEach(angular.mock.module('cmdb'));

    it('value _path.join function test', inject(function(_path) {
        expect(_path.join('path')).toEqual('/api/v1/path');
        expect(_path.join('path', 'path2')).toEqual('/api/v1/path/path2')
    }));
});
