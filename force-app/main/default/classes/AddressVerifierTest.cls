@isTest
private class AddressVerifierTest {
    @isTest 
    static void AddressVerifierTest() {
        test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        List <Map<String, String>> testList = new List<Map<String,String>>();
        Map<string, string> testAddress = new Map<string, string>();

        testAddress.put('Street', '123 Main St');
        testAddress.put('City', 'San Francisco');
        testAddress.put('State', 'CA');
        testAddress.put('PostalCode', '94107');
        testAddress.put('CountryCode', 'US');

        testList.add(testAddress);

        AddressVerifier av = new AddressVerifier();

        List<String> r = AddressVerifier.verifyAddresses(testList);

        System.assertEquals(r.size(), 1);
        System.assertEquals(r[0], 'A');
        test.stopTest();
    }
}
