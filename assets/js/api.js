/* ============================================================
   AD203 Portal — static data helper
   Reads the static COURSE_DATA object (resources/data.js).
   No server, no fetch, no database.
   ============================================================ */
(function (global) {
  "use strict";

  function data() {
    return global.COURSE_DATA || { courses: [], resources: [] };
  }

  function firstCourse() {
    var c = data().courses[0];
    return c || { id: "ad203", code: "AD203", name: "Artificial Intelligence", units: [] };
  }

  function courseResources() {
    return (data().resources || []).filter(function (r) {
      return !r.course || r.course === firstCourse().code;
    });
  }

  global.API = {
    courses: function () {
      return Promise.resolve({ courses: data().courses });
    },
    course: function (id) {
      var c = data().courses.find(function (x) { return x.id === id; }) || firstCourse();
      return Promise.resolve({ course: c });
    },
    courseResources: function () {
      return Promise.resolve({ resources: courseResources() });
    },
    courseAssignments: function () { return Promise.resolve({ assignments: [] }); },
    courseQuestions: function () { return Promise.resolve({ questions: [] }); },
    courseReferences: function () { return Promise.resolve({ references: [] }); }
  };
})(window);
