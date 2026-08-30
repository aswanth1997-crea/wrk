/* ============================================================
   AD203 Professor Portal — professor.js
   Simple static resource manager. No server, no database, no
   uploads. It reads resources/data.js (window.COURSE_DATA) and
   shows which files are registered per unit.

   To add a file:
     1. Copy the file into  resources/AD203/Unit-N/
     2. Add an entry to the "resources" array in resources/data.js
   ============================================================ */
(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var VIEWS = { overview: "Overview", resources: "Resources" };

  var state = { activeView: "overview" };

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function units() { return API.allUnits(); }
  function resources() { return API.resourceRegistry(); }
  function course() { return (window.COURSE_DATA && window.COURSE_DATA.courses[0]) || {}; }

  /* ---------------- Sidebar / view switching ---------------- */
  var sidebarToggle = $("#sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      $("#adminSidebar").classList.toggle("is-open");
    });
  }

  var nav = $("#adminNav");
  if (nav) {
    nav.addEventListener("click", function (e) {
      var item = e.target.closest("[data-view]");
      if (!item) return;
      setView(item.getAttribute("data-view"));
      $("#adminSidebar").classList.remove("is-open");
    });
  }

  function setView(name) {
    state.activeView = name;
    $$(".admin-nav__item").forEach(function (n) {
      n.classList.toggle("is-active", n.getAttribute("data-view") === name);
    });
    var title = $("#adminViewTitle");
    if (title) title.textContent = VIEWS[name] || "Overview";
    renderView(name);
  }

  /* ---------------- View renderer ---------------- */
  var viewsEl = $("#adminViews");

  function renderView(name) {
    if (!viewsEl) return;
    viewsEl.innerHTML = '<div class="admin-view">' + (name === "resources" ? renderResources() : renderOverview()) + "</div>";
  }

  function resourceCount(unitNum) {
    return resources().filter(function (r) {
      return String(r.unit || "").replace("Unit ", "") === String(unitNum);
    }).length;
  }

  function renderOverview() {
    var res = resources();
    var unitRows = units().map(function (u, i) {
      var n = i + 1;
      return '<div class="admin-row"><div class="admin-row__main">' +
        '<div class="admin-row__title">Unit ' + n + " — " + esc(u.title) + "</div>" +
        '<div class="admin-row__sub">' + esc(u.weeks || "") + "</div></div>" +
        '<div class="admin-row__actions"><span class="admin-pill admin-pill--published">' + resourceCount(n) + " files</span></div></div>";
    }).join("");

    return '<div class="admin-stats">' +
      statCard(res.length, "Total resources", "registered files") +
      statCard(units().length, "Units", "AD203 course") +
    "</div>" +
    '<div class="admin-panel"><div class="admin-panel__head"><h3 class="admin-panel__title">Course structure</h3></div>' +
      (unitRows || emptyState("No units.")) +
    "</div>" +
    '<div class="admin-panel"><div class="admin-panel__head"><h3 class="admin-panel__title">How to add a resource</h3></div>' +
      '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">1. Copy the file</div>' +
      '<div class="admin-row__sub">Put the PDF / PPT / DOC into the matching folder, e.g. resources/AD203/Unit-1/</div></div></div>' +
      '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">2. Register it</div>' +
      '<div class="admin-row__sub">Add an entry to the "resources" array in resources/data.js (title, type, course, unit, session, file).</div></div></div>' +
      '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">3. Refresh</div>' +
      '<div class="admin-row__sub">Students see the resource with View / Download buttons immediately.</div></div></div>' +
    "</div>";
  }

  function statCard(value, label, hint) {
    return '<div class="admin-stat"><div class="admin-stat__value">' + value + "</div>" +
      '<div class="admin-stat__label">' + esc(label) + "</div>" +
      (hint ? '<div class="admin-stat__hint">' + esc(hint) + "</div>" : "") + "</div>";
  }

  function renderResources() {
    var res = resources();
    var rows = res.map(function (r) {
      var href = r.type === "link" ? r.url : r.file;
      var folder = "resources/AD203/" + (r.unit || "");
      return '<div class="admin-row" data-row="resources">' +
        '<div class="admin-row__main">' +
          '<div class="admin-row__title">' + esc(r.title) + "</div>" +
          '<div class="admin-row__sub">' + esc(r.unit || "—") + (r.session ? " · " + esc(r.session) : "") +
            " · " + esc(r.type || "").toUpperCase() + " · <code>" + esc(r.file || "") + "</code></div>" +
        "</div>" +
        '<div class="admin-row__actions">' +
          (href && href !== "#"
            ? '<a class="btn btn--ghost btn--sm" href="' + esc(href) + '" target="_blank" rel="noopener">View / Open</a>' +
              (r.type !== "link" ? '<a class="btn btn--ghost btn--sm" href="' + esc(href) + '" download>Download</a>' : "")
            : "") +
        "</div></div>";
    }).join("");

    return '<div class="admin-view__head"><div><h2 class="admin-view__title">Resources</h2>' +
      '<p class="admin-view__lede">Files registered for ' + esc((course().code || "AD203") + " — " + (course().name || "Artificial Intelligence")) +
      ". Add files by copying them into <code>resources/AD203/Unit-N/</code> and adding an entry in <code>resources/data.js</code>.</p></div></div>" +
      '<div class="admin-filterbar"><input type="search" placeholder="Filter resources…" data-filter="resources" aria-label="Filter resources"></div>' +
      '<div class="admin-panel">' +
        (rows || emptyState("No resources registered yet.")) +
      "</div>" +
      '<div class="admin-panel"><div class="admin-panel__head"><h3 class="admin-panel__title">Unit folders</h3></div>' +
      units().map(function (u, i) {
        return '<div class="admin-row"><div class="admin-row__main">' +
          '<div class="admin-row__title">' + esc(u.title) + "</div>" +
          '<div class="admin-row__sub"><code>resources/AD203/Unit-' + (i + 1) + "/</code></div></div>" +
          '<div class="admin-row__actions"><span class="admin-pill admin-pill--published">' + resourceCount(i + 1) + " files</span></div></div>";
      }).join("") +
      "</div>";
  }

  function emptyState(msg) {
    return '<div class="admin-empty">' + esc(msg) + "</div>";
  }

  /* ---------------- Filter ---------------- */
  if (viewsEl) {
    viewsEl.addEventListener("input", function (e) {
      var inp = e.target.closest("[data-filter]");
      if (!inp) return;
      var q = inp.value.toLowerCase();
      viewsEl.querySelectorAll("[data-row]").forEach(function (row) {
        row.style.display = row.textContent.toLowerCase().indexOf(q) === -1 ? "none" : "";
      });
    });
  }

  /* ---------------- Init ---------------- */
  var pill = $("#adminStatusPill");
  if (pill) pill.textContent = resources().length + " resources";

  renderView("overview");
})();
