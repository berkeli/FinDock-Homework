import { createElement } from "lwc";
import addressVerifier from "c/addressVerifier";
import { getRecord } from "lightning/uiRecordApi";

const mockGetRecord = require("./data/contact.json");
const mockApiResponse = {
  input: [{}],
  Matches: [
    {
      AQI: "A"
    }
  ]
};
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockApiResponse)
  })
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

  it("should make an API call to adressy", () => {
    const element = createElement("c-addressVerifier", {
      is: addressVerifier
    });

    document.body.appendChild(element);
    getRecord.emit(mockGetRecord);

    return Promise.resolve().then(() => {
      const button = element.shadowRoot.querySelector("button");
      button.click();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        "https://api.addressy.com/Cleansing/International/Batch/v1.00/json4.ws",
        expect.anything()
      );
    });
  });
});
