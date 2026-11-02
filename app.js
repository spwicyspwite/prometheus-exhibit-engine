
"use strict";

/*
 * PROMETHEUS EXHIBIT DEVELOPMENT ENGINE
 * Application Logic — Version 0.2
 *
 * Generated content is PROPOSED, never established canon.
 */

// ==========================================
// 1. INITIAL REFERENCE DATA
// ==========================================

// Temporary examples until reference-data.json is connected.
// These are generic occupational scenarios, not canon events.

const exhibitTemplates = [
  {
    title: "Equipment Service Variance Report",
    division: "Operations",
    occupation: "Industrial Maintenance Mechanic",
    classification: "ETR",
    activity:
      "A maintenance employee compares equipment operating hours " +
      "against the preventive maintenance schedule.",
    circumstance:
      "The recorded operating hours differ from the expected " +
      "service interval."
  },
  {
    title: "Laboratory Quality Control Checklist",
    division: "Biological Sciences",
    occupation: "Laboratory Quality Control Technician",
    classification: "SLR",
    activity:
      "A laboratory employee reviews specimen labels, instrument " +
      "checks, and batch documentation.",
    circumstance:
      "One checklist item requires clarification before the " +
      "documentation can be finalized."
  },
  {
    title: "Materials Receipt Discrepancy",
    division: "Operations",
    occupation: "Receiving Clerk",
    classification: "SC",
    activity:
      "A receiving employee compares delivered materials against " +
      "the purchase order and packing list.",
    circumstance:
      "The shipment quantity is correct, but an item description " +
      "does not exactly match the order."
  },
  {
    title: "Overtime Reconciliation Worksheet",
    division: "Corporate Services",
    occupation: "Payroll Clerk",
    classification: "FAR",
    activity:
      "A payroll employee reconciles approved overtime with " +
      "submitted timekeeping records.",
    circumstance:
      "A small difference appears between the approval record " +
      "and the reported hours."
  },
  {
    title: "Access Badge Replacement Register",
    division: "Security (ISD)",
    occupation: "Security Administration Clerk",
    classification: "AR",
    activity:
      "A security employee records the issue of a replacement " +
      "access credential.",
    circumstance:
      "The disposition of the previous credential remains " +
      "unconfirmed in the replacement register."
  },
  {
    title: "Office Supply Requisition",
    division: "Corporate Services",
    occupation: "Administrative Assistant",
    classification: "AR",
    activity:
      "An office employee submits a routine request for " +
      "stationery and storage supplies.",
    circumstance:
      "The requested quantity is larger than the previous " +
      "month's order."
  }
];

// ==========================================
// 2. APPLICATION STATE
// ==========================================

let currentExhibit = null;
let lastTemplateIndex = -1;

const STORAGE_KEY = "prometheus-exhibit-ideas-v02";

let savedExhibits = loadSavedExhibits();

function loadSavedExhibits() {
  try {
    const value = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn("Could not load saved exhibits:", error);
    return [];
  }
}

function persistSavedExhibits() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(savedExhibits)
    );
    return true;
  } catch (error) {
    console.error("Could not save exhibits:", error);
    alert(
      "This browser could not save the exhibit. " +
      "Check your storage or privacy settings."
    );
    return false;
  }
}

// ==========================================
// 3. HELPER FUNCTIONS
// ==========================================

// Escape text before inserting it into HTML.
function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]
  );
}


function getTodaysDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}


function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

// ==========================================
// 4. NAVIGATION
// ==========================================

function showView(viewName) {
  document.querySelectorAll(".app-view").forEach(view => {
    const active = view.id === viewName;

    view.hidden = !active;
    view.classList.toggle("active", active);
  });

  document.querySelectorAll(".nav-button").forEach(button => {
    const active = button.dataset.view === viewName;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (viewName === "saved") {
    renderSavedExhibits();
  }
  
if (viewName === "related") {
  renderRelatedExplorer();

  if (
    currentRelatedExhibit &&
    currentExhibit &&
    currentRelatedExhibit.parentId === currentExhibit.id
  ) {
    renderRelatedProposal();
  }
}

if (viewName === "temporal") {
  renderTemporalExplorer();
}

}

function initializeNavigation() {
  document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", () => {
      showView(button.dataset.view);
    });
  });
}

// ==========================================
// 5. GENERATOR CONTROLS
// ==========================================

function initializeGenerator() {
  const container = document.getElementById(
    "generator-controls"
  );

  container.innerHTML = `
    <div class="control-group">
      <label for="division-select">Division</label>

      <select id="division-select">
        <option value="All">All Divisions</option>
        <option value="Biological Sciences">
          Biological Sciences
        </option>
        <option value="Operations">Operations</option>
        <option value="Security (ISD)">
          Security (ISD)
        </option>
        <option value="Corporate Services">
          Corporate Services
        </option>
      </select>
    </div>

    <div class="control-group">
      <label for="creative-mode">Creative Involvement</label>

      <select id="creative-mode">
        <option value="hands-off">
          Hands Off — Institutional Premise Only
        </option>
        <option value="guided">
          Guided Exploration — Open Questions
        </option>
        <option value="creative">
          Creative Assistance — Possible Implications
        </option>
      </select>
    </div>

    <div class="control-group">
      <label for="significance">
        Document Significance:
        <span id="significance-label">Routine</span>
      </label>

      <input
        id="significance"
        type="range"
        min="0"
        max="4"
        value="1"
      >
    </div>

    <div class="control-group">
      <label for="exhibit-date">
        Proposed Exhibit Date
      </label>

      <input
        id="exhibit-date"
        type="date"
        min="1975-02-18"
        max="2015-12-22"
        value="1992-06-15"
      >
    </div>

    <button id="generate-button" class="primary-button">
      Generate Exhibit
    </button>
  `;

  const significanceInput = document.getElementById(
    "significance"
  );

  significanceInput.addEventListener("input", () => {
    const labels = [
      "Purely Mundane",
      "Routine",
      "Operational Friction",
      "Potentially Significant",
      "Consequential"
    ];

    document.getElementById(
      "significance-label"
    ).textContent = labels[Number(significanceInput.value)];
  });

  document.getElementById(
    "generate-button"
  ).addEventListener("click", generateExhibit);
}

