import { LightningElement, wire, api, track } from "lwc";
import { getFieldValue, getRecord, updateRecord } from "lightning/uiRecordApi";

import ID_FIELD from "@salesforce/schema/Contact.Id";
import STREET from "@salesforce/schema/Contact.MailingStreet";
import CITY from "@salesforce/schema/Contact.MailingCity";
import COUNTRY_CODE from "@salesforce/schema/Contact.MailingCountryCode";
import POSTAL_CODE from "@salesforce/schema/Contact.MailingPostalCode";
import ADDRESS_VALIDATED_ON from "@salesforce/schema/Contact.Address_Validated_On__c";
import ADDRESS_VALIDATION_PASSED from "@salesforce/schema/Contact.Address_Validation_Passed__c";

const fields = [
  ID_FIELD,
  STREET,
  CITY,
  COUNTRY_CODE,
  POSTAL_CODE,
  ADDRESS_VALIDATED_ON,
  ADDRESS_VALIDATION_PASSED
];

export default class addressVerifier extends LightningElement {
  @api recordId;
  // URL for the API
  API_URL =
    "https://api.addressy.com/Cleansing/International/Batch/v1.00/json4.ws";
  // API Key for the API
  API_KEY = "HU97-UU48-AT54-RE59";

  //Addressy provides AQIs (A-E), this determines which quality indexes are deemed "Valid"
  VALID_AQIs = ["A", "B", "C"];

  @track contact;

  loading = false;
  error = undefined;

  @wire(getRecord, { recordId: "$recordId", fields })
  wiredContact({ data, error }) {
    if (data) {
      this.contact = data;
    } else if (error) {
      console.log("Contact fetching error", JSON.stringify(error));
      this.error = true;
    }
  }

  verifyAddressHandler() {
    this.loading = true;
    fetch(this.API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.requestBody())
    })
      .then((res) => res.json())
      .then((data) => {
        this.loading = false;
        const matches = data[0].Matches;
        console.log("matches: ", matches);
        console.log("data: ", data);
        if (matches.length === 0) {
          this.updateContact(false);
        } else {
          const AQI = matches[0].AQI;
          if (this.VALID_AQIs.includes(AQI)) {
            this.updateContact(true);
          } else {
            this.updateContact(false);
          }
        }
      })
      .catch((error) => {
        this.loading = false;
        this.error = error;
      });
  }

  updateContact(validationResult) {
    const fields = {
      [ID_FIELD.fieldApiName]: this.recordId,
      [ADDRESS_VALIDATED_ON.fieldApiName]: new Date().toISOString(),
      [ADDRESS_VALIDATION_PASSED.fieldApiName]: validationResult
    };

    updateRecord({ fields })
      .then(() => {
        console.log("Contact updated");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  formattedAddress() {
    return {
      Address1: getFieldValue(this.contact, STREET),
      Address2: getFieldValue(this.contact, CITY),
      Address3: getFieldValue(this.contact, POSTAL_CODE),
      Country: getFieldValue(this.contact, COUNTRY_CODE),
      PostalCode: getFieldValue(this.contact, POSTAL_CODE)
    };
  }

  requestBody() {
    return {
      Key: this.API_KEY,
      Addresses: [this.formattedAddress()]
    };
  }
}
