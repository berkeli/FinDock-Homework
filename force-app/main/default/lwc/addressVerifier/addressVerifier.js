import { LightningElement, wire, api } from "lwc";
import { getFieldValue, getRecord, updateRecord } from "lightning/uiRecordApi";
import verifyAddresses from "@salesforce/apex/AddressVerifier.verifyAddress";

import ID_FIELD from "@salesforce/schema/Contact.Id";
import STREET from "@salesforce/schema/Contact.MailingStreet";
import CITY from "@salesforce/schema/Contact.MailingCity";
import STATE from "@salesforce/schema/Contact.MailingState";
import COUNTRY_CODE from "@salesforce/schema/Contact.MailingCountryCode";
import POSTAL_CODE from "@salesforce/schema/Contact.MailingPostalCode";
import ADDRESS_VALIDATED_ON from "@salesforce/schema/Contact.Address_Validated_On__c";
import ADDRESS_VALIDATION_PASSED from "@salesforce/schema/Contact.Address_Validation_Passed__c";

const fields = [
  ID_FIELD,
  STREET,
  CITY,
  STATE,
  COUNTRY_CODE,
  POSTAL_CODE,
  ADDRESS_VALIDATED_ON,
  ADDRESS_VALIDATION_PASSED
];

export default class addressVerifier extends LightningElement {
  @api recordId;

  //Addressy provides AQIs (A-E), this determines which quality indexes are deemed "Valid"
  VALID_AQIs = ["A", "B", "C"];

  loading = false;
  error;
  address;
  message;

  @wire(getRecord, { recordId: "$recordId", fields })
  wiredContact({ data, error }) {
    if (data) {
      this.address = {
        Street: getFieldValue(data, STREET),
        City: getFieldValue(data, CITY),
        State: getFieldValue(data, STATE),
        PostalCode: getFieldValue(data, POSTAL_CODE),
        CountryCode: getFieldValue(data, COUNTRY_CODE)
      };
      this.loading = false;
    } else if (error) {
      console.log("Contact fetching error", JSON.stringify(error));
      this.error = "Something went wrong";
    }
  }

  verifyAddressHandler() {
    this.loading = true;
    verifyAddresses({ addresses: [this.address] })
      .then((res) => res[0])
      .then((AQI) => {
        if (this.VALID_AQIs.includes(AQI)) {
          this.updateContact(true);
          this.message = `Address has been validated, and is valid. AQI is ${AQI}`;
        } else {
          this.updateContact(false);
          this.message = "Address has been validated, and is not valid. ";
          this.message +=
            AQI === "No Match" ? "No Matches Found" : `AQI is ${AQI}`;
        }
        this.loading = false;
      });
  }

  updateContact(validationResult) {
    const contactUpdate = {
      [ID_FIELD.fieldApiName]: this.recordId,
      [ADDRESS_VALIDATED_ON.fieldApiName]: new Date().toISOString(),
      [ADDRESS_VALIDATION_PASSED.fieldApiName]: validationResult
    };

    updateRecord({ fields: contactUpdate }).catch((error) => {
      console.log(error);
    });
  }
}