// ==========================================
// 6. EXHIBIT GENERATION
// ==========================================

function generateExhibit() {
  const division = document.getElementById(
    "division-select"
  ).value;

  const creativeMode = document.getElementById(
    "creative-mode"
  ).value;

  const significance = Number(
    document.getElementById("significance").value
  );

  const proposedDate = document.getElementById(
    "exhibit-date"
  ).value;

  const availableTemplates = exhibitTemplates.filter(
    template =>
      division === "All" ||
      template.division === division
  );

  if (availableTemplates.length === 0) {
    document.getElementById(
      "generator-results"
    ).textContent =
      "No templates exist for this division yet.";
    return;
  }

  // Avoid repeating the previous template where possible.
  let candidates = availableTemplates.filter(
    template =>
      exhibitTemplates.indexOf(template) !== lastTemplateIndex
  );

  if (candidates.length === 0) {
    candidates = availableTemplates;
  }

  const template = candidates[
    Math.floor(Math.random() * candidates.length)
  ];

  lastTemplateIndex = exhibitTemplates.indexOf(template);

  currentExhibit = {
    id: createId(),
    title: template.title,
    division: template.division,
    occupation: template.occupation,
    classification: template.classification,
    activity: template.activity,
    circumstance: template.circumstance,
    proposedDate,
    significance,
    creativeMode,
    status: "Proposed"
  };

  renderExhibit(currentExhibit);
}

function getSignificanceText(exhibit) {
  switch (exhibit.significance) {
    case 0:
      return "No unusual circumstances are required. " +
        "This record may simply establish everyday " +
        "corporate operations.";

    case 1:
      return exhibit.circumstance;

    case 2:
      return exhibit.circumstance +
        " The matter may require routine clarification.";

    case 3:
      return exhibit.circumstance +
        " Another department may need to review the record.";

    case 4:
      return exhibit.circumstance +
        " A subsequent institutional decision could " +
        "depend on how this record is interpreted. " +
        "No outcome is established.";

    default:
      return exhibit.circumstance;
  }
}

function getCreativeText(exhibit) {
  if (exhibit.creativeMode === "guided") {
    return "Open question: Which department or employee " +
      "would naturally encounter this record next?";
  }

  if (exhibit.creativeMode === "creative") {
    return "Optional possibility: Another department " +
      "might interpret the same documentation differently. " +
      "Neither interpretation needs to imply misconduct.";
  }

  return "";
}

function renderExhibit(exhibit) {
  const results = document.getElementById(
    "generator-results"
  );

  const creativeText = getCreativeText(exhibit);

  results.innerHTML = `
    <article class="exhibit-card">
      <div class="exhibit-metadata">
        <span class="metadata-tag">
          ${escapeHTML(exhibit.classification)}
        </span>

        <span class="metadata-tag">
          ${escapeHTML(exhibit.division)}
        </span>

        <span class="metadata-tag">
          Proposed
        </span>
      </div>

      <h3>${escapeHTML(exhibit.title)}</h3>

      <p>
        <strong>Occupational Perspective:</strong>
        ${escapeHTML(exhibit.occupation)}
      </p>

      <p>
        <strong>Proposed Date:</strong>
        ${escapeHTML(exhibit.proposedDate)}
      </p>

      <p>${escapeHTML(exhibit.activity)}</p>

      <p>
        ${escapeHTML(getSignificanceText(exhibit))}
      </p>

      ${
        creativeText
          ? `<p><em>${escapeHTML(creativeText)}</em></p>`
          : ""
      }

      <div class="action-row">
        <button
          id="save-exhibit"
          class="secondary-button"
        >
          Save Idea
        </button>

        <button
          id="copy-exhibit"
          class="secondary-button"
        >
          Copy
        </button>

        <button
          id="explore-related"
          class="primary-button"
        >
          Explore Related Exhibits
        </button>
      </div>
    </article>
  `;

  document.getElementById(
    "save-exhibit"
  ).addEventListener("click", saveCurrentExhibit);

  document.getElementById(
    "copy-exhibit"
  ).addEventListener("click", () => {
    copyExhibit(exhibit);
  });

  document.getElementById(
    "explore-related"
  ).addEventListener("click", () => {
    showView("related");
  });
}

// ==========================================
// 7. SAVING AND COPYING
// ==========================================

