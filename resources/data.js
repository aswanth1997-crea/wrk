/* ============================================================
   AD203 Portal — static site data
   Single source of truth for the student portal and the
   professor (management) page. No server, no database.

   Add/edit resources here, then refresh the site.
   ============================================================ */
window.COURSE_DATA = {
  courses: [
    {
      id: "ad203",
      code: "AD203",
      name: "Artificial Intelligence",
      dept: "Computer Science",
      credits: "3-0-3",
      professor: "Dr. Alapan Kuila",
      semester: "Autumn 2026",
      units: [
        { id: "unit-1", title: "Introduction to Artificial Intelligence", weeks: "Weeks 1\u20132" },
        { id: "unit-2", title: "State Space Search", weeks: "Weeks 3\u20135" },
        { id: "unit-3", title: "Game Playing and Constraint Satisfaction", weeks: "Weeks 6\u20137" },
        { id: "unit-4", title: "Probabilistic Reasoning", weeks: "Weeks 8\u201310" },
        { id: "unit-5", title: "Reinforcement Learning", weeks: "Weeks 11\u201312" },
        { id: "unit-6", title: "Modern Artificial Intelligence", weeks: "Weeks 13\u201314" }
      ]
    }
  ],

  /* Each resource:
     {
       "title":  "Introduction to AI",
       "type":   "pdf",            // pdf | ppt | doc | notes | image | link
       "course": "AD203",
       "unit":   "Unit 1",          // Unit 1 .. Unit 6
       "session":"Session 1",       // session / topic label
       "file":   "resources/AD203/Unit-1/introduction-to-ai.pdf"  // project-relative
     }
  */
  resources: [
    {
      "title": "AI Introduction 1",
      "type": "pdf",
      "course": "AD203",
      "unit": "Unit 1",
      "session": "Introduction to Artificial Intelligence",
      "file": "resources/AD203/Unit-1/ai_iiitdmk_1st.pdf"
    }
  ],

  /* Static content mirrored from the site (kept here so the
     professor page can show units; student portal already
     hard-codes the same content in index.html). */
  announcements: [],
  dates: [],
  assignments: [],
  questions: [],
  references: []
};
