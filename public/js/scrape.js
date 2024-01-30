let hasScraped = false;
let data = undefined;

const downloadFile = (filename, dataStr, fileType) => {
  const blob = new Blob([dataStr], {
    type: `type/${fileType}`,
  });
  const link = document.createElement("a");

  link.download = `${filename}.${fileType}`;
  link.href = window.URL.createObjectURL(blob);
  link.dataset.downloadurl = [
    `type/${fileType}`,
    link.download,
    link.href,
  ].join(":");

  const evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  link.dispatchEvent(evt);
  link.remove();
};

const fetchData = async (query) => {
  // Create the url to the API endpoint
  const baseURL = `http://localhost:3000`;
  const params = `q=${encodeURIComponent(query)}`;
  const url = `${baseURL}?${params}`;

  // Fetch and await for the response
  const data = await fetch(url, { method: "GET" });
  const json = await data.json();
  console.log(json);
  hasScraped = true;
  return json;
};

const OBJtoXML = (obj) => {
  var xml = "";
  for (var prop in obj) {
    xml += obj[prop] instanceof Array ? "" : "<" + prop + ">";
    if (obj[prop] instanceof Array) {
      for (var array in obj[prop]) {
        xml += "<" + prop + ">";
        xml += OBJtoXML(new Object(obj[prop][array]));
        xml += "</" + prop + ">";
      }
    } else if (typeof obj[prop] == "object") {
      xml += OBJtoXML(new Object(obj[prop]));
    } else {
      xml += obj[prop];
    }
    xml += obj[prop] instanceof Array ? "" : "</" + prop + ">";
  }
  var xml = xml.replace(/<\/?[0-9]{1,}>/g, "");
  return xml;
};

const OBJtoCSV = (obj) => {
  let fields = Object.keys(obj[0]);
  console.log(fields);
  let replacer = function (key, value) {
    return value === null ? "" : value;
  };
  let csv = obj.map(function (row) {
    return fields
      .map(function (fieldName) {
        return JSON.stringify(row[fieldName], replacer);
      })
      .join(",");
  });
  csv.unshift(fields.join(",")); // add header column
  csv = csv.join("\r\n");

  return csv;
};

/**
 * Converts the API-given response (JSON) into the param-given format
 * @param {object} data - The data to convert to
 * @param {string} format - The format to convert to
 * @returns {string} - The string ready to download
 */
const convertData = (data, format) => {
  const conversionFuncs = {
    json: (data) => JSON.stringify(data),
    csv: (data) => OBJtoCSV(data),
    xml: (data) => OBJtoXML(data),
  };

  const def = conversionFuncs["json"](data);
  return conversionFuncs[format](data) || def;
};

const serveData = (el) => {
  //! Feedback missing
  if (!data) return;
  const fileType = el.dataset?.type || "json";
  console.log(fileType);
  const toSave = convertData(data, fileType);
  console.log(toSave);
  // Get input data
  const input = document.getElementById("query");
  const filename = input.value;
  downloadFile(filename, toSave, fileType);

  // Convert it into every download file
  // Serve it as download
};


const copyToClipboard = el => {
  const text = el.innerHTML;
  navigator.clipboard.writeText(text);
  alert(`Copied to clipboad: ${text}`);
}


const renderData = (data) => {
  let listBody = "";
  for(let customer of data) {
    let newCustomer = `<div class="customer-info"><a class="customer-info__url" href="${customer.url}" target="_blank">${customer.url}</a>`;
    let emails = `<ul class="customer-info__emails-list">`;
    for(let email of customer.emails) {
      emails += `<li class="customer-info__email" onclick="copyToClipboard(this)">${email}</li>`;
    }
    
    emails += "</ul></div>";

    newCustomer += emails;
    listBody += newCustomer;
  }

  const customersList = document.getElementById("customers-list");
  customersList.innerHTML = listBody;
};



const search = async () => {
  // Get input data
  const input = document.getElementById("query");

  if (!input.value.length) {
    alert("Please, write a query to search.");
    return;
  }

  document.body.classList.add("animated");
  console.log("done");
  data = await fetchData(input.value);
  renderData(data);
  const downloadsList = document.getElementById("download-methods-list");
  downloadsList.classList.add("active");
};