function saveCurrentExhibit() {
  if (!currentExhibit) return;

  if (savedExhibits.some(
    exhibit => exhibit.id === currentExhibit.id
  )) {
    alert("This exhibit is already saved.");
    return;
  }

  savedExhibits.push({ ...currentExhibit });

  if (persistSavedExhibits()) {
    alert("Exhibit idea saved in this browser.");
  } else {
    savedExhibits.pop();
  }
}

function formatExhibit(exhibit) {

  // Related exhibits need their own formatting.
  if (exhibit.parentId) {
    return formatRelatedExhibit(exhibit);
  }

  // Original exhibits retain their existing format.
  return [
    `PROPOSED EXHIBIT: ${exhibit.title}`,
    `Classification: ${exhibit.classification}`,
    `Division: ${exhibit.division}`,
    `Occupation: ${exhibit.occupation}`,
    `Proposed Date: ${exhibit.proposedDate}`,
    "",
    exhibit.activity,
    "",
    getSignificanceText(exhibit),
    "",
    getCreativeText(exhibit),
    "",
    "Status: Proposed — Not Established Canon"
  ].join("\n");
}

async function copyExhibit(exhibit) {
  try {
    await navigator.clipboard.writeText(
      formatExhibit(exhibit)
    );

    alert("Exhibit copied to clipboard.");
  } catch (error) {
    alert(
      "Clipboard access is unavailable. " +
      "Try using a supported browser or secure site."
    );
  }
}

function renderSavedExhibits() {
  const container = document.getElementById(
    "saved-results"
  );

  if (savedExhibits.length === 0) {
    container.textContent =
      "No saved exhibits yet. Generate an exhibit " +
      "and select Save Idea.";
    return;
  }

  container.innerHTML = savedExhibits.map(exhibit => `
    <article class="saved-item">
      <h3>${escapeHTML(exhibit.title)}</h3>

      <p>
        ${escapeHTML(exhibit.division)}
        · ${escapeHTML(exhibit.proposedDate)}
      </p>

      <div class="action-row">
        <button
          class="secondary-button copy-saved"
          data-id="${escapeHTML(exhibit.id)}"
        >
          Copy
        </button>

        <button
          class="secondary-button remove-saved"
          data-id="${escapeHTML(exhibit.id)}"
        >
          Remove
        </button>
      </div>
    </article>
  `).join("");

  container.querySelectorAll(".copy-saved").forEach(
    button => {
      button.addEventListener("click", () => {
        const exhibit = savedExhibits.find(
          item => item.id === button.dataset.id
        );

        if (exhibit) copyExhibit(exhibit);
      });
    }
  );

  container.querySelectorAll(".remove-saved").forEach(
    button => {
      button.addEventListener("click", () => {
        savedExhibits = savedExhibits.filter(
          item => item.id !== button.dataset.id
        );

        persistSavedExhibits();
        renderSavedExhibits();
      });
    }
  );
}

// ==========================================
// 8. APPLICATION STARTUP
// ==========================================

function initializeApp() {
  initializeNavigation();
  initializeGenerator();
  initializeRelatedExplorer();
  initializeTemporalExplorer();
  initializeBackupTools();

  showView("generator");
}

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


/* ==========================================
   9. RELATED EXHIBIT EXPLORER
   ========================================== */

// Relationships are documentary possibilities,
// not established events in the Prometheus archive.

const relatedExhibitLibrary = {
  "Equipment Service Variance Report": {
    before: [
      "Preventive Maintenance Schedule",
      "The earlier schedule identifies equipment assigned for servicing."
    ],
    after: [
      "Supervisor Clarification Request",
      "A supervisor requests clarification of the recorded service interval."
    ],
    parallel: [
      "Equipment Downtime Register",
      "An operating department records when the equipment was unavailable."
    ],
    administrative: [
      "Replacement Parts Requisition",
      "Materials personnel document a request for components used in servicing."
    ]
  },

  "Laboratory Quality Control Checklist": {
    before: [
      "Laboratory Batch Preparation Record",
      "A preparation record lists materials, equipment, and controls used."
    ],
    after: [
      "Quality Assurance Review Notice",
      "A reviewer requests confirmation that the documentation is complete."
    ],
    parallel: [
      "Laboratory Instrument Use Register",
      "A separate register records equipment usage during the relevant period."
    ],
    administrative: [
      "Document Correction Request",
      "Records personnel request a corrected or completed copy of a form."
    ]
  },

  "Materials Receipt Discrepancy": {
    before: [
      "Purchase Order",
      "The original order establishes the requested items and quantities."
    ],
    after: [
      "Vendor Clarification Correspondence",
      "Purchasing requests clarification of the shipment documentation."
    ],
    parallel: [
      "Warehouse Inventory Entry",
      "Stores personnel document how the received materials entered inventory."
    ],
    administrative: [
      "Invoice Matching Worksheet",
      "Accounts payable compares purchasing and receiving records."
    ]
  },

  "Overtime Reconciliation Worksheet": {
    before: [
      "Overtime Authorization Form",
      "A department records its approval of additional working hours."
    ],
    after: [
      "Payroll Adjustment Notice",
      "Payroll documents a proposed correction to recorded hours."
    ],
    parallel: [
      "Shift Attendance Register",
      "The department's attendance records provide another account of hours."
    ],
    administrative: [
      "Cost Center Allocation Summary",
      "Accounting reviews which budget should carry the recorded expense."
    ]
  },

  "Access Badge Replacement Register": {
    before: [
      "Original Credential Issue Record",
      "Security administration records the original credential assignment."
    ],
    after: [
      "Credential Deactivation Confirmation",
      "Security staff document the disposition of the earlier credential."
    ],
    parallel: [
      "Access Control Activity Log",
      "An access system records activity associated with the credential."
    ],
    administrative: [
      "Credential Replacement Authorization",
      "Administration documents approval of the replacement request."
    ]
  },

  "Office Supply Requisition": {
    before: [
      "Department Supply Inventory",
      "An office records the supplies remaining before a new request."
    ],
    after: [
      "Supply Issue Voucher",
      "Stores personnel document the materials issued to the department."
    ],
    parallel: [
      "Office Expenditure Summary",
      "Accounting compiles spending on routine administrative supplies."
    ],
    administrative: [
      "Expense Allocation Record",
      "A purchasing or accounting employee assigns the expense to a department."
    ]
  }
};

