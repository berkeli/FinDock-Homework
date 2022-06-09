public with sharing class AddressVerifier {
    private static String API_URL = 'https://api.addressy.com/Cleansing/International/Batch/v1.00/json4.ws';
    // Loqate provides Address Quality Index, https://support.loqate.com/documentation/reportcodes/address-quality-index/
    /** 
    * Validates list of adresses and returns their AQIs 
    * Address must be in the format provided below
    * @param  addresses  this is a list of addresses in the follwing format: {
    *   "Street": "123 Main St",
    *   "City": "Anytown",
    *   "State": "California",
    *   "PostalCode": "12345",
    *   "CountryCode": "US" <- MUST be Alpha-2/3 country code
    * }
    * @return List of AQIs (Address Quality Index) for each address [A-E], if no match will return "No Match"
    */

    @AuraEnabled(cacheable=true)
    public static List<String> verifyAddresses(List<Map<String, String>> addresses) {
        // API Key is stored in a custom metadata in case it is needed to be updated in future
        String API_KEY = [SELECT API_key__c FROM API_Key__mdt WHERE DeveloperName = 'Addressy'].API_Key__c;

        // Parse Address objects
        List<Map<String, String>> addressCollection = new List<Map<String, String>>();

        // Interate through addresses and format the address to Loqate format
        for (Map<String, String>address : addresses) {
            addressCollection.add(formatAddress(address));   
        }

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(API_URL);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');

        String body = '{"Key": "'+API_KEY+'",';
        body += '"Addresses": ' + JSON.serialize(addressCollection) + '}';

        request.setBody(body);
        HttpResponse response = http.send(request);
        
        List <String> result = new List <String>();
        
        // Parse response and type cast LoqateResponseObject
        List<LoqateResponseObject> responseOBJ = (List<LoqateResponseObject>) JSON.deserialize(response.getBody(), List<LoqateResponseObject>.Class);

        // Iterate through responseOBJ and add the AQI for each address to result
        for (LoqateResponseObject singleAddress : responseOBJ) {
            if (singleAddress.Matches.size() == 0 || singleAddress.Matches[0].AQI == null) {
                result.add('No Match');
            } else {
                result.add(singleAddress.Matches[0].AQI);
            }           
        }
        
        return result;
    }

    // This formats the address into valid Loqate request format
    private static Map<String, String> formatAddress(Map<String, String> address) {
        Map<String, String> formattedAddress = new Map<String, String>();

        formattedAddress.put('Address1', address.get('Street'));
        formattedAddress.put('Address2', address.get('City'));
        formattedAddress.put('Address3', address.get('State'));
        formattedAddress.put('Address4', address.get('PostalCode'));
        formattedAddress.put('Country', address.get('CountryCode'));
        formattedAddress.put('PostalCode', address.get('PostalCode'));

        return formattedAddress;
    }
}
