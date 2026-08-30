/* ============================================================
   AD203 Portal — shared API helper
   Thin fetch wrapper used by both the student portal and the
   professor portal. No authentication is used.
   ============================================================ */
(function (global) {
  "use strict";

  function json(res) {
    return res.json().catch(function () { return {}; });
  }

  async function request(method, url, body, isForm) {
    const opts = { method, headers: {}, credentials: "same-origin" };
    if (body !== undefined) {
      if (isForm) {
        opts.body = body; // FormData sets its own multipart header
      } else {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(body);
      }
    }
    const res = await fetch(url, opts);
    const data = await json(res);
    if (!res.ok) {
      const err = new Error((data && data.error) || ("Request failed: " + res.status));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  global.API = {
    get: (url) => request("GET", url),
    post: (url, body) => request("POST", url, body),
    put: (url, body) => request("PUT", url, body),
    del: (url) => request("DELETE", url),
    upload: (url, formData) => request("POST", url, formData, true),

    // student
    courses: () => request("GET", "/api/courses"),
    course: (id) => request("GET", "/api/courses/" + id),
    courseResources: (id) => request("GET", "/api/courses/" + id + "/resources"),
    courseAssignments: (id) => request("GET", "/api/courses/" + id + "/assignments"),
    courseQuestions: (id) => request("GET", "/api/courses/" + id + "/questions"),
    courseAnnouncements: (id) => request("GET", "/api/courses/" + id + "/announcements"),
    courseDates: (id) => request("GET", "/api/courses/" + id + "/dates"),
    courseReferences: (id) => request("GET", "/api/courses/" + id + "/references"),

    // admin (no authentication)
    adminList: (collection, qs) => request("GET", "/api/admin/" + collection + (qs || "")),
    adminCreate: (collection, body) => request("POST", "/api/admin/" + collection, body),
    adminUpdate: (collection, id, body) => request("PUT", "/api/admin/" + collection + "/" + id, body),
    adminDelete: (collection, id) => request("DELETE", "/api/admin/" + collection + "/" + id),
    adminCourses: () => request("GET", "/api/admin/courses"),
    adminCreateCourse: (body) => request("POST", "/api/admin/courses", body),
    adminUpdateCourse: (id, body) => request("PUT", "/api/admin/courses/" + id, body),
    adminDeleteCourse: (id) => request("DELETE", "/api/admin/courses/" + id),
    adminDuplicateCourse: (id) => request("POST", "/api/admin/courses/" + id + "/duplicate"),
    adminAddUnit: (cid, body) => request("POST", "/api/admin/courses/" + cid + "/units", body),
    adminUpdateUnit: (cid, uid, body) => request("PUT", "/api/admin/courses/" + cid + "/units/" + uid, body),
    adminDeleteUnit: (cid, uid) => request("DELETE", "/api/admin/courses/" + cid + "/units/" + uid),
    adminAddTopic: (cid, uid, body) => request("POST", "/api/admin/courses/" + cid + "/units/" + uid + "/topics", body),
    adminUpdateTopic: (cid, uid, tid, body) => request("PUT", "/api/admin/courses/" + cid + "/units/" + uid + "/topics/" + tid, body),
    adminDeleteTopic: (cid, uid, tid) => request("DELETE", "/api/admin/courses/" + cid + "/units/" + uid + "/topics/" + tid),
    adminReorder: (cid, body) => request("PUT", "/api/admin/courses/" + cid + "/reorder", body),
    adminUpload: (formData) => request("POST", "/api/admin/upload", formData, true),
    adminDeleteFile: (p) => request("DELETE", "/api/admin/file?path=" + encodeURIComponent(p)),
    adminSettings: () => request("GET", "/api/admin/settings"),
    adminSaveSettings: (body) => request("PUT", "/api/admin/settings", body),
    adminExport: () => request("POST", "/api/admin/export"),
    adminImport: (data) => request("POST", "/api/admin/import", data),
    adminReset: () => request("POST", "/api/admin/reset")
  };
})(window);