// Generic relationships for documents that aren't
// individually included in the reference library.

const defaultRelationships = {
  before: [
    "Preliminary Department Record",
    "An earlier departmental record may establish the circumstances " +
    "under which the original document was prepared."
  ],
  after: [
    "Follow-Up Correspondence",
    "An employee or supervisor may request clarification " +
    "after reviewing the original record."
  ],
  parallel: [
    "Independent Department Summary",
    "Another department may maintain a separate record " +
    "concerning the same operational activity."
  ],
  administrative: [
    "Administrative Processing Record",
    "An administrative employee may document the filing, " +
    "distribution, or processing of the original record."
  ]
};

const relationshipLabels = {
  before: "What Came Before?",
  after: "What Happened Next?",
  parallel: "Another Perspective",
  administrative: "Administrative Paper Trail"
};

let selectedRelationship = "after";
let currentRelatedExhibit = null;

function initializeRelatedExplorer() {
  const controls = document.getElementById(
    "related-controls"
  );

  controls.innerHTML = `
    <div class="control-group">
      <label for="relationship-type">
        Documentary Relationship
      </label>

      <select id="relationship-type">
        <option value="before">
          What Came Before?
        </option>
        <option value="after" selected>
          What Happened Next?
        </option>
        <option value="parallel">
          Another Perspective
        </option>
        <option value="administrative">
          Administrative Paper Trail
        </option>
      </select>
    </div>

    <button
      id="generate-related-button"
      class="primary-button"
    >
      Generate Related Exhibit
    </button>
  `;

  document.getElementById(
    "relationship-type"
  ).addEventListener("change", event => {
    selectedRelationship = event.target.value;
  });

  document.getElementById(
    "generate-related-button"
  ).addEventListener("click", generateRelatedExhibit);

  renderRelatedExplorer();
}

function renderRelatedExplorer() {
  const results = document.getElementById(
    "related-results"
  );

  if (!currentExhibit) {
    results.innerHTML = `
      <div class="exhibit-card">
        <h3>No Parent Exhibit Selected</h3>

        <p>
          Generate an exhibit first, then return here
          to explore its documentary relationships.
        </p>

        <button
          id="return-to-generator"
          class="secondary-button"
        >
          Open Exhibit Generator
        </button>
      </div>
    `;

    document.getElementById(
      "return-to-generator"
    ).addEventListener("click", () => {
      showView("generator");
    });
    return;
  }

  results.innerHTML = `
    <div class="exhibit-card">
      <div class="exhibit-metadata">
        <span class="metadata-tag">Parent Exhibit</span>
        <span class="metadata-tag">
          ${escapeHTML(currentExhibit.classification)}
        </span>
      </div>

      <h3>${escapeHTML(currentExhibit.title)}</h3>

      <p>${escapeHTML(currentExhibit.activity)}</p>

      <p>
        <strong>Proposed Date:</strong>
        ${escapeHTML(currentExhibit.proposedDate)}
      </p>
    </div>

    <div id="related-proposal"></div>
  `;
}

function generateRelatedExhibit() {
  if (!currentExhibit) {
    renderRelatedExplorer();
    return;
  }

  const relationships =
    relatedExhibitLibrary[currentExhibit.title] ||
    defaultRelationships;

  const suggestion =
    relationships[selectedRelationship] ||
    defaultRelationships[selectedRelationship];

  currentRelatedExhibit = {
    id: createId(),
    parentId: currentExhibit.id,
    parentTitle: currentExhibit.title,
    title: suggestion[0],
    activity: suggestion[1],
    division: currentExhibit.division,
    occupation: "Pending occupational verification",
    classification: "Pending classification",
    proposedDate: "",
    significance: 1,
    creativeMode: "hands-off",
    circumstance: "",
    relationship: selectedRelationship,
    status: "Proposed"
  };

  renderRelatedProposal();
}

