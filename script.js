chrome.storage.local.get(["urlStore"], function (result) {
  const siteList = document
    .getElementById("siteList")
    .getElementsByTagName("tbody")[0];

  for (let url in result.urlStore) {
    const newRow = siteList.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const timeSpentInMinutes = Math.round(result.urlStore[url].time / 6000);
    cell1.textContent = url;
    cell2.textContent = result.urlStore[url].count;
    cell3.textContent = `${timeSpentInMinutes} minutes`;
  }
});

document.getElementById("clearData").addEventListener("click", function () {
  chrome.storage.local.clear(function () {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    } else {
      // Data cleared successfully
      console.log("Data cleared");
      // Clear the table
      document
        .getElementById("siteList")
        .getElementsByTagName("tbody")[0].innerHTML = "";
      // Send a message to the background script to clear urlStore
      chrome.runtime.sendMessage({ action: "clearUrlStore" });
    }
  });
});
