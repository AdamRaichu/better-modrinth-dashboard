var lastHref = "UNSET";
setInterval(function () {
  if (location.href !== lastHref && location.href.includes("modrinth.com/dashboard/projects")) {
    injectCustomDash();
  }
  lastHref = location.href;
}, 1000);

window.parent.addEventListener("message", function (msg) {
  if (msg.data.cmd === "iframe-height") {
    console.log("Changing iframe height to " + msg.data.height);
    iframe_height = msg.data.height;
  }
});

var iframe_height = 100;

function injectCustomDash() {
  const injected = document.createElement("iframe");
  // window.removeEventListener("message", handleMessage);
  injected.src = chrome.runtime.getURL("./src/embed.html");
  injected.id = "AdamRaichu-BetterModrinthDashboard-Dashboard-Iframe";
  injected.style.height = `${iframe_height}px`;

  setInterval(() => {
    injected.style.height = `${iframe_height}px`;
  }, 500);

  const title = document.createElement("h2");
  title.innerText = "Custom Projects View";

  const container = document.querySelector("section.universal-card");

  container.prepend(document.createElement("hr"));
  container.prepend(injected);
  container.prepend(title);

  const computed = getComputedStyle(injected.parentElement);
  setTimeout(function () {
    chrome.runtime.sendMessage({
      cmd: "modrinth-styles",
      styles: [
        { name: "--color-raised-bg", color: computed.getPropertyValue("--color-raised-bg") },
        { name: "--color-table-alternate-row", color: computed.getPropertyValue("--color-table-alternate-row") },
        { name: "--color-text-dark", color: computed.getPropertyValue("--color-text-dark") },
        { name: "--color-bg", color: computed.getPropertyValue("--color-bg") },
        { name: "--color-brand", color: computed.getPropertyValue("--color-brand") },
        { name: "--color-brand-inverted", color: computed.getPropertyValue("--color-brand-inverted") },
      ],
    });
  }, 100);
  document.querySelector("#AdamRaichu-BetterModrinthDashboard-Dashboard-Iframe + hr + div h2").innerText = "Default Projects View";
}
