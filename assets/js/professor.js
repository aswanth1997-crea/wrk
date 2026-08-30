/* ============================================================
   AD203 Professor Portal — professor.js
   Dashboard overview and full CRUD management for courses,
   course plans, resources (with file uploads), assignments,
   question bank, announcements, academic dates, references,
   settings.
   No authentication — the portal opens directly. All data flows
   through the admin API (management convenience, not a security
   boundary).
   ============================================================ */
(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var VIEWS = {
    overview: "Overview",
    courses: "Courses",
    plan: "Course Plan",
    resources: "Resources",
    assignments: "Assignments",
    questions: "Question Bank",
    announcements: "Announcements",
    dates: "Academic Calendar",
    references: "References",
    settings: "Settings"
  };

  var state = {
    courses: [],
    resources: [],
    assignments: [],
    questions: [],
    announcements: [],
    dates: [],
    references: [],
    settings: {},
    activeCourse: null,   // course id filter
    activeView: "overview"
  };

  var TYPE_OPTIONS = ["ppt", "pdf", "doc", "notes", "image", "link"];
  var STATUS_OPTIONS = ["draft", "published", "archived"];
  var KIND_OPTIONS = ["book", "paper", "site"];
  var LEVEL_OPTIONS = ["short", "medium", "long"];
  var DIFF_OPTIONS = ["easy", "medium", "hard"];
  var TAG_OPTIONS = ["Notice", "Material", "Assignment", "Exam", "Syllabus"];
  var DATE_TYPE_OPTIONS = ["Deadline", "Exam", "Assignment", "Milestone", "Submission"];

  /* ---------------- Icons (small subset) ---------------- */
  var IC = {
    edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    copy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    alert: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>'
  };

  /* ---------------- Toast ---------------- */
  function toast(msg, type) {
    var box = $("#adminToasts");
    if (!box) return;
    var el = document.createElement("div");
    el.className = "admin-toast" + (type ? " admin-toast--" + type : "");
    el.innerHTML = (type === "error" ? IC.alert : IC.check) + "<span>" + esc(msg) + "</span>";
    box.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(function () { el.remove(); }, 350);
    }, 3200);
  }

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

  function uid_local(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
  }

  function courseById(id) {
    return state.courses.find(function (c) { return c.id === id; }) || null;
  }

  function unitById(course, uid) {
    if (!course) return null;
    return (course.units || []).find(function (u) { return u.id === uid; }) || null;
  }

  function unitLabel(courseId, unitId) {
    var c = courseById(courseId);
    var u = unitById(c, unitId);
    if (!u) return "—";
    var idx = (c.units || []).indexOf(u);
    return "U" + (idx + 1) + " · " + u.title;
  }

  function statusPill(status) {
    return '<span class="admin-pill admin-pill--' + esc(status || "draft") + '">' + esc(status || "draft") + "</span>";
  }

  /* ---------------- Init (no login — portal opens directly) ---------------- */
  function initPortal() {
    loadAll();
  }

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

  /* ---------------- Data loading ---------------- */
  async function loadAll() {
    try {
      var [courses, resources, assignments, questions, announcements, dates, references, settings] = await Promise.all([
        API.adminCourses(),
        API.adminList("resources"),
        API.adminList("assignments"),
        API.adminList("questions"),
        API.adminList("announcements"),
        API.adminList("dates"),
        API.adminList("references"),
        API.adminSettings()
      ]);
      state.courses = courses.items || [];
      state.resources = resources.items || [];
      state.assignments = assignments.items || [];
      state.questions = questions.items || [];
      state.announcements = announcements.items || [];
      state.dates = dates.items || [];
      state.references = references.items || [];
      state.settings = settings.settings || {};
      if (!state.activeCourse && state.courses.length) state.activeCourse = state.courses[0].id;
      renderView(state.activeView);
      updateStatusPill();
    } catch (e) {
      if (e.status === 401) { showLogin(); return; }
      toast("Failed to load data: " + (e.message || e), "error");
    }
  }

  function updateStatusPill() {
    var pill = $("#adminStatusPill");
    var pub = state.courses.length ? state.courses.filter(function (c) { return c.status === "published"; }).length : 0;
    if (pill) pill.textContent = pub + "/" + state.courses.length + " published";
  }

  /* ---------------- View renderer ---------------- */
  var viewsEl = $("#adminViews");

  function renderView(name) {
    if (!viewsEl) return;
    var html = "";
    switch (name) {
      case "overview": html = renderOverview(); break;
      case "courses": html = renderCourses(); break;
      case "plan": html = renderPlan(); break;
      case "resources": html = renderResources(); break;
      case "assignments": html = renderAssignments(); break;
      case "questions": html = renderQuestions(); break;
      case "announcements": html = renderAnnouncements(); break;
      case "dates": html = renderDates(); break;
      case "references": html = renderReferences(); break;
      case "settings": html = renderSettings(); break;
    }
    viewsEl.innerHTML = '<div class="admin-view">' + html + "</div>";
    bindViewEvents(name);
  }

  /* ---------------- Overview ---------------- */
  function renderOverview() {
    var pubCourses = state.courses.filter(function (c) { return c.status === "published"; }).length;
    var drafts = state.courses.filter(function (c) { return c.status === "draft"; }).length;
    var recent = state.resources.slice().sort(function (a, b) { return String(b.modified || b.created || "").localeCompare(String(a.modified || a.created || "")); }).slice(0, 5);

    return '<div class="admin-stats">' +
      statCard(state.courses.length, "Total courses", pubCourses + " published · " + drafts + " draft") +
      statCard(state.resources.length, "Resources", state.resources.filter(function (r) { return r.status === "published"; }).length + " published") +
      statCard(state.assignments.length, "Assignments", "—") +
      statCard(state.announcements.length, "Announcements", state.announcements.filter(function (a) { return a.status === "published"; }).length + " published") +
      statCard(state.questions.length, "Questions", "—") +
      statCard(state.dates.length, "Academic dates", "—") +
    "</div>" +
    '<div class="admin-panel"><div class="admin-panel__head"><h3 class="admin-panel__title">Recently modified resources</h3></div>' +
      (recent.length ? recent.map(function (r) {
        return '<div class="admin-row"><div class="admin-row__main">' +
          '<div class="admin-row__title">' + esc(r.title) + "</div>" +
          '<div class="admin-row__sub">' + esc(unitLabel(r.courseId, r.unitId)) + " · " + esc(r.type) + " · " + esc(fmtDate(r.modified || r.created)) + "</div>" +
        "</div>" + statusPill(r.status) + "</div>";
      }).join("") : emptyState("No resources yet.")) +
    "</div>" +
    '<div class="admin-panel"><div class="admin-panel__head"><h3 class="admin-panel__title">Quick actions</h3></div>' +
      '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">Add a new course</div><div class="admin-row__sub">Create a course with its full structure (units, resources, assignments…).</div></div>' +
      '<div class="admin-row__actions"><button class="btn btn--primary btn--sm" data-action="add-course">' + IC.plus + "New course</button></div></div>" +
      '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">Manage resources</div><div class="admin-row__sub">Upload PPTs, PDFs, notes and link them to units.</div></div>' +
      '<div class="admin-row__actions"><button class="btn btn--ghost btn--sm" data-action="goto-resources">Open resources</button></div></div>' +
    "</div>";
  }

  function statCard(value, label, hint) {
    return '<div class="admin-stat"><div class="admin-stat__value">' + value + '</div>' +
      '<div class="admin-stat__label">' + esc(label) + "</div>" +
      (hint ? '<div class="admin-stat__hint">' + esc(hint) + "</div>" : "") + "</div>";
  }

  /* ---------------- Courses ---------------- */
  function renderCourses() {
    return '<div class="admin-view__head"><div><h2 class="admin-view__title">Courses</h2>' +
      '<p class="admin-view__lede">Add, edit, duplicate or archive courses. New courses auto-create their full structure.</p></div>' +
      '<button class="btn btn--primary" data-action="add-course">' + IC.plus + "Add course</button></div>" +
      '<div class="admin-course-grid">' +
      state.courses.map(function (c) {
        return '<article class="admin-course-card">' +
          '<div class="admin-course-card__head"><span class="admin-course-card__icon">' + esc(c.icon || "📘") + "</span>" + statusPill(c.status) + "</div>" +
          '<div class="admin-course-card__title">' + esc(c.name) + "</div>" +
          '<div class="admin-course-card__meta">' + esc(c.code) + " · " + esc(c.dept || "—") + " · " + esc(c.credits || "—") + "</div>" +
          (c.description ? '<p class="admin-course-card__desc">' + esc(c.description) + "</p>" : "") +
          '<div class="admin-course-card__actions">' +
            '<button class="admin-icon-btn" data-action="edit-course" data-id="' + esc(c.id) + '">' + IC.edit + "Edit</button>" +
            '<button class="admin-icon-btn" data-action="duplicate-course" data-id="' + esc(c.id) + '">' + IC.copy + "Duplicate</button>" +
            '<button class="admin-icon-btn" data-action="publish-course" data-id="' + esc(c.id) + '">' + IC.check + (c.status === "published" ? "Unpublish" : "Publish") + "</button>" +
            '<button class="admin-icon-btn admin-icon-btn--danger" data-action="delete-course" data-id="' + esc(c.id) + '">' + IC.trash + "Delete</button>" +
          "</div>" +
        "</article>";
      }).join("") || emptyState("No courses yet. Add your first course.") +
      "</div>";
  }

  /* ---------------- Course Plan ---------------- */
  function renderPlan() {
    var course = courseById(state.activeCourse);
    var select = '<div class="admin-filterbar"><label class="visually-hidden" for="planCourseSelect">Course</label>' +
      '<select id="planCourseSelect">' + state.courses.map(function (c) {
        return '<option value="' + esc(c.id) + '"' + (c.id === state.activeCourse ? " selected" : "") + ">" + esc(c.name) + "</option>";
      }).join("") + "</select></div>";

    if (!course) return select + emptyState("No course selected.");

    var units = (course.units || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    return '<div class="admin-view__head"><div><h2 class="admin-view__title">Course Plan</h2>' +
      '<p class="admin-view__lede">' + esc(course.name) + " — organize units and topics.</p></div>" +
      '<button class="btn btn--primary" data-action="add-unit">' + IC.plus + "Add unit</button></div>" + select +
      units.map(function (u, i) {
        var topics = (u.topics || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
        return '<div class="admin-panel">' +
          '<div class="admin-panel__head"><h3 class="admin-panel__title">Unit ' + (i + 1) + " — " + esc(u.title) + "</h3>" +
          '<div class="admin-row__actions">' + statusPill(u.status) +
            '<button class="admin-icon-btn" data-action="edit-unit" data-id="' + esc(u.id) + '">' + IC.edit + "</button>" +
            '<button class="admin-icon-btn admin-icon-btn--danger" data-action="delete-unit" data-id="' + esc(u.id) + '">' + IC.trash + "</button>" +
          "</div></div>" +
          (u.weeks ? '<div class="admin-row__sub">' + esc(u.weeks) + "</div>" : "") +
          '<div style="margin-top:0.75rem;">' +
            topics.map(function (t, j) {
              return '<div class="admin-row" style="padding:0.6rem 0.8rem;">' +
                '<div class="admin-row__main"><div class="admin-row__title" style="font-size:0.88rem;">' + (j + 1) + ". " + esc(t.title) + "</div></div>" +
                '<div class="admin-row__actions">' + statusPill(t.status) +
                  '<button class="admin-icon-btn" data-action="edit-topic" data-unit="' + esc(u.id) + '" data-id="' + esc(t.id) + '">' + IC.edit + "</button>" +
                  '<button class="admin-icon-btn admin-icon-btn--danger" data-action="delete-topic" data-unit="' + esc(u.id) + '" data-id="' + esc(t.id) + '">' + IC.trash + "</button>" +
                "</div></div>";
            }).join("") +
            '<button class="btn btn--ghost btn--sm" style="margin-top:0.6rem;" data-action="add-topic" data-unit="' + esc(u.id) + '">' + IC.plus + "Add topic</button>" +
          "</div></div>";
      }).join("") || emptyState("No units yet. Add the first unit.");
  }

  /* ---------------- Resources ---------------- */
  function renderResources() {
    var items = state.resources.filter(function (r) { return !state.activeCourse || r.courseId === state.activeCourse; });
    return '<div class="admin-view__head"><div><h2 class="admin-view__title">Resources</h2>' +
      '<p class="admin-view__lede">PPTs, PDFs, notes, documents, images and links. Publish to make them visible to students.</p></div>' +
      '<div class="admin-row__actions">' +
        '<button class="btn btn--ghost btn--sm" data-action="upload-pdf">' + IC.plus + "Upload PDF</button>" +
        '<button class="btn btn--primary btn--sm" data-action="add-resource">' + IC.plus + "Add resource</button>" +
      "</div></div>" +
      '<div class="admin-filterbar">' + courseFilterSelect("resCourseSelect", "resource") +
        '<input type="search" placeholder="Filter resources…" data-filter="resources" aria-label="Filter resources">' +
        '<select data-typefilter="resources" aria-label="Filter by type"><option value="">All types</option>' +
          TYPE_OPTIONS.map(function (t) { return '<option value="' + t + '">' + t.toUpperCase() + "</option>"; }).join("") +
        "</select></div>" +
      items.map(function (r) {
        return '<div class="admin-row" data-row="resources">' +
          '<div class="admin-row__main"><div class="admin-row__title">' + esc(r.title) + "</div>" +
          '<div class="admin-row__sub">' + esc(unitLabel(r.courseId, r.unitId)) + " · " + esc(r.type) + (r.size ? " · " + esc(r.size) : "") + " · " + esc(fmtDate(r.modified || r.created)) + "</div></div>" +
          '<div class="admin-row__actions">' + statusPill(r.status) +
            '<button class="admin-icon-btn admin-icon-btn--publish" data-action="set-status" data-collection="resources" data-id="' + esc(r.id) + '" data-status="' + (r.status === "published" ? "draft" : "published") + '">' + IC.check + (r.status === "published" ? "Unpublish" : "Publish") + "</button>" +
            '<button class="admin-icon-btn" data-action="edit-resource" data-id="' + esc(r.id) + '">' + IC.edit + "</button>" +
            '<button class="admin-icon-btn admin-icon-btn--danger" data-action="delete-item" data-collection="resources" data-id="' + esc(r.id) + '">' + IC.trash + "</button>" +
          "</div></div>";
      }).join("") || emptyState("No resources for this course yet.");
  }

  function courseFilterSelect(id, scope) {
    return '<label class="visually-hidden" for="' + id + '">Course</label>' +
      '<select id="' + id + '" data-coursefilter="' + scope + '" aria-label="Course">' +
      '<option value="">All courses</option>' +
      state.courses.map(function (c) {
        return '<option value="' + esc(c.id) + '"' + (c.id === state.activeCourse ? " selected" : "") + ">" + esc(c.name) + "</option>";
      }).join("") + "</select>";
  }

  /* ---------------- Assignments ---------------- */
  function renderAssignments() {
    var items = state.assignments.filter(function (a) { return !state.activeCourse || a.courseId === state.activeCourse; });
    return '<div class="admin-view__head"><div><h2 class="admin-view__title">Assignments</h2>' +
      '<p class="admin-view__lede">Set due dates, marks and instructions. Students see published assignments.</p></div>' +
      '<button class="btn btn--primary" data-action="add-assignment">' + IC.plus + "Add assignment</button></div>" +
      '<div class="admin-filterbar">' + courseFilterSelect("asgCourseSelect", "assignment") + "</div>" +
      items.map(function (a) {
        return '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">' + esc(a.title) + "</div>" +
          '<div class="admin-row__sub">' + esc(unitLabel(a.courseId, a.unitId)) + " · " + (a.marks ? esc(a.marks) + " marks · " : "") + "Due " + esc(fmtDate(a.due)) + "</div></div>" +
          '<div class="admin-row__actions">' + statusPill(a.status) +
            '<button class="admin-icon-btn admin-icon-btn--publish" data-action="set-status" data-collection="assignments" data-id="' + esc(a.id) + '" data-status="' + (a.status === "published" ? "draft" : "published") + '">' + IC.check + (a.status === "published" ? "Unpublish" : "Publish") + "</button>" +
            '<button class="admin-icon-btn" data-action="edit-assignment" data-id="' + esc(a.id) + '">' + IC.edit + "</button>" +
            '<button class="admin-icon-btn admin-icon-btn--danger" data-action="delete-item" data-collection="assignments" data-id="' + esc(a.id) + '">' + IC.trash + "</button>" +
          "</div></div>";
      }).join("") || emptyState("No assignments yet.");
  }

  /* ---------------- Questions ---------------- */
  function renderQuestions() {
    var items = state.questions.filter(function (q) { return !state.activeCourse || q.courseId === state.activeCourse; });
    return '<div class="admin-view__head"><div><h2 class="admin-view__title">Question Bank</h2>' +
      '<p class="admin-view__lede">Organize questions by unit and level.</p></div>' +
      '<button class="btn btn--primary" data-action="add-question">' + IC.plus + "Add question</button></div>" +
      '<div class="admin-filterbar">' + courseFilterSelect("qCourseSelect", "question") + "</div>" +
      items.map(function (q) {
        return '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title" style="font-weight:600;">' + esc(q.question) + "</div>" +
          '<div class="admin-row__sub">' + esc(unitLabel(q.courseId, q.unitId)) + " · " + esc(q.level) + (q.marks ? " · " + esc(q.marks) + " marks" : "") + (q.difficulty ? " · " + esc(q.difficulty) : "") + "</div></div>" +
          '<div class="admin-row__actions">' + statusPill(q.status) +
            '<button class="admin-icon-btn admin-icon-btn--publish" data-action="set-status" data-collection="questions" data-id="' + esc(q.id) + '" data-status="' + (q.status === "published" ? "draft" : "published") + '">' + IC.check + "</button>" +
            '<button class="admin-icon-btn" data-action="edit-question" data-id="' + esc(q.id) + '">' + IC.edit + "</button>" +
            '<button class="admin-icon-btn admin-icon-btn--danger" data-action="delete-item" data-collection="questions" data-id="' + esc(q.id) + '">' + IC.trash + "</button>" +
          "</div></div>";
      }).join("") || emptyState("No questions yet.");
  }

  /* ---------------- Announcements ---------------- */
  function renderAnnouncements() {
    var items = state.announcements.filter(function (a) { return !state.activeCourse || a.courseId === state.activeCourse; });
    return '<div class="admin-view__head"><div><h2 class="admin-view__title">Announcements</h2>' +
      '<p class="admin-view__lede">Create notices, mark important ones, publish when ready.</p></div>' +
      '<button class="btn btn--primary" data-action="add-announcement">' + IC.plus + "Add announcement</button></div>" +
      '<div class="admin-filterbar">' + courseFilterSelect("annCourseSelect", "announcement") + "</div>" +
      items.map(function (a) {
        return '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">' + (a.pinned ? "📌 " : "") + esc(a.title) + "</div>" +
          '<div class="admin-row__sub">' + esc(a.tag || "Notice") + " · " + esc(fmtDate(a.date)) + (a.pinned ? " · Pinned" : "") + "</div></div>" +
          '<div class="admin-row__actions">' + statusPill(a.status) +
            '<button class="admin-icon-btn admin-icon-btn--publish" data-action="set-status" data-collection="announcements" data-id="' + esc(a.id) + '" data-status="' + (a.status === "published" ? "draft" : "published") + '">' + IC.check + (a.status === "published" ? "Unpublish" : "Publish") + "</button>" +
            '<button class="admin-icon-btn" data-action="edit-announcement" data-id="' + esc(a.id) + '">' + IC.edit + "</button>" +
            '<button class="admin-icon-btn admin-icon-btn--danger" data-action="delete-item" data-collection="announcements" data-id="' + esc(a.id) + '">' + IC.trash + "</button>" +
          "</div></div>";
      }).join("") || emptyState("No announcements yet.");
  }

  /* ---------------- Dates ---------------- */
  function renderDates() {
    var items = state.dates.filter(function (d) { return !state.activeCourse || d.courseId === state.activeCourse; });
    return '<div class="admin-view__head"><div><h2 class="admin-view__title">Academic Calendar</h2>' +
      '<p class="admin-view__lede">Deadlines, exams, milestones and submissions.</p></div>' +
      '<button class="btn btn--primary" data-action="add-date">' + IC.plus + "Add date</button></div>" +
      '<div class="admin-filterbar">' + courseFilterSelect("dateCourseSelect", "date") + "</div>" +
      items.map(function (d) {
        return '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">' + esc(d.title) + "</div>" +
          '<div class="admin-row__sub">' + esc(fmtDate(d.date)) + " · " + esc(d.type) + "</div></div>" +
          '<div class="admin-row__actions">' + statusPill(d.status) +
            '<button class="admin-icon-btn admin-icon-btn--publish" data-action="set-status" data-collection="dates" data-id="' + esc(d.id) + '" data-status="' + (d.status === "published" ? "draft" : "published") + '">' + IC.check + "</button>" +
            '<button class="admin-icon-btn" data-action="edit-date" data-id="' + esc(d.id) + '">' + IC.edit + "</button>" +
            '<button class="admin-icon-btn admin-icon-btn--danger" data-action="delete-item" data-collection="dates" data-id="' + esc(d.id) + '">' + IC.trash + "</button>" +
          "</div></div>";
      }).join("") || emptyState("No dates yet.");
  }

  /* ---------------- References ---------------- */
  function renderReferences() {
    var items = state.references.filter(function (r) { return !state.activeCourse || r.courseId === state.activeCourse; });
    return '<div class="admin-view__head"><div><h2 class="admin-view__title">References</h2>' +
      '<p class="admin-view__lede">Textbooks, papers, websites and docs.</p></div>' +
      '<button class="btn btn--primary" data-action="add-reference">' + IC.plus + "Add reference</button></div>" +
      '<div class="admin-filterbar">' + courseFilterSelect("refCourseSelect", "reference") + "</div>" +
      items.map(function (r) {
        return '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">' + esc(r.title) + "</div>" +
          '<div class="admin-row__sub">' + esc(r.kind) + (r.url && r.url !== "#" ? " · " + esc(r.url) : "") + "</div></div>" +
          '<div class="admin-row__actions">' + statusPill(r.status) +
            '<button class="admin-icon-btn admin-icon-btn--publish" data-action="set-status" data-collection="references" data-id="' + esc(r.id) + '" data-status="' + (r.status === "published" ? "draft" : "published") + '">' + IC.check + "</button>" +
            '<button class="admin-icon-btn" data-action="edit-reference" data-id="' + esc(r.id) + '">' + IC.edit + "</button>" +
            '<button class="admin-icon-btn admin-icon-btn--danger" data-action="delete-item" data-collection="references" data-id="' + esc(r.id) + '">' + IC.trash + "</button>" +
          "</div></div>";
      }).join("") || emptyState("No references yet.");
  }

  /* ---------------- Settings ---------------- */
  function renderSettings() {
    var s = state.settings || {};
    return '<div class="admin-view__head"><div><h2 class="admin-view__title">Settings</h2>' +
      '<p class="admin-view__lede">Website content, passcode, backup and restore.</p></div></div>' +
      '<div class="admin-panel"><div class="admin-panel__head"><h3 class="admin-panel__title">Website content</h3></div>' +
      '<form class="admin-form" data-form="settings">' +
        formRow("text", "siteName", "Site name", s.siteName) +
        formRow("text", "siteCode", "Site code", s.siteCode) +
        formRow("text", "heroBadge", "Hero badge", s.heroBadge) +
        formRow("text", "heroTitle", "Hero title", s.heroTitle) +
        formRow("text", "heroSub", "Hero subtitle", s.heroSub) +
        formRow("textarea", "heroLede", "Hero lede", s.heroLede) +
        formRow("textarea", "footerAbout", "Footer about", s.footerAbout) +
        formRow("text", "footerCopyright", "Footer copyright", s.footerCopyright) +
        '<div class="admin-form__actions"><button class="btn btn--primary btn--sm" type="submit">Save settings</button></div>' +
      "</form></div>" +
      '<div class="admin-panel"><div class="admin-panel__head"><h3 class="admin-panel__title">Backup &amp; restore</h3></div>' +
      '<div class="admin-form">' +
        '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">Export all data</div><div class="admin-row__sub">Download a JSON backup of every course and resource.</div></div>' +
        '<div class="admin-row__actions"><button class="btn btn--ghost btn--sm" data-action="export-data">Export JSON</button></div></div>' +
        '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">Import data</div><div class="admin-row__sub">Restore from a JSON backup (replaces current data).</div></div>' +
        '<div class="admin-row__actions"><button class="btn btn--ghost btn--sm" data-action="import-data">Import JSON</button><input type="file" id="importFile" accept="application/json" hidden></div></div>' +
        '<div class="admin-row"><div class="admin-row__main"><div class="admin-row__title">Reset to seed</div><div class="admin-row__sub">Restore the original AD203 demo content.</div></div>' +
        '<div class="admin-row__actions"><button class="btn btn--ghost btn--sm admin-icon-btn--danger" data-action="reset-data">Reset</button></div></div>' +
      "</div></div>";
  }

  function formRow(type, key, label, val) {
    var cls = type === "textarea" ? "admin-form__row admin-form__row--full" : "admin-form__row";
    return '<div class="' + cls + '"><label for="set-' + key + '">' + esc(label) + "</label>" +
      (type === "textarea"
        ? '<textarea id="set-' + key + '" name="' + key + '">' + esc(val || "") + "</textarea>"
        : '<input type="' + type + '" id="set-' + key + '" name="' + key + '" value="' + esc(val || "") + '">') +
      "</div>";
  }

  function emptyState(msg) {
    return '<div class="admin-empty">' + esc(msg) + "</div>";
  }

  /* ---------------- Event binding per view ---------------- */
  function bindViewEvents(name) {
    var root = viewsEl;

    // filter inputs
    root.querySelectorAll("[data-filter]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        var q = inp.value.toLowerCase();
        root.querySelectorAll("[data-row]").forEach(function (row) {
          row.style.display = row.textContent.toLowerCase().indexOf(q) === -1 ? "none" : "";
        });
      });
    });
    root.querySelectorAll("[data-typefilter]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var t = sel.value;
        root.querySelectorAll("[data-row]").forEach(function (row) {
          row.style.display = t && row.textContent.toLowerCase().indexOf(t) === -1 ? "none" : "";
        });
      });
    });
    root.querySelectorAll("[data-coursefilter]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        state.activeCourse = sel.value || null;
        renderView(state.activeView);
      });
    });
    var planSelect = root.querySelector("#planCourseSelect");
    if (planSelect) planSelect.addEventListener("change", function () {
      state.activeCourse = planSelect.value;
      renderView("plan");
    });

    // generic actions
    root.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-action");
        var id = btn.getAttribute("data-id");
        var unit = btn.getAttribute("data-unit");
        var collection = btn.getAttribute("data-collection");
        var status = btn.getAttribute("data-status");
        handleAction(action, id, unit, collection, status, btn);
      });
    });

    // forms
    root.querySelectorAll("form[data-form]").forEach(function (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        if (form.getAttribute("data-form") === "settings") await saveSettings(form);
      });
    });

    // import file
    var importFile = root.querySelector("#importFile");
    if (importFile) importFile.addEventListener("change", async function () {
      var file = importFile.files[0];
      if (!file) return;
      try {
        var text = await file.text();
        await API.adminImport(JSON.parse(text));
        toast("Data imported successfully.", "success");
        await loadAll();
      } catch (ex) {
        toast("Import failed: " + (ex.message || ex), "error");
      }
      importFile.value = "";
    });
  }

  /* ---------------- Actions ---------------- */
  async function handleAction(action, id, unit, collection, status, btn) {
    switch (action) {
      case "add-course": openCourseForm(null); break;
      case "edit-course": openCourseForm(id); break;
      case "duplicate-course": await duplicateCourse(id); break;
      case "publish-course": await toggleCoursePublish(id); break;
      case "delete-course": await confirmDeleteCourse(id); break;
      case "add-unit": openUnitForm(null); break;
      case "edit-unit": openUnitForm(id); break;
      case "delete-unit": await confirmDeleteUnit(id); break;
      case "add-topic": openTopicForm(btn.getAttribute("data-unit"), null); break;
      case "edit-topic": openTopicForm(btn.getAttribute("data-unit"), id); break;
      case "delete-topic": await confirmDeleteTopic(unit, id); break;
      case "add-resource": openResourceForm(null); break;
      case "edit-resource": openResourceForm(id); break;
      case "add-assignment": openAssignmentForm(null); break;
      case "edit-assignment": openAssignmentForm(id); break;
      case "add-question": openQuestionForm(null); break;
      case "edit-question": openQuestionForm(id); break;
      case "add-announcement": openAnnouncementForm(null); break;
      case "edit-announcement": openAnnouncementForm(id); break;
      case "add-date": openDateForm(null); break;
      case "edit-date": openDateForm(id); break;
      case "add-reference": openReferenceForm(null); break;
      case "edit-reference": openReferenceForm(id); break;
      case "delete-item": await confirmDeleteItem(collection, id); break;
      case "set-status": await setStatus(collection, id, status); break;
      case "upload-pdf": openPdfUploadWizard(); break;
      case "goto-resources": setView("resources"); break;
      case "export-data": await exportData(); break;
      case "import-data": { var f = document.getElementById("importFile"); if (f) f.click(); break; }
      case "reset-data": await resetData(); break;
    }
  }

  async function setStatus(collection, id, status) {
    try {
      await API.adminUpdate(collection, id, { status: status });
      toast("Status updated to " + status + ".", "success");
      await loadAll();
    } catch (e) { toast("Update failed: " + (e.message || e), "error"); }
  }

  async function toggleCoursePublish(id) {
    var c = courseById(id);
    if (!c) return;
    try {
      await API.adminUpdateCourse(id, { status: c.status === "published" ? "draft" : "published" });
      toast(c.status === "published" ? "Course unpublished." : "Course published.", "success");
      await loadAll();
    } catch (e) { toast("Update failed: " + (e.message || e), "error"); }
  }

  async function duplicateCourse(id) {
    try {
      await API.adminDuplicateCourse(id);
      toast("Course duplicated as draft.", "success");
      await loadAll();
    } catch (e) { toast("Duplicate failed: " + (e.message || e), "error"); }
  }

  async function confirmDeleteCourse(id) {
    if (!confirm("Delete this course and ALL its content? This cannot be undone.")) return;
    try {
      await API.adminDeleteCourse(id);
      toast("Course deleted.", "success");
      await loadAll();
    } catch (e) { toast("Delete failed: " + (e.message || e), "error"); }
  }

  async function confirmDeleteUnit(id) {
    if (!confirm("Delete this unit and its topics?")) return;
    try {
      await API.adminDeleteUnit(state.activeCourse, id);
      toast("Unit deleted.", "success");
      await loadAll();
    } catch (e) { toast("Delete failed: " + (e.message || e), "error"); }
  }

  async function confirmDeleteTopic(uid, tid) {
    if (!confirm("Delete this topic?")) return;
    try {
      await API.adminDeleteTopic(state.activeCourse, uid, tid);
      toast("Topic deleted.", "success");
      await loadAll();
    } catch (e) { toast("Delete failed: " + (e.message || e), "error"); }
  }

  async function confirmDeleteItem(collection, id) {
    if (!confirm("Delete this item?")) return;
    try {
      await API.adminDelete(collection, id);
      toast("Item deleted.", "success");
      await loadAll();
    } catch (e) { toast("Delete failed: " + (e.message || e), "error"); }
  }

  async function exportData() {
    try {
      var data = await API.adminExport();
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ad203-portal-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      a.click();
      URL.revokeObjectURL(a.href);
      toast("Backup downloaded.", "success");
    } catch (e) { toast("Export failed: " + (e.message || e), "error"); }
  }

  async function resetData() {
    if (!confirm("Reset all data to the original seed? Your changes will be lost.")) return;
    try {
      await API.adminReset();
      toast("Data reset to seed.", "success");
      await loadAll();
    } catch (e) { toast("Reset failed: " + (e.message || e), "error"); }
  }

  async function saveSettings(form) {
    var fd = new FormData(form);
    var body = {};
    fd.forEach(function (v, k) { body[k] = v; });
    try {
      await API.adminSaveSettings(body);
      toast("Settings saved.", "success");
      await loadAll();
    } catch (e) { toast("Save failed: " + (e.message || e), "error"); }
  }

  /* ---------------- Forms (modals) ---------------- */
  var modal = $("#adminModal");
  var modalBody = $("#adminModalBody");
  var modalTitle = $("#adminModalTitle");
  var modalSub = $("#adminModalSub");

  function openModal(title, sub, html, onOpen) {
    modalTitle.textContent = title;
    modalSub.textContent = sub || "";
    modalBody.innerHTML = html;
    modal.hidden = false;
    void modal.offsetWidth;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var first = modalBody.querySelector("input, select, textarea");
    if (first) first.focus();
    if (onOpen) onOpen();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      modal.hidden = true;
      modal.removeEventListener("transitionend", finish);
      clearTimeout(t);
    };
    var t = setTimeout(finish, 350);
    modal.addEventListener("transitionend", finish);
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-admin-close]")) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  function courseOptions(selected) {
    return '<select name="courseId" required><option value="">Select course…</option>' +
      state.courses.map(function (c) {
        return '<option value="' + esc(c.id) + '"' + (String(selected) === String(c.id) ? " selected" : "") + ">" + esc(c.name) + "</option>";
      }).join("") + "</select>";
  }

  function unitOptions(courseId, selected) {
    var c = courseById(courseId);
    return '<select name="unitId"><option value="">— none —</option>' +
      (c ? (c.units || []).map(function (u) {
        return '<option value="' + esc(u.id) + '"' + (String(selected) === String(u.id) ? " selected" : "") + ">" + esc(u.title) + "</option>";
      }).join("") : "") + "</select>";
  }

  /* Course form */
  function openCourseForm(id) {
    var c = id ? courseById(id) : null;
    openModal(c ? "Edit course" : "Add course", "All changes are saved to the server data store.",
      '<form class="admin-form" data-form="course" data-id="' + (id || "") + '">' +
        '<div class="admin-form__grid">' +
          formRow("text", "name", "Course name", c ? c.name : "") +
          formRow("text", "code", "Course code", c ? c.code : "") +
          formRow("text", "dept", "Department", c ? c.dept : "") +
          formRow("text", "credits", "Credits (e.g. 3-0-3)", c ? c.credits : "") +
          formRow("text", "professor", "Professor", c ? c.professor : "") +
          formRow("text", "icon", "Icon (emoji)", c ? c.icon : "📘") +
          formRow("text", "academicYear", "Academic year", c ? c.academicYear : "") +
          formRow("text", "semester", "Semester", c ? c.semester : "") +
        "</div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Description</label><textarea name="description">' + esc(c ? c.description : "") + "</textarea></div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Prerequisites</label><textarea name="prerequisites">' + esc(c ? c.prerequisites : "") + "</textarea></div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Course objectives (one per line)</label><textarea name="objectives">' + esc(c && c.objectives ? c.objectives.join("\n") : "") + "</textarea></div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Learning outcomes (one per line)</label><textarea name="outcomes">' + esc(c && c.outcomes ? c.outcomes.join("\n") : "") + "</textarea></div>" +
        '<div class="admin-form__actions"><button type="button" class="btn btn--ghost btn--sm" data-admin-close>Cancel</button>' +
        '<button type="submit" class="btn btn--primary btn--sm">' + (c ? "Save" : "Create course") + "</button></div></form>");
  }

  document.addEventListener("submit", async function (e) {
    var form = e.target.closest("#adminModalBody form[data-form]");
    if (!form) return;
    e.preventDefault();
    var kind = form.getAttribute("data-form");
    var id = form.getAttribute("data-id");
    var fd = new FormData(form);
    var body = {};
    fd.forEach(function (v, k) { body[k] = v; });

    try {
      if (kind === "course") {
        if (body.objectives) body.objectives = body.objectives.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
        if (body.outcomes) body.outcomes = body.outcomes.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
        if (id) await API.adminUpdateCourse(id, body);
        else await API.adminCreateCourse(body);
        toast(id ? "Course updated." : "Course created.", "success");
      } else if (kind === "unit") {
        var cid = form.getAttribute("data-cid");
        if (id) await API.adminUpdateUnit(cid, id, body);
        else await API.adminAddUnit(cid, body);
        toast(id ? "Unit updated." : "Unit added.", "success");
      } else if (kind === "topic") {
        var cid2 = form.getAttribute("data-cid");
        var uid2 = form.getAttribute("data-uid");
        if (id) await API.adminUpdateTopic(cid2, uid2, id, body);
        else await API.adminAddTopic(cid2, uid2, body);
        toast(id ? "Topic updated." : "Topic added.", "success");
      } else if (kind === "resource") {
        if (id) await API.adminUpdate("resources", id, body);
        else await API.adminCreate("resources", body);
        toast(id ? "Resource updated." : "Resource added.", "success");
      } else if (kind === "assignment") {
        if (id) await API.adminUpdate("assignments", id, body);
        else await API.adminCreate("assignments", body);
        toast(id ? "Assignment updated." : "Assignment added.", "success");
      } else if (kind === "question") {
        if (id) await API.adminUpdate("questions", id, body);
        else await API.adminCreate("questions", body);
        toast(id ? "Question updated." : "Question added.", "success");
      } else if (kind === "announcement") {
        body.pinned = body.pinned === "on";
        if (id) await API.adminUpdate("announcements", id, body);
        else await API.adminCreate("announcements", body);
        toast(id ? "Announcement updated." : "Announcement added.", "success");
      } else if (kind === "date") {
        if (id) await API.adminUpdate("dates", id, body);
        else await API.adminCreate("dates", body);
        toast(id ? "Date updated." : "Date added.", "success");
      } else if (kind === "reference") {
        if (id) await API.adminUpdate("references", id, body);
        else await API.adminCreate("references", body);
        toast(id ? "Reference updated." : "Reference added.", "success");
      } else if (kind === "pdf-upload") {
        var fileInput = form.querySelector("[data-pdf-input]");
        var file = fileInput && fileInput.files[0];
        if (!file) { toast("Please choose a PDF file.", "error"); return; }
        if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
          toast("Invalid file type. Please select a PDF.", "error");
          return;
        }
        if (file.size > 50 * 1024 * 1024) {
          toast("File too large. Maximum size is 50 MB.", "error");
          return;
        }
        // 1) upload the PDF to server storage
        var fd2 = new FormData();
        fd2.append("courseId", body.courseId || "general");
        if (body.unitId) fd2.append("unitId", body.unitId);
        fd2.append("file", file);
        var up = await API.upload("/api/admin/upload", fd2);
        // 2) create the resource metadata entry (type = pdf)
        await API.adminCreate("resources", {
          courseId: body.courseId,
          unitId: body.unitId || null,
          topicId: null,
          title: body.title,
          desc: body.desc || "",
          type: "pdf",
          file: up.file,
          url: null,
          size: formatSize(up.size),
          tags: [],
          status: body.status || "published"
        });
        toast("PDF uploaded successfully.", "success");
      }
      closeModal();
      await loadAll();
    } catch (ex) {
      var msg = (ex.data && ex.data.error) || (ex.message || ex);
      if (msg === "Invalid file type. Please select a PDF.") toast("Invalid file type. Please select a PDF.", "error");
      else if (msg === "File too large. Maximum size is 50 MB.") toast("File too large. Maximum size is 50 MB.", "error");
      else toast("Upload failed. Please try again. (" + msg + ")", "error");
    }
  });

  function openUnitForm(id) {
    var c = courseById(state.activeCourse);
    if (!c) { toast("Select a course first.", "error"); return; }
    var u = id ? unitById(c, id) : null;
    openModal(u ? "Edit unit" : "Add unit", "Course: " + c.name,
      '<form class="admin-form" data-form="unit" data-cid="' + esc(c.id) + '" data-id="' + (id || "") + '">' +
        formRow("text", "title", "Unit title", u ? u.title : "") +
        formRow("text", "weeks", "Weeks (e.g. Weeks 1–2)", u ? u.weeks : "") +
        formRow("select", "status", "Status", u ? u.status : "draft", ["draft", "published", "archived"]) +
        '<div class="admin-form__actions"><button type="button" class="btn btn--ghost btn--sm" data-admin-close>Cancel</button>' +
        '<button type="submit" class="btn btn--primary btn--sm">' + (u ? "Save" : "Add unit") + "</button></div></form>");
  }

  function openTopicForm(uid, id) {
    var c = courseById(state.activeCourse);
    var u = unitById(c, uid);
    if (!c || !u) { toast("Select a course/unit first.", "error"); return; }
    var t = id ? (u.topics || []).find(function (x) { return x.id === id; }) : null;
    openModal(t ? "Edit topic" : "Add topic", "Unit: " + u.title,
      '<form class="admin-form" data-form="topic" data-cid="' + esc(c.id) + '" data-uid="' + esc(uid) + '" data-id="' + (id || "") + '">' +
        formRow("text", "title", "Topic title", t ? t.title : "") +
        formRow("select", "status", "Status", t ? t.status : "draft", ["draft", "published", "archived"]) +
        '<div class="admin-form__actions"><button type="button" class="btn btn--ghost btn--sm" data-admin-close>Cancel</button>' +
        '<button type="submit" class="btn btn--primary btn--sm">' + (t ? "Save" : "Add topic") + "</button></div></form>");
  }

  function openResourceForm(id) {
    var r = id ? state.resources.find(function (x) { return x.id === id; }) : null;
    openModal(r ? "Edit resource" : "Add resource", "Attach a file or add a link.",
      '<form class="admin-form" data-form="resource" data-id="' + (id || "") + '">' +
        '<div class="admin-form__grid">' +
          '<div class="admin-form__row"><label>Course</label>' + courseOptions(r ? r.courseId : state.activeCourse) + "</div>" +
          '<div class="admin-form__row"><label>Unit</label>' + unitOptions(r ? r.courseId : state.activeCourse, r ? r.unitId : "") + "</div>" +
          '<div class="admin-form__row"><label>Type</label>' + selOptions("type", TYPE_OPTIONS, r ? r.type : "ppt") + "</div>" +
          '<div class="admin-form__row"><label>Status</label>' + selOptions("status", STATUS_OPTIONS, r ? r.status : "draft") + "</div>" +
        "</div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Title</label><input name="title" value="' + esc(r ? r.title : "") + '" required></div>' +
        '<div class="admin-form__row admin-form__row--full"><label>Description</label><textarea name="desc">' + esc(r ? r.desc : "") + "</textarea></div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Tags (comma separated)</label><input name="tags" value="' + esc(r && r.tags ? r.tags.join(", ") : "") + '"></div>' +
        '<div class="admin-form__row admin-form__row--full"><label>File (upload)</label>' +
          '<div class="admin-dropzone" data-dropzone><input type="file" name="file" data-fileinput>' +
          "<div>" + (r && r.file ? '<strong>Current:</strong> ' + esc(r.file) : "Click to upload PPT / PDF / DOC / image") + "</div></div></div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Or external link</label><input name="url" value="' + esc(r ? r.url : "") + '" placeholder="https://…"></div>' +
        '<input type="hidden" name="file" value="' + esc(r ? r.file : "") + '">' +
        '<input type="hidden" name="size" value="' + esc(r ? r.size : "") + '">' +
        '<div class="admin-form__actions"><button type="button" class="btn btn--ghost btn--sm" data-admin-close>Cancel</button>' +
        '<button type="submit" class="btn btn--primary btn--sm">' + (r ? "Save" : "Add resource") + "</button></div></form>",
      function () {
        var dz = modalBody.querySelector("[data-dropzone]");
        var fileInput = modalBody.querySelector("[data-fileinput]");
        var hiddenFile = modalBody.querySelector('input[name="file"][type="hidden"]');
        var hiddenSize = modalBody.querySelector('input[name="size"][type="hidden"]');
        if (!dz || !fileInput) return;
        dz.addEventListener("click", function () { fileInput.click(); });
        fileInput.addEventListener("change", async function () {
          if (!fileInput.files.length) return;
          var file = fileInput.files[0];
          dz.querySelector("div").innerHTML = "<strong>Uploading…</strong> " + esc(file.name);
          var formData = new FormData();
          var cid = modalBody.querySelector('select[name="courseId"]').value;
          formData.append("courseId", cid || "general");
          formData.append("file", file);
          try {
            var res = await API.upload("/api/admin/upload", formData);
            if (hiddenFile) hiddenFile.value = res.file;
            if (hiddenSize) hiddenSize.value = formatSize(res.size);
            dz.querySelector("div").innerHTML = '<strong>Uploaded:</strong> ' + esc(res.name);
            toast("File uploaded.", "success");
          } catch (ex) {
            dz.querySelector("div").innerHTML = "Upload failed: " + esc(ex.message || ex);
            toast("Upload failed: " + (ex.message || ex), "error");
          }
        });
      });
  }

  /* ---------------- PDF upload wizard ---------------- */
  function openPdfUploadWizard() {
    var course = courseById(state.activeCourse);
    openModal("Upload PDF", "Select a PDF, choose its course/unit, then upload & publish.",
      '<form class="admin-form" data-form="pdf-upload">' +
        '<div class="admin-form__grid">' +
          '<div class="admin-form__row"><label for="pdfCourse">Course</label>' +
            '<select id="pdfCourse" name="courseId" required>' +
              state.courses.map(function (c) {
                return '<option value="' + esc(c.id) + '"' + (c.id === state.activeCourse ? " selected" : "") + ">" + esc(c.name) + "</option>";
              }).join("") +
            "</select></div>" +
          '<div class="admin-form__row"><label for="pdfUnit">Unit</label><select id="pdfUnit" name="unitId"><option value="">— none —</option></select></div>' +
          '<div class="admin-form__row admin-form__row--full"><label for="pdfTitle">Resource title</label>' +
            '<input id="pdfTitle" name="title" required placeholder="e.g. Unit I — Lecture Notes"></div>' +
          '<div class="admin-form__row admin-form__row--full"><label for="pdfDesc">Description (optional)</label>' +
            '<textarea id="pdfDesc" name="desc" placeholder="Short description of the PDF…"></textarea></div>' +
          '<div class="admin-form__row admin-form__row--full"><label>PDF file</label>' +
            '<div class="admin-dropzone" data-pdf-dropzone><input type="file" name="file" accept="application/pdf,.pdf" data-pdf-input required>' +
            '<div><strong>Choose a PDF</strong> or drop it here (max 50 MB)</div></div></div>' +
          '<div class="admin-form__row"><label>Status</label><select name="status">' +
            '<option value="published">Published (visible to students)</option>' +
            '<option value="draft">Draft (hidden from students)</option>' +
          "</select></div>" +
        "</div>" +
        '<div class="admin-form__actions">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-admin-close>Cancel</button>' +
          '<button type="submit" class="btn btn--primary btn--sm" data-pdf-submit>' + IC.plus + "Upload &amp; publish</button>" +
        "</div>" +
      "</form>",
      function () {
        var courseSel = modalBody.querySelector("#pdfCourse");
        var unitSel = modalBody.querySelector("#pdfUnit");
        var dropzone = modalBody.querySelector("[data-pdf-dropzone]");
        var fileInput = modalBody.querySelector("[data-pdf-input]");

        function fillUnits() {
          var c = courseById(courseSel.value);
          unitSel.innerHTML = '<option value="">— none —</option>' + (c ? (c.units || []).map(function (u) {
            return '<option value="' + esc(u.id) + '">' + esc(u.title) + "</option>";
          }).join("") : "");
        }
        courseSel.addEventListener("change", fillUnits);
        fillUnits();

        if (dropzone && fileInput) {
          dropzone.addEventListener("click", function () { fileInput.click(); });
          fileInput.addEventListener("change", function () {
            var f = fileInput.files[0];
            if (!f) return;
            if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") {
              toast("Invalid file type. Please select a PDF.", "error");
              fileInput.value = "";
              return;
            }
            if (f.size > 50 * 1024 * 1024) {
              toast("File too large. Maximum size is 50 MB.", "error");
              fileInput.value = "";
              return;
            }
            dropzone.querySelector("div").innerHTML = "<strong>" + esc(f.name) + "</strong> (" + esc(formatSize(f.size)) + ")";
          });
        }
      });
  }

  function formatSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  function openAssignmentForm(id) {
    var a = id ? state.assignments.find(function (x) { return x.id === id; }) : null;
    openModal(a ? "Edit assignment" : "Add assignment", "Information & resource management.",
      '<form class="admin-form" data-form="assignment" data-id="' + (id || "") + '">' +
        '<div class="admin-form__grid">' +
          '<div class="admin-form__row"><label>Course</label>' + courseOptions(a ? a.courseId : state.activeCourse) + "</div>" +
          '<div class="admin-form__row"><label>Unit</label>' + unitOptions(a ? a.courseId : state.activeCourse, a ? a.unitId : "") + "</div>" +
          '<div class="admin-form__row"><label>Assigned date</label><input type="date" name="assigned" value="' + esc(a ? a.assigned : "") + '"></div>' +
          '<div class="admin-form__row"><label>Due date</label><input type="date" name="due" value="' + esc(a ? a.due : "") + '"></div>' +
          '<div class="admin-form__row"><label>Marks</label><input name="marks" value="' + esc(a ? a.marks : "") + '"></div>' +
          '<div class="admin-form__row"><label>Status</label>' + selOptions("status", STATUS_OPTIONS, a ? a.status : "draft") + "</div>" +
        "</div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Title</label><input name="title" value="' + esc(a ? a.title : "") + '" required></div>' +
        '<div class="admin-form__row admin-form__row--full"><label>Instructions</label><textarea name="desc">' + esc(a ? a.desc : "") + "</textarea></div>" +
        '<div class="admin-form__row admin-form__row--full"><label>File path (optional)</label><input name="file" value="' + esc(a ? a.file : "") + '" placeholder="/uploads/… or https://…"></div>' +
        '<div class="admin-form__actions"><button type="button" class="btn btn--ghost btn--sm" data-admin-close>Cancel</button>' +
        '<button type="submit" class="btn btn--primary btn--sm">' + (a ? "Save" : "Add assignment") + "</button></div></form>");
  }

  function openQuestionForm(id) {
    var q = id ? state.questions.find(function (x) { return x.id === id; }) : null;
    openModal(q ? "Edit question" : "Add question", "Organize by unit and level.",
      '<form class="admin-form" data-form="question" data-id="' + (id || "") + '">' +
        '<div class="admin-form__grid">' +
          '<div class="admin-form__row"><label>Course</label>' + courseOptions(q ? q.courseId : state.activeCourse) + "</div>" +
          '<div class="admin-form__row"><label>Unit</label>' + unitOptions(q ? q.courseId : state.activeCourse, q ? q.unitId : "") + "</div>" +
          '<div class="admin-form__row"><label>Level</label>' + selOptions("level", LEVEL_OPTIONS, q ? q.level : "short") + "</div>" +
          '<div class="admin-form__row"><label>Difficulty</label>' + selOptions("difficulty", DIFF_OPTIONS, q ? q.difficulty : "medium") + "</div>" +
          '<div class="admin-form__row"><label>Marks</label><input name="marks" value="' + esc(q ? q.marks : "") + '"></div>' +
          '<div class="admin-form__row"><label>Status</label>' + selOptions("status", STATUS_OPTIONS, q ? q.status : "draft") + "</div>" +
        "</div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Question</label><textarea name="question" required>' + esc(q ? q.question : "") + "</textarea></div>" +
        '<div class="admin-form__actions"><button type="button" class="btn btn--ghost btn--sm" data-admin-close>Cancel</button>' +
        '<button type="submit" class="btn btn--primary btn--sm">' + (q ? "Save" : "Add question") + "</button></div></form>");
  }

  function openAnnouncementForm(id) {
    var a = id ? state.announcements.find(function (x) { return x.id === id; }) : null;
    openModal(a ? "Edit announcement" : "Add announcement", "Publish to make it visible to students.",
      '<form class="admin-form" data-form="announcement" data-id="' + (id || "") + '">' +
        '<div class="admin-form__grid">' +
          '<div class="admin-form__row"><label>Course</label>' + courseOptions(a ? a.courseId : state.activeCourse) + "</div>" +
          '<div class="admin-form__row"><label>Tag</label>' + selOptions("tag", TAG_OPTIONS, a ? a.tag : "Notice") + "</div>" +
          '<div class="admin-form__row"><label>Date</label><input type="date" name="date" value="' + esc(a ? a.date : "") + '"></div>' +
          '<div class="admin-form__row"><label>Status</label>' + selOptions("status", STATUS_OPTIONS, a ? a.status : "draft") + "</div>" +
          '<div class="admin-form__row admin-form__row--full" style="display:flex;align-items:center;gap:0.6rem;"><label style="margin:0;"><input type="checkbox" name="pinned"' + (a && a.pinned ? " checked" : "") + "> Pinned (important)</label></div>" +
        "</div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Title</label><input name="title" value="' + esc(a ? a.title : "") + '" required></div>' +
        '<div class="admin-form__row admin-form__row--full"><label>Body</label><textarea name="body">' + esc(a ? a.body : "") + "</textarea></div>" +
        '<div class="admin-form__actions"><button type="button" class="btn btn--ghost btn--sm" data-admin-close>Cancel</button>' +
        '<button type="submit" class="btn btn--primary btn--sm">' + (a ? "Save" : "Add announcement") + "</button></div></form>");
  }

  function openDateForm(id) {
    var d = id ? state.dates.find(function (x) { return x.id === id; }) : null;
    openModal(d ? "Edit date" : "Add date", "Academic calendar event.",
      '<form class="admin-form" data-form="date" data-id="' + (id || "") + '">' +
        '<div class="admin-form__grid">' +
          '<div class="admin-form__row"><label>Course</label>' + courseOptions(d ? d.courseId : state.activeCourse) + "</div>" +
          '<div class="admin-form__row"><label>Type</label>' + selOptions("type", DATE_TYPE_OPTIONS, d ? d.type : "Deadline") + "</div>" +
          '<div class="admin-form__row"><label>Date</label><input type="date" name="date" value="' + esc(d ? d.date : "") + '" required></div>' +
          '<div class="admin-form__row"><label>Status</label>' + selOptions("status", STATUS_OPTIONS, d ? d.status : "draft") + "</div>" +
        "</div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Event</label><input name="title" value="' + esc(d ? d.title : "") + '" required></div>' +
        '<div class="admin-form__actions"><button type="button" class="btn btn--ghost btn--sm" data-admin-close>Cancel</button>' +
        '<button type="submit" class="btn btn--primary btn--sm">' + (d ? "Save" : "Add date") + "</button></div></form>");
  }

  function openReferenceForm(id) {
    var r = id ? state.references.find(function (x) { return x.id === id; }) : null;
    openModal(r ? "Edit reference" : "Add reference", "Books, papers, sites, docs.",
      '<form class="admin-form" data-form="reference" data-id="' + (id || "") + '">' +
        '<div class="admin-form__grid">' +
          '<div class="admin-form__row"><label>Course</label>' + courseOptions(r ? r.courseId : state.activeCourse) + "</div>" +
          '<div class="admin-form__row"><label>Kind</label>' + selOptions("kind", KIND_OPTIONS, r ? r.kind : "book") + "</div>" +
          '<div class="admin-form__row"><label>URL</label><input name="url" value="' + esc(r ? r.url : "") + '"></div>' +
          '<div class="admin-form__row"><label>Status</label>' + selOptions("status", STATUS_OPTIONS, r ? r.status : "draft") + "</div>" +
        "</div>" +
        '<div class="admin-form__row admin-form__row--full"><label>Title</label><input name="title" value="' + esc(r ? r.title : "") + '" required></div>' +
        '<div class="admin-form__row admin-form__row--full"><label>Description</label><textarea name="desc">' + esc(r ? r.desc : "") + "</textarea></div>" +
        '<div class="admin-form__actions"><button type="button" class="btn btn--ghost btn--sm" data-admin-close>Cancel</button>' +
        '<button type="submit" class="btn btn--primary btn--sm">' + (r ? "Save" : "Add reference") + "</button></div></form>");
  }

  function selOptions(name, options, selected) {
    return '<select name="' + name + '">' + options.map(function (o) {
      return '<option value="' + esc(o) + '"' + (String(selected) === String(o) ? " selected" : "") + ">" + esc(o) + "</option>";
    }).join("") + "</select>";
  }

  /* ---------------- Publish quick button ---------------- */
  var publishQuick = $("#publishQuickBtn");
  if (publishQuick) {
    publishQuick.addEventListener("click", async function () {
      // publish the active course
      if (!state.activeCourse) { toast("No course selected.", "error"); return; }
      var c = courseById(state.activeCourse);
      if (!c) return;
      try {
        await API.adminUpdateCourse(c.id, { status: "published" });
        toast("Course published.", "success");
        await loadAll();
      } catch (e) { toast("Publish failed: " + (e.message || e), "error"); }
    });
  }

  /* ---------------- Init (no login — portal opens directly) ---------------- */
  initPortal();
})();
