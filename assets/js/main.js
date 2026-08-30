/* ============================================================
   Artificial Intelligence (AD203) — main.js
   Nav, mobile menu, accordion, schedule, modals, reveal, counters
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Schedule data (from original site) ---------------- */
  var MATERIALS = {
    1: [
      { title: "Lecture 1 - Welcome to the Course", type: "Lecture", file: "/materials/week1/lecture1-welcome.pdf" },
      { title: "Lecture 2 - Evolution of Artificial Intelligence", type: "Lecture", file: "/materials/week1/ai_iiitdmk_2nd.pdf" }
    ],
    2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [], 13: [], 14: []
  };

  var SCHEDULE = [
    { week: 1, title: "Introduction to Artificial Intelligence", topics: "History of AI, Philosophy of AI, Definitions and Applications" },
    { week: 2, title: "Agents & Problem Formulation", topics: "Intelligent Agents, PEAS, Environment Types, State Space Representation" },
    { week: 3, title: "Uninformed Search", topics: "BFS, DFS, DLS, IDS, Uniform Cost Search" },
    { week: 4, title: "Informed Search", topics: "Greedy Search, A*, Heuristics" },
    { week: 5, title: "Local Search", topics: "Hill Climbing, Simulated Annealing, Genetic Algorithms" },
    { week: 6, title: "Adversarial Search", topics: "Games, Minimax, Alpha-Beta Pruning" },
    { week: 7, title: "Constraint Satisfaction", topics: "CSP, Backtracking, Arc Consistency" },
    { week: 8, title: "Probability", topics: "Probability Review, Bayes Theorem" },
    { week: 9, title: "Bayesian Networks", topics: "Conditional Independence, Inference, Sampling" },
    { week: 10, title: "Decision Theory", topics: "Utility, Decision Networks" },
    { week: 11, title: "Markov Decision Processes", topics: "Bellman Equations, Policy Evaluation, Value Iteration" },
    { week: 12, title: "Reinforcement Learning", topics: "Monte Carlo, TD Learning, Q-Learning, SARSA" },
    { week: 13, title: "Deep Learning & Deep RL", topics: "Perceptron, MLP, CNN, RNN, DQN, Actor-Critic" },
    { week: 14, title: "LLMs, Ethics & Revision", topics: "Transformers, Large Language Models, Responsible AI, Revision" }
  ];

  /* ---------------- Icon helpers (lucide paths) ---------------- */
  var ICONS = {
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
    fileText: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    download: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>',
    eye: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
    bookOpen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
    fileCode: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/></svg>',
    notebookPen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></svg>',
    inbox: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
  };

  // Base path for material files. Resolves relative to the current page so the
  // site works both from a static server subpath and from file://.
  var BASE = (function () {
    var path = window.location.pathname || "/";
    if (!path.endsWith("/")) path = path.slice(0, path.lastIndexOf("/") + 1);
    return path;
  })();

  function materialIcon(type) {
    switch (type) {
      case "Lecture": return ICONS.bookOpen;
      case "Lab": return ICONS.fileCode;
      case "Assignment": return ICONS.notebookPen;
      default: return ICONS.fileText;
    }
  }

  /* ---------------- Render schedule ---------------- */
  var scheduleList = document.getElementById("scheduleList");
  if (scheduleList) {
    var rows = SCHEDULE.map(function (entry) {
      var has = (MATERIALS[entry.week] || []).length > 0;
      var row = document.createElement("div");
      row.className = "schedule-row";
      row.setAttribute("data-reveal", "");
      row.innerHTML =
        '<span class="schedule-row__chip">W' + entry.week + "</span>" +
        '<div>' +
          '<p class="schedule-row__week">Week ' + entry.week + "</p>" +
          '<h3 class="schedule-row__title">' + entry.title + "</h3>" +
          '<p class="schedule-row__topics">' + entry.topics + "</p>" +
        "</div>" +
        '<div class="schedule-row__actions">' +
          '<button class="btn btn--ghost btn--sm" data-open-modal="' + entry.week + '" aria-haspopup="dialog">' +
            ICONS.fileText +
            "Course Materials" +
          "</button>" +
          (has ? "" : '<span class="schedule-row__hint">Not yet uploaded</span>') +
        "</div>";
      scheduleList.appendChild(row);
    });
  }

  /* ---------------- Modal ---------------- */
  var modal = document.getElementById("modal");
  var modalBody = document.getElementById("modalBody");
  var modalTitle = document.getElementById("modalTitle");
  var modalSub = document.getElementById("modalSub");
  var lastFocused = null;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function openModal(week) {
    if (!modal || !modalBody) return;
    lastFocused = document.activeElement;
    var list = MATERIALS[week] || [];

    var html = "";
    if (list.length === 0) {
      html +=
        '<div class="modal__empty">' + ICONS.inbox +
          "<p><strong>No materials uploaded yet.</strong></p>" +
          "<p style=\"font-size:0.85rem;\">Lecture slides for this week will appear here when published.</p>" +
        "</div>";
    } else {
      list.forEach(function (item) {
        var href = BASE + item.file;
        html +=
          '<div class="material">' +
            '<span class="material__icon">' + materialIcon(item.type) + "</span>" +
            '<div class="material__meta">' +
              '<p class="material__name">' + esc(item.title) + "</p>" +
              '<p class="material__type">' + esc(item.type) + "</p>" +
            "</div>" +
            '<div class="material__actions">' +
              '<a class="material__action material__action--view" href="' + href + '" target="_blank" rel="noopener">' + ICONS.eye + "View</a>" +
              '<a class="material__action material__action--dl" href="' + href + '" download>' + ICONS.download + "Download</a>" +
            "</div>" +
          "</div>";
      });
    }

    html +=
      '<div class="modal__notice">' + ICONS.info +
        "<span>Materials link to the live course site; PDF files are not bundled in this offline copy.</span>" +
      "</div>";

    modalBody.innerHTML = html;
    modalTitle.textContent = "Week " + week + " Materials";
    modalSub.textContent = "Lecture slides, notes, assignments and resources.";

    modal.hidden = false;
    // force reflow so the transition plays
    void modal.offsetWidth;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";

    var closeBtn = modal.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      modal.hidden = true;
      modal.removeEventListener("transitionend", finish);
      clearTimeout(timer);
    };
    var timer = setTimeout(finish, 350);
    modal.addEventListener("transitionend", finish);
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-open-modal]");
    if (opener) {
      openModal(parseInt(opener.getAttribute("data-open-modal"), 10));
      return;
    }
    if (e.target.closest("[data-modal-close]")) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  /* ---------------- Accordion ---------------- */
  var accordion = document.getElementById("accordion");
  if (accordion) {
    accordion.addEventListener("click", function (e) {
      var trigger = e.target.closest(".accordion__trigger");
      if (!trigger) return;
      var item = trigger.closest(".accordion__item");
      var isOpen = item.classList.contains("is-open");

      // close all, then open the clicked one (single-open accordion)
      accordion.querySelectorAll(".accordion__item.is-open").forEach(function (openItem) {
        openItem.classList.remove("is-open");
        openItem.querySelector(".accordion__trigger").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  }

  /* ---------------- Navbar ---------------- */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");

  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      if (nav) nav.classList.toggle("is-menu-open", !open);
    });
  }

  // close mobile menu when a link is chosen
  document.querySelectorAll("[data-nav]").forEach(function (link) {
    link.addEventListener("click", function () {
      navToggle.setAttribute("aria-expanded", "false");
      if (nav) nav.classList.remove("is-menu-open");
    });
  });

  /* ---------------- Active section highlight ---------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").replace(/^#/, "");
      return document.getElementById(id);
    })
    .filter(Boolean);

  var spy = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach(function (s) { spy.observe(s); });

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObs.observe(el); });

    // hero elements should animate immediately on load
    var hero = document.querySelector(".hero");
    if (hero) {
      hero.querySelectorAll("[data-reveal]").forEach(function (el, i) {
        setTimeout(function () { el.classList.add("is-visible"); }, 100 + i * 90);
      });
    }
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- Count-up stats ---------------- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (prefersReduced) {
      el.textContent = target;
      return;
    }
    var dur = 1100;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var countObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { countObs.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ---------------- Grading progress bars ---------------- */
  var fills = document.querySelectorAll("[data-fill]");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var fillObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.getAttribute("data-fill");
            fillObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    fills.forEach(function (el) { fillObs.observe(el); });
  } else {
    fills.forEach(function (el) { el.style.width = el.getAttribute("data-fill"); });
  }

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
