(function () {
  "use strict";

  var allowedChannels = ["direct", "catholic", "mcd"];
  var channel = new URLSearchParams(window.location.search).get("channel");

  if (allowedChannels.indexOf(channel) === -1) return;

  document.querySelectorAll("[data-preserve-channel]").forEach(function (link) {
    var destination = new URL(link.href);
    destination.searchParams.set("channel", channel);
    link.href = destination.toString();
  });
})();
