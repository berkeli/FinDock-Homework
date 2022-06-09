@isTest
global class MockHttpResponseGenerator implements HttpCalloutMock {
    // Implement this interface method
    global HTTPResponse respond(HTTPRequest req) {
        // Optionally, only send a mock response for a specific endpoint
        // and method.
        System.assertEquals('https://api.addressy.com/Cleansing/International/Batch/v1.00/json4.ws', req.getEndpoint());
        System.assertEquals('POST', req.getMethod());
        
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('[{"Input":{"Address": "test"}, "Matches": [{"Address": "test","AQI":"A"}]}]');
        res.setStatusCode(200);
        return res;
    }
}
