(function () {
  "use strict";
  var team = document.querySelector(".provider-team");
  if (!team) return;
  var roles = Array.from(team.querySelectorAll(".provider-role"));
  var controls = document.createElement("div");
  controls.className = "team-browser";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "Explore a planned CosmaBot coworker");
  function selectRole(selected) {
    roles.forEach(function (role) { role.hidden = role !== selected; });
    controls.querySelectorAll("button").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("aria-controls") === selected.id));
    });
  }
  roles.forEach(function (role) {
    var button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-controls", role.id);
    button.setAttribute("aria-pressed", "false");
    var image = role.querySelector("img").cloneNode();
    image.removeAttribute("loading");
    button.appendChild(image);
    button.appendChild(document.createTextNode(role.querySelector("h3").textContent));
    button.addEventListener("click", function () { selectRole(role); });
    controls.appendChild(button);
  });
  team.before(controls);
  team.classList.add("is-interactive");
  team.setAttribute("aria-live", "polite");
  selectRole(roles[0]);
})();
