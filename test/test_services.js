/**
 * Created by web on 2015/9/29.
 */

'use strict';

describe('service test case', function() {
    beforeEach(angular.mock.module('cmdb'));
//    beforeEach(module('cmdb'));

    it('', inject(function(MainService, $httpBackend) {

        $httpBackend.expect('GET', 'http://localhost:8005/')
            .respond(200, "");

        MainService.getPorjects('/api/v1/project/_list')
            .then(function(data) {
                expect(data.success).toBeTruthy();
            });

        $httpBackend.flush();
    }));
});