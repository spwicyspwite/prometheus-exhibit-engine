
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

function getToday'sDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
  ].filter(
    (line, index, array) =>
      line !== "" ||
      (index > 0 && array[index - 1] !== "")
  ).join("\n");
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

  // The Related and Temporal tools will be
  // implemented in the next development step.

  showView("generator");
}

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);