function renderRelatedProposal() {
  if (!currentRelatedExhibit) return;

  const related = currentRelatedExhibit;

  const container = document.getElementById(
    "related-proposal"
  );

  if (!container) return;

  container.innerHTML = `
    <article class="exhibit-card">
      <div class="exhibit-metadata">
        <span class="metadata-tag">
          Proposed Related Record
        </span>

        <span class="metadata-tag">
          ${escapeHTML(
            relationshipLabels[related.relationship]
          )}
        </span>
      </div>

      <h3>${escapeHTML(related.title)}</h3>

      <p>${escapeHTML(related.activity)}</p>

      <p>
        <strong>Relationship:</strong>
        ${escapeHTML(related.parentTitle)}
      </p>

    <p>
        <strong>Proposed Date:</strong>
        ${
        related.proposedDate
        ? escapeHTML(related.proposedDate)
        : "Not yet determined"
        }
    </p>

      <p>
        <em>
          This document is a possibility, not an
          established part of the Prometheus archive.
        </em>
      </p>

      <div class="action-row">
        <button
          id="save-related"
          class="secondary-button"
        >
          Save Related Idea
        </button>

        <button
          id="copy-related"
          class="secondary-button"
        >
          Copy
        </button>

        <button
          id="explore-related-timing"
          class="primary-button"
        >
          Explore Timing
        </button>
      </div>
    </article>
  `;

  document.getElementById(
    "save-related"
  ).addEventListener("click", saveRelatedExhibit);

  document.getElementById(
    "copy-related"
  ).addEventListener("click", copyRelatedExhibit);

document.getElementById(
  "explore-related-timing"
).addEventListener("click", () => {
  prepareTemporalFromRelated();
  showView("temporal");
});
}

function formatRelatedExhibit(related) {
  return [
    "PROPOSED RELATED EXHIBIT: " + related.title,

    "Parent Exhibit: " + related.parentTitle,

    "Relationship: " +
      relationshipLabels[related.relationship],

    "Division: " + related.division,

    "Occupation: " + related.occupation,

    "Classification: " + related.classification,

    "Proposed Date: " +
      (related.proposedDate || "Not yet determined"),

    "",
    related.activity,
    "",
    "Status: Proposed — Not Established Canon"
  ].join("\n");
}

async function copyRelatedExhibit() {
  if (!currentRelatedExhibit) return;

  try {
    await navigator.clipboard.writeText(
      formatRelatedExhibit(currentRelatedExhibit)
    );

    alert("Related exhibit copied.");
  } catch (error) {
    alert("Clipboard access is unavailable.");
  }
}

function saveRelatedExhibit() {
  if (!currentRelatedExhibit) return;

  if (savedExhibits.some(
    item => item.id === currentRelatedExhibit.id
  )) {
    alert("This related exhibit is already saved.");
    return;
  }

  savedExhibits.push({
    ...currentRelatedExhibit
  });

  if (persistSavedExhibits()) {
    alert("Related exhibit idea saved.");
  } else {
    savedExhibits.pop();
  }
}


/* ==========================================
   10. TEMPORAL RELATIONSHIP EXPLORER
   ========================================== */

/*
 * These are illustrative administrative windows,
 * NOT established InGen processing requirements.
 */

const temporalWindows = {
  urgent: {
    label: "Urgent Operational Response",
    minimum: 0,
    maximum: 2,
    explanation:
      "An urgent operational matter might be documented " +
      "on the same day or within the next 48 hours."
  },

  routine: {
    label: "Routine Administrative Follow-Up",
    minimum: 1,
    maximum: 14,
    explanation:
      "Routine internal correspondence or review might " +
      "occur within approximately two weeks."
  },

  procurement: {
    label: "Procurement or Materials Processing",
    minimum: 7,
    maximum: 90,
    explanation:
      "Purchasing, materials handling, vendor correspondence, " +
      "and related processing may extend over several weeks."
  },

  periodic: {
    label: "Periodic Management Review",
    minimum: 30,
    maximum: 90,
    explanation:
      "Some documents are reviewed in monthly or " +
      "quarterly administrative cycles."
  },

  archival: {
    label: "Archival Retrieval or Retrospective Review",
    minimum: 90,
    maximum: 730,
    explanation:
      "An existing document might be retrieved or reviewed " +
      "months or years after its original preparation."
  }
};

const temporalMechanisms = {
  creation: "Document Creation",
  distribution: "Document Distribution",
  response: "Administrative Response",
  retrospective: "Retrospective Discovery or Review"
};

let temporalContext = {
  anchorDate: "1992-06-15",
  direction: "after",
  category: "routine",
  mechanism: "response",
  chosenDate: "1992-06-22",
  parentTitle: "",
  relatedTitle: ""
};

// Use UTC calendar arithmetic to avoid daylight-saving
// transitions changing the number of elapsed days.

const MILLISECONDS_PER_DAY = 86400000;

function parseCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parts = value.split("-").map(Number);

  const date = new Date(Date.UTC(
    parts[0],
    parts[1] - 1,
    parts[2]
  ));

  if (
    date.getUTCFullYear() !== parts[0] ||
    date.getUTCMonth() !== parts[1] - 1 ||
    date.getUTCDate() !== parts[2]
  ) {
    return null;
  }

  return date;
}

function dateToISO(date) {
  return date.toISOString().slice(0, 10);
}

function shiftCalendarDate(value, days) {
  const date = parseCalendarDate(value);

  if (!date) return "";

  date.setUTCDate(date.getUTCDate() + days);

  return dateToISO(date);
}

function calculateDayDifference(first, second) {
  const start = parseCalendarDate(first);
  const end = parseCalendarDate(second);

  if (!start || !end) return null;

  return Math.round(
    (end.getTime() - start.getTime()) /
    MILLISECONDS_PER_DAY
  );
}

