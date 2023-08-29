const apiPath = "https://api.modrinth.com/v2/";
const LsProjectsList = "AdamRaichu.ModrinthDashboard.projectsList";

/**
 * @typedef ChromeMessageData
 * @property {String} cmd
 * @property {ChromeMessageColor[]} styles
 */
/**
 * @typedef ChromeMessageColor
 * @property {String} name
 * @property {String} color
 */
/**
 * @typedef ChromeMessage
 * @property {ChromeMessageData} data
 */

// Get the style data from dashboard.js
chrome.runtime.onMessage.addListener(function (/** @type {ChromeMessage}*/ msg) {
  switch (msg.cmd) {
    case "modrinth-styles":
      // Do stuff here.
      for (var c of msg.styles) {
        document.documentElement.style.setProperty(c.name, c.color);
      }
      break;

    default:
      break;
  }
});

$.ajaxSetup({
  headers: {
    "X-Project-Info": "AdamRaichu/better-modrinth-dashboard/ALPHA-TESTING",
  },
});

function verifySlug(slug) {
  const p = new Promise((resolve, reject) => {
    var a;
    $.getJSON(apiPath + "project/" + slug + "/check", function (data) {
      a = data;
    })
      .done(() => {
        resolve([true, a]);
      })
      .fail(() => {
        resolve([false, a]);
      });
  });
  return p;
}

function buildTable(projects) {
  const wrapper = document.getElementById("table-wrapper");

  // Remove old UI.
  wrapper.innerHTML = "";

  // If the user has not added any projects to the list.
  if (projects == null) {
    wrapper.appendChild(document.createElement("h3"));
    wrapper.firstElementChild.innerText = "You are not following any projects.";
    return;
  }

  // Create a new table element.
  table = document.createElement("table");
  table.id = "table";
  wrapper.appendChild(table);

  // Set a loading message so the user doesn't think it's broken.
  table.innerText = "Loading...";

  // Get the data from Modrinth.
  $.getJSON(apiPath + "projects?ids=" + JSON.stringify(projects), function (data) {
    console.log(data);
    table.innerHTML = "";
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th"));
    table.appendChild(headerRow);
    headerRow.children[0].innerText = "Name";
    for (var p in data) {
      const row = document.createElement("tr");
      row.appendChild(document.createElement("td"));
      row.children[0].innerText = data[p].title;
      // row.appendChild(document.createElement("td"));
      table.appendChild(row);
    }
    window.parent.postMessage({ cmd: "iframe-height", height: document.documentElement.scrollHeight }, "*");
  });
}

document.getElementById("add").addEventListener("click", function () {
  var slug = document.getElementById("slug").value;
  verifySlug(slug).then(function (result) {
    if (result[0]) {
      // Get followed projects from localStorage.
      var _projects = localStorage.getItem(LsProjectsList);

      // Use the Modrinth hash instead of the user provided id.
      slug = result[1].id;

      // If not present in localStorage, set to empty array.
      if (_projects == null) {
        _projects = JSON.stringify([]);
      }

      const projects = JSON.parse(_projects);

      // Make sure the slug isn't already in `projects`.
      if (projects.includes(slug)) {
        alert("That project is already on the list.");
        return;
      }

      // Everything checks out, so add it to the list.
      projects.push(slug);

      // Rebuild the UI
      buildTable(projects);

      // Store the list of projects for future use.
      localStorage.setItem(LsProjectsList, JSON.stringify(projects));
    } else {
      alert("Invalid project id.");
    }
  });
});

buildTable(JSON.parse(localStorage.getItem(LsProjectsList)));
