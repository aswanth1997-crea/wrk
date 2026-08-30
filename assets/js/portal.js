/* ============================================================
   AD203 Course Portal — student portal JS
   Renders the student-facing site from the static COURSE_DATA
   (resources/data.js). No server required.
   Includes: course switcher, dashboard, tabs, search/filter,
   announcements, dates, syllabus (units/topics), schedule.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var state = {
    courses: [],
    resources: [],
    assignments: [],
    questions: [],
    announcements: [],
    dates: [],
    references: [],
    searchQ: "",
    filterUnit: "",
    filterType: ""
  };

  var courseId = null;
  var currentCourse = null;

  /* ---------------- Icons ---------------- */
  var ICONS = {
    ppt: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M12 12v4"/><path d="M9 13h6"/></svg>',
    pdf: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M9 13h6"/><path d="M12 11v6"/></svg>',
    doc: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    notes: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></svg>',
    image: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    link: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    book: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
    site: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
    megaphone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>',
    upload: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M12 16v-6"/><path d="m9 12 3-3 3 3"/></svg>',
    download: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>',
    eye: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    external: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    empty: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>'
  };

  /* ---------------- Helpers ---------------- */
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function fmtShort(iso) {
    if (!iso) return "";
    var d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
  }

  function typeIcon(type) { return ICONS[type] || ICONS.doc; }
  function typeLabel(type) { return { ppt: "PPT", pdf: "PDF", doc: "Doc", notes: "Notes", image: "Image", link: "Link" }[type] || type; }

  function unitById(id) {
    if (!currentCourse || !currentCourse.units) return null;
    return currentCourse.units.find(function (u) { return u.id === id; }) || null;
  }

  function unitName(id) {
    var u = unitById(id);
    return u ? u.title : "Unit";
  }

  /* Resources in the static data use unit labels like "Unit 1".
     Map them to the matching unit id in the current course. */
  function unitIdFromLabel(label) {
    if (!label || !currentCourse || !currentCourse.units) return "";
    var m = String(label).match(/(\d+)/);
    var idx = m ? parseInt(m[1], 10) - 1 : -1;
    var u = currentCourse.units[idx];
    return u ? u.id : "";
  }

  function unitCode(id) {
    var u = unitById(id);
    if (!u || !currentCourse) return "";
    var idx = currentCourse.units.indexOf(u);
    return "Unit " + ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][idx] || "";
  }

  function fileHref(file) {
    if (!file) return "#";
    if (/^https?:/.test(file) || file.startsWith("mailto:")) return file;
    return file;
  }

  /* ---------------- Course switcher ---------------- */
  var courseSelect = document.getElementById("courseSelect");

  function renderCourseSwitcher() {
    if (!courseSelect) return;
    courseSelect.innerHTML = state.courses.map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (c.id === courseId ? " selected" : "") + ">" +
        esc(c.code + " — " + c.name) + "</option>";
    }).join("");
    var wrap = courseSelect.closest(".course-switch");
    if (wrap) wrap.style.display = state.courses.length > 1 ? "" : "none";
  }

  if (courseSelect) {
    courseSelect.addEventListener("change", function () {
      var next = courseSelect.value;
      if (next && next !== courseId) {
        courseId = next;
        try { localStorage.setItem("ad203-active-course", next); } catch (e) {}
        loadCourse(next);
      }
    });
  }

  /* ---------------- Data loading ---------------- */
  async function loadCourses() {
    try {
      var data = await API.courses();
      state.courses = data.courses || [];
      var saved = null;
      try { saved = localStorage.getItem("ad203-active-course"); } catch (e) {}
      var first = state.courses[0];
      var pick = state.courses.find(function (c) { return c.id === saved; }) || first;
      if (pick) {
        courseId = pick.id;
        renderCourseSwitcher();
        await loadCourse(courseId);
      } else {
        renderEmptyAll();
      }
    } catch (e) {
      renderEmptyAll();
    }
  }

  async function loadCourse(id) {
    try {
      var all = await Promise.all([
        API.course(id),
        API.courseResources(id),
        API.courseAssignments(id),
        API.courseQuestions(id),
        API.courseAnnouncements(id),
        API.courseDates(id),
        API.courseReferences(id)
      ]);
      currentCourse = all[0].course;
      state.resources = all[1].resources || [];
      state.assignments = all[2].assignments || [];
      state.questions = all[3].questions || [];
      state.announcements = all[4].announcements || [];
      state.dates = all[5].dates || [];
      state.references = all[6].references || [];
      populateUnitFilter();
      renderAll();
    } catch (e) {
      renderEmptyAll();
    }
  }

  function renderEmptyAll() {
    ["dashAnnouncements", "dashDates", "dashUploads", "announceList", "datesTimeline",
     "panel-units", "panel-ppts", "panel-materials", "panel-assignments", "panel-questions", "panel-references"
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = '<div class="hub-empty">' + ICONS.empty + "<p>Data unavailable</p></div>";
    });
  }

  /* ---------------- Renderers ---------------- */
  function renderDashboard() {
    var dA = document.getElementById("dashAnnouncements");
    var dD = document.getElementById("dashDates");
    var dU = document.getElementById("dashUploads");

    var anns = state.announcements.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }).slice(0, 3);
    var today = new Date().toISOString().slice(0, 10);
    var dates = state.dates.slice().filter(function (d) { return d.date >= today; }).sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(0, 3);
    var ups = state.resources.slice().slice(0, 3);

    if (dA) dA.innerHTML = anns.map(function (a) {
      return '<div class="dash-item"><span class="dash-item__icon">' + ICONS.megaphone + "</span>" +
        '<div class="dash-item__body"><div class="dash-item__title">' + esc(a.title) + "</div>" +
        '<div class="dash-item__meta">' + esc(a.tag || "Notice") + " &middot; " + esc(fmtShort(a.date)) + "</div></div></div>";
    }).join("") || '<div class="hub-empty">' + ICONS.empty + "<p>No announcements</p></div>";

    if (dD) dD.innerHTML = dates.map(function (d) {
      return '<div class="dash-item"><span class="dash-item__icon">' + ICONS.calendar + "</span>" +
        '<div class="dash-item__body"><div class="dash-item__title">' + esc(d.title) + "</div>" +
        '<div class="dash-item__meta">' + esc(fmtShort(d.date)) + " &middot; " + esc(d.type) + "</div></div></div>";
    }).join("") || '<div class="hub-empty">' + ICONS.empty + "<p>No upcoming dates</p></div>";

    if (dU) dU.innerHTML = ups.map(function (r) {
      return '<div class="dash-item"><span class="dash-item__icon">' + ICONS.upload + "</span>" +
        '<div class="dash-item__body"><div class="dash-item__title">' + esc(r.title) + "</div>" +
        '<div class="dash-item__meta">' + esc(r.unit || "Unit") + " &middot; " + esc(typeLabel(r.type)) + "</div></div></div>";
    }).join("") || '<div class="hub-empty">' + ICONS.empty + "<p>No uploads yet</p></div>";
  }

  function renderAnnouncements() {
    var list = document.getElementById("announceList");
    if (!list) return;
    var items = state.announcements.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    list.innerHTML = items.map(function (a) {
      return '<article class="announce-card' + (a.pinned ? " is-pinned" : "") + '" data-reveal>' +
        '<div class="announce-card__head"><span class="announce-card__tags">' +
          '<span class="announce-tag">' + esc(a.tag || "Notice") + "</span>" +
          (a.pinned ? '<span class="announce-tag announce-tag--pinned">Pinned</span>' : "") +
        "</span><span class=\"announce-card__date\">" + esc(fmtDate(a.date)) + "</span></div>" +
        '<h3 class="announce-card__title">' + esc(a.title) + "</h3>" +
        '<p class="announce-card__body">' + esc(a.body) + "</p></article>";
    }).join("") || '<div class="hub-empty">' + ICONS.empty + "<p>No announcements yet</p></div>";
    observeReveals();
  }

  function renderDates() {
    var tl = document.getElementById("datesTimeline");
    if (!tl) return;
    var today = new Date().toISOString().slice(0, 10);
    var items = state.dates.slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
    tl.innerHTML = items.map(function (d) {
      var cls = d.date < today ? "is-past" : d.date === today ? "is-today" : "";
      var p = String(d.date).split("-");
      var mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(p[1], 10) - 1] || "";
      return '<div class="dates-item ' + cls + '" data-reveal>' +
        '<div class="dates-item__badge"><span class="dates-item__day">' + parseInt(p[2], 10) + '</span><span class="dates-item__mon">' + mon + " " + (p[0] || "") + "</span></div>" +
        '<div class="dates-item__card"><div class="dates-item__title">' + esc(d.title) + "</div>" +
        '<span class="dates-item__type">' + esc(d.type) + "</span></div></div>";
    }).join("") || '<div class="hub-empty">' + ICONS.empty + "<p>No dates scheduled</p></div>";
    observeReveals();
  }

  function renderUnits() {
    var panel = document.getElementById("panel-units");
    if (!panel || !currentCourse) return;
    var units = currentCourse.units || [];
    var grid = document.createElement("div");
    grid.className = "units-grid";
    units.forEach(function (u) {
      var resCount = state.resources.filter(function (r) { return unitIdFromLabel(r.unit) === u.id; }).length;
      var topics = (u.topics || []).slice(0, 6);
      grid.insertAdjacentHTML("beforeend",
        '<article class="unit-card" data-reveal>' +
          '<div class="unit-card__head"><span class="unit-card__code">' + esc(unitCode(u.id)) + "</span>" +
          '<span class="unit-status unit-status--done">Active</span></div>' +
          '<h3 class="unit-card__title">' + esc(u.title) + "</h3>" +
          (u.weeks ? '<p class="unit-card__weeks">' + esc(u.weeks) + "</p>" : "") +
          '<div class="unit-card__topics">' + topics.map(function (t) { return '<span class="unit-card__topic">' + esc(t.title) + "</span>"; }).join("") + "</div>" +
          '<p class="unit-card__count">' + resCount + " resource" + (resCount === 1 ? "" : "s") + "</p>" +
        "</article>");
    });
    panel.innerHTML = "";
    panel.appendChild(grid);
    if (!units.length) panel.insertAdjacentHTML("beforeend", '<div class="hub-empty">' + ICONS.empty + "<p>No units published yet</p></div>");
    observeReveals();
  }

  function resourceMatches(r) {
    var hay = (r.title + " " + (r.desc || "") + " " + (r.unit || "") + " " + (r.session || "") + " " + typeLabel(r.type) + " " + (r.tags || []).join(" ")).toLowerCase();
    var q = state.searchQ.toLowerCase();
    if (q && hay.indexOf(q) === -1) return false;
    if (state.filterUnit && unitIdFromLabel(r.unit) !== state.filterUnit) return false;
    if (state.filterType && r.type !== state.filterType) return false;
    return true;
  }

  function resourceCard(r) {
    var href = r.type === "link" ? r.url : fileHref(r.file);
    return '<article class="res-card" data-reveal>' +
      '<div class="res-card__top"><span class="res-card__type res-card__type--' + esc(r.type) + '">' + typeLabel(r.type) + "</span>" +
      '<span class="res-card__icon">' + typeIcon(r.type) + "</span></div>" +
      '<h3 class="res-card__title">' + esc(r.title) + "</h3>" +
      (r.desc ? '<p class="res-card__desc">' + esc(r.desc) + "</p>" : "") +
      '<div class="res-card__meta">' +
        "<span>" + esc(r.unit || "Unit") + "</span>" +
        (r.session ? "<span>" + esc(r.session) + "</span>" : "") +
        "<span>" + esc(typeLabel(r.type)) + "</span>" +
      "</div>" +
      '<div class="res-card__actions">' +
        (href && href !== "#"
          ? '<a class="btn btn--primary btn--sm" href="' + esc(href) + '" target="_blank" rel="noopener">' + ICONS.eye + "View / Open</a>" +
            (r.type !== "link" ? '<a class="btn btn--ghost btn--sm" href="' + esc(href) + '" download>' + ICONS.download + "Download</a>" : "")
          : '<span class="res-card__desc" style="color:var(--color-muted);">File not uploaded yet</span>') +
      "</div></article>";
  }

  function renderResources() {
    var pptsPanel = document.getElementById("panel-ppts");
    var matsPanel = document.getElementById("panel-materials");
    if (!pptsPanel || !matsPanel) return;

    var ppts = state.resources.filter(function (r) { return r.type === "ppt" && resourceMatches(r); });
    var mats = state.resources.filter(function (r) { return r.type !== "ppt" && resourceMatches(r); });

    pptsPanel.innerHTML = "";
    var g1 = document.createElement("div");
    g1.className = "res-grid";
    ppts.forEach(function (r) { g1.insertAdjacentHTML("beforeend", resourceCard(r)); });
    pptsPanel.appendChild(g1);
    if (!ppts.length) pptsPanel.insertAdjacentHTML("beforeend", emptyState("No presentations match."));

    matsPanel.innerHTML = "";
    var g2 = document.createElement("div");
    g2.className = "res-grid";
    mats.forEach(function (r) { g2.insertAdjacentHTML("beforeend", resourceCard(r)); });
    matsPanel.appendChild(g2);
    if (!mats.length) matsPanel.insertAdjacentHTML("beforeend", emptyState("No study materials match."));

    observeReveals();
  }

  function renderAssignments() {
    var panel = document.getElementById("panel-assignments");
    if (!panel) return;
    var items = state.assignments.filter(function (a) {
      var hay = (a.title + " " + (a.desc || "") + " " + unitName(a.unitId)).toLowerCase();
      if (state.searchQ && hay.indexOf(state.searchQ.toLowerCase()) === -1) return false;
      if (state.filterUnit && a.unitId !== state.filterUnit) return false;
      return true;
    });
    panel.innerHTML = "";
    var grid = document.createElement("div");
    grid.className = "res-grid";
    items.forEach(function (a) {
      grid.insertAdjacentHTML("beforeend",
        '<article class="res-card assign-card" data-reveal>' +
          '<div class="res-card__top"><span class="res-card__type">Assignment</span>' +
          '<span class="assign-card__marks">' + esc(a.marks) + "<br><small>marks</small></span></div>" +
          '<h3 class="res-card__title">' + esc(a.title) + "</h3>" +
          (a.desc ? '<p class="res-card__desc">' + esc(a.desc) + "</p>" : "") +
          '<div class="res-card__meta">' +
            "<span>" + esc(unitName(a.unitId)) + "</span>" +
            (a.assigned ? "<span>Set " + esc(fmtShort(a.assigned)) + "</span>" : "") +
            (a.due ? '<span class="assign-card__due">' + ICONS.clock + "Due " + esc(fmtDate(a.due)) + "</span>" : "") +
          "</div>" +
          (a.file ? '<div class="res-card__actions"><a class="btn btn--ghost btn--sm" href="' + esc(fileHref(a.file)) + '" target="_blank" rel="noopener">' + ICONS.download + "Assignment file</a></div>" : "") +
        "</article>");
    });
    panel.appendChild(grid);
    if (!items.length) panel.insertAdjacentHTML("beforeend", emptyState("No assignments match."));
    observeReveals();
  }

  function renderQuestions() {
    var panel = document.getElementById("panel-questions");
    if (!panel || !currentCourse) return;
    panel.innerHTML = "";
    var units = currentCourse.units || [];
    var levelName = { short: "Short Questions", medium: "Medium Questions", long: "Long Questions" };
    var shown = 0;

    units.forEach(function (u) {
      var unitQs = state.questions.filter(function (q) { return q.unitId === u.id; });
      if (!unitQs.length) return;
      var group = document.createElement("div");
      group.className = "qb-group";
      group.innerHTML = '<div class="qb-group__head"><h3 class="qb-group__title">' +
        '<span class="qb-chip">' + esc(unitCode(u.id)) + "</span>" + esc(u.title) + "</h3></div>";

      ["short", "medium", "long"].forEach(function (level) {
        var levelQs = unitQs.filter(function (q) { return q.level === level; });
        if (!levelQs.length) return;
        var block = document.createElement("div");
        block.innerHTML = '<p class="qb-group__title" style="font-size:0.9rem;color:var(--color-muted);margin:0.6rem 0 0.5rem;">' + levelName[level] + "</p>";
        levelQs.forEach(function (q, i) {
          shown++;
          block.insertAdjacentHTML("beforeend",
            '<div class="qb-item" data-reveal>' +
              '<span class="qb-item__num">' + (i + 1) + "</span>" +
              '<span class="qb-item__text">' + esc(q.question) + "</span>" +
              (q.marks ? '<span class="qb-item__marks">' + esc(q.marks) + " marks</span>" : "") +
            "</div>");
        });
        group.appendChild(block);
      });
      panel.appendChild(group);
    });
    if (!shown) panel.insertAdjacentHTML("beforeend", emptyState("No questions published yet."));
    observeReveals();
  }

  function renderReferences() {
    var panel = document.getElementById("panel-references");
    if (!panel) return;
    var items = state.references.filter(function (r) {
      var hay = (r.title + " " + (r.desc || "") + " " + r.kind).toLowerCase();
      if (state.searchQ && hay.indexOf(state.searchQ.toLowerCase()) === -1) return false;
      return true;
    });
    panel.innerHTML = "";
    var grid = document.createElement("div");
    grid.className = "res-grid";
    items.forEach(function (r) {
      grid.insertAdjacentHTML("beforeend",
        '<article class="res-card ref-card" data-reveal>' +
          '<div class="res-card__top"><span class="ref-card__kind">' + esc(r.kind) + "</span>" +
          '<span class="res-card__icon">' + (r.kind === "site" ? ICONS.site : ICONS.book) + "</span></div>" +
          '<h3 class="res-card__title">' + esc(r.title) + "</h3>" +
          (r.desc ? '<p class="res-card__desc">' + esc(r.desc) + "</p>" : "") +
          (r.url && r.url !== "#" ? '<div class="res-card__actions"><a class="btn btn--ghost btn--sm" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + ICONS.external + "Visit</a></div>" : "") +
        "</article>");
    });
    panel.appendChild(grid);
    if (!items.length) panel.insertAdjacentHTML("beforeend", emptyState("No references yet."));
    observeReveals();
  }

  function emptyState(msg) {
    return '<div class="hub-empty">' + ICONS.empty + "<p>" + esc(msg) + "</p></div>";
  }

  function updateSearchCount() {
    var el = document.getElementById("hubSearchCount");
    if (!el) return;
    var total = state.resources.length + state.assignments.length + state.questions.length + state.references.length;
    el.textContent = (state.searchQ || state.filterUnit || state.filterType) ? total + " items" : "";
  }

  function renderAll() {
    renderDashboard();
    renderAnnouncements();
    renderDates();
    renderUnits();
    renderResources();
    renderAssignments();
    renderQuestions();
    renderReferences();
    updateSearchCount();
  }

  /* ---------------- Tabs ---------------- */
  var tabBar = document.getElementById("hubTabBar");
  if (tabBar) {
    tabBar.addEventListener("click", function (e) {
      var tab = e.target.closest(".tabs__tab");
      if (tab) activateTab(tab.getAttribute("data-tab"));
    });
    tabBar.addEventListener("keydown", function (e) {
      var tabs = Array.prototype.slice.call(tabBar.querySelectorAll(".tabs__tab"));
      var idx = tabs.indexOf(document.activeElement);
      if (idx === -1) return;
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(idx + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(idx - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        activateTab(next.getAttribute("data-tab"));
        next.focus();
      }
    });
  }

  function activateTab(name) {
    document.querySelectorAll(".tabs__tab").forEach(function (t) {
      var on = t.getAttribute("data-tab") === name;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
    });
    document.querySelectorAll(".tabs__panel").forEach(function (p) {
      var on = p.getAttribute("data-panel") === name;
      p.hidden = !on;
      p.classList.toggle("is-active", on);
    });
  }

  /* ---------------- Search + filters ---------------- */
  var searchInput = document.getElementById("hubSearchInput");
  var unitFilter = document.getElementById("hubUnitFilter");
  var typeFilter = document.getElementById("hubTypeFilter");

  function populateUnitFilter() {
    if (!unitFilter || !currentCourse) return;
    var current = unitFilter.value;
    var labels = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    unitFilter.innerHTML = '<option value="">All units</option>' +
      (currentCourse.units || []).map(function (u, i) {
        return '<option value="' + esc(u.id) + '">' + "Unit " + (labels[i] || (i + 1)) + "</option>";
      }).join("");
    unitFilter.value = current;
  }

  if (searchInput) searchInput.addEventListener("input", function () {
    state.searchQ = searchInput.value.trim();
    renderAll();
  });
  if (unitFilter) unitFilter.addEventListener("change", function () {
    state.filterUnit = unitFilter.value;
    renderAll();
  });
  if (typeFilter) typeFilter.addEventListener("change", function () {
    state.filterType = typeFilter.value;
    renderAll();
  });

  /* ---------------- Reveal observer ---------------- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });

  function observeReveals() {
    var els = document.querySelectorAll("[data-reveal]:not(.is-visible)");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    els.forEach(function (el) {
      if (el.dataset.revealObserved) return;
      el.dataset.revealObserved = "1";
      revealObs.observe(el);
    });
  }

  /* ---------------- Init ---------------- */
  loadCourses();
})();