function formatCalendarDate(value) {
  const date = parseCalendarDate(value);

  if (!date) return "Invalid date";

  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// Called by the Related Exhibit Explorer.
// It carries the selected exhibits into the calculator.

function prepareTemporalFromRelated() {
  if (!currentExhibit || !currentRelatedExhibit) {
    return;
  }

  const relationship = currentRelatedExhibit.relationship;

  const categoryByRelationship = {
    before: "routine",
    after: "routine",
    parallel: "routine",
    administrative: "procurement"
  };

  temporalContext.anchorDate =
    currentExhibit.proposedDate || "1992-06-15";

  temporalContext.direction =
    relationship === "before" ? "before" : "after";

  temporalContext.category =
    categoryByRelationship[relationship] || "routine";

  temporalContext.mechanism =
    relationship === "before" ? "creation" : "response";

  temporalContext.parentTitle = currentExhibit.title;
  temporalContext.relatedTitle = currentRelatedExhibit.title;

  if (currentRelatedExhibit.proposedDate) {
    temporalContext.chosenDate =
      currentRelatedExhibit.proposedDate;
  } else {
    const window = temporalWindows[temporalContext.category];

    const offset = temporalContext.direction === "before"
      ? -window.minimum
      : window.minimum;

    temporalContext.chosenDate = shiftCalendarDate(
      temporalContext.anchorDate,
      offset
    );
  }
}

function initializeTemporalExplorer() {
  const controls = document.getElementById(
    "temporal-controls"
  );

  controls.innerHTML = `
    <div id="temporal-context"></div>

    <div class="control-group">
      <label for="temporal-anchor">
        Anchor Exhibit Date
      </label>
      <input id="temporal-anchor" type="date">
    </div>

    <div class="control-group">
      <label for="temporal-direction">
        Temporal Direction
      </label>
      <select id="temporal-direction">
        <option value="before">Before Parent Exhibit</option>
        <option value="after">After Parent Exhibit</option>
      </select>
    </div>

    <div class="control-group">
      <label for="temporal-category">
        Administrative Process
      </label>
      <select id="temporal-category">
        <option value="urgent">Urgent Operational Response</option>
        <option value="routine">Routine Administrative Follow-Up</option>
        <option value="procurement">Procurement / Materials</option>
        <option value="periodic">Periodic Management Review</option>
        <option value="archival">Archival Retrieval / Review</option>
      </select>
    </div>

    <div class="control-group">
      <label for="temporal-mechanism">
        What Does This Date Represent?
      </label>
      <select id="temporal-mechanism">
        <option value="creation">Document Creation</option>
        <option value="distribution">Document Distribution</option>
        <option value="response">Administrative Response</option>
        <option value="retrospective">Retrospective Discovery / Review</option>
      </select>
    </div>

    <div class="control-group">
      <label for="temporal-chosen">
        Your Chosen Related Date
      </label>
      <input id="temporal-chosen" type="date">
    </div>
  `;

  const bindings = [
    ["temporal-anchor", "anchorDate"],
    ["temporal-direction", "direction"],
    ["temporal-category", "category"],
    ["temporal-mechanism", "mechanism"],
    ["temporal-chosen", "chosenDate"]
  ];

  bindings.forEach(([elementId, property]) => {
    document.getElementById(elementId).addEventListener(
      "change",
      event => {
        temporalContext[property] = event.target.value;
        renderTemporalExplorer();
      }
    );
  });

  renderTemporalExplorer();
}

function renderTemporalExplorer() {
  const context = document.getElementById(
    "temporal-context"
  );

  if (!context) return;

  // Keep the controls synchronized with the current
  // parent/related record context.

  document.getElementById("temporal-anchor").value =
    temporalContext.anchorDate;

  document.getElementById("temporal-direction").value =
    temporalContext.direction;

  document.getElementById("temporal-category").value =
    temporalContext.category;

  document.getElementById("temporal-mechanism").value =
    temporalContext.mechanism;

  document.getElementById("temporal-chosen").value =
    temporalContext.chosenDate;

  
if (temporalContext.parentTitle) {
  context.innerHTML = `
    <div class="exhibit-card">
      <div class="exhibit-metadata">
        <span class="metadata-tag">
          Connected Exhibit Relationship
        </span>
      </div>

      <p>
        <strong>Parent:</strong>
        ${escapeHTML(temporalContext.parentTitle)}
      </p>

      <p>
        <strong>Related:</strong>
        ${escapeHTML(temporalContext.relatedTitle)}
      </p>

      <button
        id="switch-independent"
        type="button"
        class="secondary-button"
      >
        Switch to Independent Mode
      </button>
    </div>
  `;

  document.getElementById(
    "switch-independent"
  ).addEventListener("click", () => {
    temporalContext.parentTitle = "";
    temporalContext.relatedTitle = "";

    renderTemporalExplorer();
  });

} else {
  context.innerHTML = `
    <div class="exhibit-card">
      <div class="exhibit-metadata">
        <span class="metadata-tag">
          Independent Mode
        </span>
      </div>

      <p>
        Explore a documentary relationship without
        connecting it to a generated exhibit.
      </p>

      <p>
        Your dates and administrative process can
        be adjusted independently.
      </p>
    </div>
  `;
}

  const result = document.getElementById(
    "temporal-results"
  );

  const window = temporalWindows[temporalContext.category];

  const {
    anchorDate,
    chosenDate,
    direction,
    mechanism
  } = temporalContext;

  const anchor = parseCalendarDate(anchorDate);
  const chosen = parseCalendarDate(chosenDate);

  if (!anchor || !chosen) {
    result.textContent =
      "Please select valid dates for both exhibits.";
    return;
  }

  const multiplier = direction === "before" ? -1 : 1;

  const lowerDate = shiftCalendarDate(
    anchorDate,
    direction === "before"
      ? -window.maximum
      : window.minimum
  );

  const upperDate = shiftCalendarDate(
    anchorDate,
    direction === "before"
      ? -window.minimum
      : window.maximum
  );

  const actualDifference = calculateDayDifference(
    anchorDate,
    chosenDate
  );

  const directionalDays =
    actualDifference * multiplier;

  let assessment = "";

  if (directionalDays < 0) {
    assessment =
      "Your chosen date falls on the opposite side " +
      "of the anchor date from the selected direction. " +
      "Check whether Before or After is intended.";
  } else if (directionalDays < window.minimum) {
    assessment =
      "Your chosen date is " +
      (window.minimum - directionalDays) +
      " day(s) earlier than the suggested interval. " +
      "This is not automatically a continuity error.";
  } else if (directionalDays > window.maximum) {
    assessment =
      "Your chosen date is " +
      (directionalDays - window.maximum) +
      " day(s) beyond the suggested maximum. " +
      "An unusual delay may be entirely intentional.";
  } else {
    assessment =
      "Your chosen date falls within the illustrative " +
      "administrative window.";
  }

  result.innerHTML = `
    <article class="exhibit-card">
      <div class="exhibit-metadata">
        <span class="metadata-tag">
          Suggested Temporal Window
        </span>
        <span class="metadata-tag">
          Not Canon
        </span>
      </div>

      <h3>${escapeHTML(window.label)}</h3>

      <p>${escapeHTML(window.explanation)}</p>

      <p>
        <strong>Earliest suggested date:</strong>
        ${escapeHTML(formatCalendarDate(lowerDate))}
      </p>

      <p>
        <strong>Latest suggested date:</strong>
        ${escapeHTML(formatCalendarDate(upperDate))}
      </p>

      <hr>

      <p>
        <strong>Your chosen date:</strong>
        ${escapeHTML(formatCalendarDate(chosenDate))}
      </p>

      <p>
        <strong>Interval:</strong>
        ${Math.abs(actualDifference)} calendar day(s)
      </p>

      <p>
        <strong>Documentary event:</strong>
        ${escapeHTML(temporalMechanisms[mechanism])}
      </p>

      <p>${escapeHTML(assessment)}</p>

      <p>
        <em>
          An administrative window is a suggestion,
          not an established InGen policy. This tool
          does not determine why a document was delayed.
        </em>
      </p>

      <div class="action-row">
        <button
          id="copy-temporal"
          class="secondary-button"
        >
          Copy Relationship
        </button>

        ${
          temporalContext.parentTitle
            ? `<button
                 id="apply-temporal"
                 class="primary-button"
               >
                 Apply Date to Related Exhibit
               </button>`
            : ""
        }
      </div>
    </article>
  `;

  document.getElementById(
    "copy-temporal"
  ).addEventListener("click", copyTemporalRelationship);

  const applyButton = document.getElementById(
    "apply-temporal"
  );

  if (applyButton) {
    applyButton.addEventListener(
      "click",
      applyTemporalRelationship
    );
  }
}

async function copyTemporalRelationship() {
  const window = temporalWindows[
    temporalContext.category
  ];

  const text = [
    "PROPOSED TEMPORAL RELATIONSHIP",
    "Parent: " + (
      temporalContext.parentTitle || "Independent"
    ),
    "Related: " + (
      temporalContext.relatedTitle || "Unspecified"
    ),
    "Anchor Date: " + temporalContext.anchorDate,
    "Direction: " + temporalContext.direction,
    "Administrative Process: " + window.label,
    "Date Represents: " +
      temporalMechanisms[temporalContext.mechanism],
    "Chosen Date: " + temporalContext.chosenDate,
    "Suggested Interval: " +
      window.minimum + "–" + window.maximum + " days",
    "",
    "Status: Proposed — Not Established Canon"
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    alert("Temporal relationship copied.");
  } catch (error) {
    alert("Clipboard access is unavailable.");
  }
}

function applyTemporalRelationship() {
  if (
    !currentRelatedExhibit ||
    !parseCalendarDate(temporalContext.chosenDate)
  ) {
    alert("No valid related exhibit is selected.");
    return;
  }

  currentRelatedExhibit.proposedDate =
    temporalContext.chosenDate;

  // Update the saved record if this related exhibit
  // has already been saved.

  const savedIndex = savedExhibits.findIndex(
    item => item.id === currentRelatedExhibit.id
  );

  if (savedIndex !== -1) {
    savedExhibits[savedIndex].proposedDate =
      temporalContext.chosenDate;

    if (!persistSavedExhibits()) {
      alert("The date could not be persisted.");
      return;
    }
  }

    // Refresh the related exhibit's displayed information.
    renderRelatedProposal();

  alert(
    "Chosen date applied to the related exhibit. " +
    "This remains a proposal, not established canon."
  );
}


/* ==========================================
   11. SAVED IDEAS BACKUP AND RESTORE
   ========================================== */

const BACKUP_FORMAT = "prometheus-exhibit-backup";
const BACKUP_VERSION = 1;
const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

function initializeBackupTools() {
  const savedResults = document.getElementById(
    "saved-results"
  );

  if (!savedResults) return;

  const toolbar = document.createElement("div");
  toolbar.className = "action-row";

  toolbar.innerHTML = `
    <button
      id="export-ideas"
      class="primary-button"
      type="button"
    >
      Export Ideas
    </button>

    <button
      id="import-ideas"
      class="secondary-button"
      type="button"
    >
      Import Ideas
    </button>

    <input
      id="backup-file-input"
      type="file"
      accept=".json,application/json"
      hidden
    >

    <p id="backup-status" role="status"></p>
  `;

  savedResults.before(toolbar);

  document.getElementById(
    "export-ideas"
  ).addEventListener("click", exportSavedIdeas);

  document.getElementById(
    "import-ideas"
  ).addEventListener("click", () => {
    document.getElementById(
      "backup-file-input"
    ).click();
  });

  document.getElementById(
    "backup-file-input"
  ).addEventListener("change", importSavedIdeas);
}

function setBackupStatus(message) {
  const status = document.getElementById(
    "backup-status"
  );

  if (status) {
    status.textContent = message;
  }
}

// ------------------------------------------
// EXPORT
// ------------------------------------------

function exportSavedIdeas() {
  const backup = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    exhibits: savedExhibits
  };

  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob([json], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  const date = getTodaysDate();

  link.href = url;
  link.download =
    "prometheus-exhibits-" + date + ".json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  // Give the browser time to start its download.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);

  setBackupStatus(
    "Export prepared: " +
    savedExhibits.length +
    " exhibit(s). Check your browser downloads."
  );
}

// ------------------------------------------
// IMPORT VALIDATION
// ------------------------------------------

// Keep only fields understood by this version.
// Imported records must remain proposals.

function validateImportedExhibit(item) {
  if (
    !item ||
    typeof item !== "object" ||
    Array.isArray(item)
  ) {
    throw new Error("Invalid exhibit record.");
  }

  if (
    typeof item.id !== "string" ||
    !item.id.trim() ||
    typeof item.title !== "string" ||
    !item.title.trim() ||
    typeof item.activity !== "string"
  ) {
    throw new Error(
      "An exhibit is missing required information."
    );
  }

  const fields = [
    "id",
    "title",
    "division",
    "occupation",
    "classification",
    "activity",
    "circumstance",
    "proposedDate",
    "creativeMode",
    "parentId",
    "parentTitle",
    "relationship"
  ];

  const exhibit = {};

  for (const field of fields) {
    const value = item[field];

    if (value === undefined || value === null) {
      continue;
    }

    if (
      typeof value !== "string" ||
      value.length > 10000
    ) {
      throw new Error(
        "Invalid field in imported exhibit: " + field
      );
    }

    exhibit[field] = value;
  }

  exhibit.significance =
    Number.isInteger(item.significance) &&
    item.significance >= 0 &&
    item.significance <= 4
      ? item.significance
      : 1;

  if (!["hands-off", "guided", "creative"].includes(
    exhibit.creativeMode
  )) {
    exhibit.creativeMode = "hands-off";
  }

  if (
    exhibit.parentId &&
    !["before", "after", "parallel", "administrative"]
      .includes(exhibit.relationship)
  ) {
    throw new Error(
      "A related exhibit has an invalid relationship."
    );
  }

  // Import never establishes a proposal as canon.
  exhibit.status = "Proposed";

  return exhibit;
}

// ------------------------------------------
// IMPORT
// ------------------------------------------

async function importSavedIdeas(event) {
  const input = event.target;
  const file = input.files && input.files[0];

  // Allow the same file to be selected again.
  input.value = "";

  if (!file) return;

  if (file.size > MAX_BACKUP_BYTES) {
    setBackupStatus(
      "Import failed: file exceeds the 5 MB limit."
    );
    return;
  }

  try {
    const contents = await file.text();
    const backup = JSON.parse(contents);

    if (
      !backup ||
      backup.format !== BACKUP_FORMAT ||
      backup.version !== BACKUP_VERSION ||
      !Array.isArray(backup.exhibits)
    ) {
      throw new Error(
        "Unsupported Prometheus backup format."
      );
    }

    // Validate all records before changing storage.
    const imported = backup.exhibits.map(
      validateImportedExhibit
    );

    const existingIds = new Set(
      savedExhibits.map(item => item.id)
    );

    const additions = [];

    for (const exhibit of imported) {
      if (existingIds.has(exhibit.id)) {
        continue;
      }

      existingIds.add(exhibit.id);
      additions.push(exhibit);
    }

    if (additions.length === 0) {
      setBackupStatus(
        "No new exhibits found. Existing records " +
        "were left unchanged."
      );
      return;
    }

    const previous = savedExhibits;

    savedExhibits = [
      ...savedExhibits,
      ...additions
    ];

    if (!persistSavedExhibits()) {
      savedExhibits = previous;

      setBackupStatus(
        "Import failed: browser storage was unavailable."
      );
      return;
    }

    renderSavedExhibits();

    setBackupStatus(
      "Imported " +
      additions.length +
      " new exhibit(s). " +
      (imported.length - additions.length) +
      " duplicate(s) skipped."
    );

  } catch (error) {
    console.error("Backup import failed:", error);

    setBackupStatus(
      "Import failed: " + error.message
    );
  }
}
