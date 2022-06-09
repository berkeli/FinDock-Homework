import { createElement } from "lwc";
import addressVerifier from "c/addressVerifier";
import { getRecord } from "lightning/uiRecordApi";
import verifyAddresses from "@salesforce/apex/AddressVerifier.verifyAddress";

const mockGetRecord = require("./data/contact.json");

jest.mock(
  "@salesforce/apex/AddressVerifier.verifyAddress",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

describe("c-addressVerifier", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });
  it("Should render", () => {
    const element = createElement("c-addressVerifier", {
      is: addressVerifier
    });
    document.body.appendChild(element);
    expect(element).toBeTruthy();
  });
  it("should render a button when contact record is provided", () => {
    const element = createElement("c-addressVerifier", {
      is: addressVerifier
    });
    document.body.appendChild(element);
    getRecord.emit(mockGetRecord);

    return Promise.resolve().then(() => {
      const button = element.shadowRoot.querySelector("button");
      expect(button.title).toBe("Validate Address");
    });
  });

  it("should make an apex callout", () => {
    const element = createElement("c-addressVerifier", {
      is: addressVerifier
    });

    verifyAddresses.mockResolvedValue(["A"]);

    document.body.appendChild(element);
    getRecord.emit(mockGetRecord);

    return Promise.resolve().then(() => {
      const button = element.shadowRoot.querySelector("button");
      button.click();
      expect(verifyAddresses).toHaveBeenCalledTimes(1);
    });
  });

});