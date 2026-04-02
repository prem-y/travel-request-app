# Travel Request App

A SAP UI5 / Fiori application for managing employee travel requests across three role-based modules — Employee, Manager, and Finance.

---

## Table of Contents

- [Application Overview](#application-overview)
- [Features by Module](#features-by-module)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [How to Run](#how-to-run)
- [Running Tests](#running-tests)

---

## Application Overview

The Travel Request App allows employees to raise travel requests, managers to approve or reject them, and the finance team to view all approved requests for processing. The app is built using SAP UI5 with a Fiori design system and follows the MVC architecture with component-based bootstrapping.

**Three role-based modules:**

| Module | Access | Purpose |
|--------|--------|---------|
| Employee | All employees | Create and track travel requests |
| Manager | Team managers | Review and approve / reject pending requests |
| Finance | Finance team | View all approved requests and total estimated costs |

---

## Features by Module

### Employee Module
- Dashboard with KPI tiles — Total, Pending, Approved, Rejected counts
- Create Travel Request form with full validation
- Save as Draft, Submit, or Cancel
- View My Requests — filterable list report with status tracking
- Edit and delete Draft requests
- Live sync with Manager and Finance views

### Manager Module
- List of all Pending Approval requests
- Single Approve / Reject with remarks dialog
- Bulk Approve / Reject with multi-select
- Filters by Travel Type and Search

### Finance Module
- Read-only list of all Approved requests
- Filters by Date Range, Employee ID, and Amount range
- Summary strip showing total request count and total estimated amount

---

## Architecture

```
webapp/
├── Component.js              ← App entry point, MockServer startup, shared model init
├── manifest.json             ← Routing, model declarations, lib dependencies
│
├── view/                     ← XML View
│   ├── App.view.xml          ← Shell: ToolPage with SideNavigation + ToolHeader
│   ├── Dashboard.view.xml    ← KPI GenericTile grid
│   ├── Employee.view.xml     ← List Report — My Requests
│   ├── Manager.view.xml      ← List Report — Pending Approvals
│   ├── Finance.view.xml      ← List Report — Approved Requests (read-only)
│   └── RequestCreate.view.xml← Object Page — Create / Edit Travel Request
│
├── controller/               ← Controller logic only, no UI manipulation
│   ├── App.controller.js     ← Module switching, drawer nav, session binding
│   ├── Dashboard.controller.js
│   ├── Employee.controller.js
│   ├── Manager.controller.js
│   ├── Finance.controller.js
│   └── RequestCreate.controller.js
│
├── fragment/
│   └── RemarksDialog.fragment.xml ← Reusable Approve/Reject remarks dialog
│
├── model/
│   ├── formatter.js          ← Custom formatters: statusState, statusText, formatAmount, isDraft
│   ├── Utils.js              ← Shared utilities: handleError, updateTableTitle, generateRequestId
│   ├── Session.js            ← Simulated user session model (employeeId, role, initials)
│   └── models.js             ← Device model factory
│
├── localService/
│   ├── metadata.xml          ← OData service metadata (TravelRequest EntityType)
│   ├── mockserver.js         ← MockServer bootstrap
│   └── mockdata/
│       └── TravelRequests.json ← Seed data for all mock OData responses
│
├── i18n/
│   └── i18n.properties       ← All UI text labels, placeholders, messages
│
└── test/
    └── unit/
        ├── unitTests.qunit.html
        ├── formatter.test.js          ← 22 formatter unit tests
        └── RequestCreate.controller.test.js ← 18 controller + Utils unit tests
```

### Data Flow

```
Component.js
    │
    ├── Starts MockServer → registers ODataModel (default model "")
    ├── Loads all TravelRequests from OData → populates sharedModel
    └── Creates sessionModel (current user)

Employee Controller     → reads sharedModel (filtered by employeeId)
Manager Controller      → reads sharedModel (filtered by status = Pending)
Finance Controller      → reads sharedModel (filtered by status = Approved)
Dashboard Controller    → counts from sharedModel for KPI tiles

RequestCreate Controller
    ├── OData create()  → MockServer persists → sharedModel updated
    └── OData update()  → MockServer persists → sharedModel updated

Manager Controller
    └── OData update()  → status change → sharedModel updated → all views reflect
```

### Model Strategy

| Model Name | Type | Scope | Purpose |
|------------|------|-------|---------|
| `""` (default) | ODataModel v2 | Component | MockServer OData calls |
| `sharedModel` | JSONModel | Component | Live cross-view state store |
| `sessionModel` | JSONModel | Component | Current user info |
| `requestModel` | JSONModel | View | Form field two-way binding |
| `uiModel` | JSONModel | View | Busy state, validation states, button states |
| `requestListModel` | JSONModel | View | Employee table items |
| `managerModel` | JSONModel | View | Manager table items |
| `financeModel` | JSONModel | View | Finance table items |
| `kpiModel` | JSONModel | View | Dashboard KPI counts |
| `remarksModel` | JSONModel | View | Remarks dialog state |
| `i18n` | ResourceModel | Component | Internationalisation |

---

## Technology Stack

| Technology | Version | Usage |
|------------|---------|-------|
| SAP UI5 | 1.146+ | Core framework |
| sap.tnt | 1.146+ | ToolPage, SideNavigation, ToolHeader |
| sap.f | 1.146+ | DynamicPage, DynamicPageTitle, DynamicPageHeader |
| sap.m | 1.146+ | All controls — Table, GenericTile, Dialog, Form |
| sap.ui.layout.form | 1.146+ | Form, FormContainer, FormElement, ColumnLayout |
| sap.ui.core.util.MockServer | 1.146+ | OData mock service |
| QUnit 2 | Bundled | Unit testing |
| @ui5/cli | 4.x | Build and serve tooling |
| @sap/ux-ui5-tooling | 1.x | Fiori tools integration |

---

## How to Run

### Prerequisites

- Node.js >= 18
- SAP Business Application Studio (BAS) or VS Code with UI5 tools
- Dependencies installed:

```bash
npm install
```

### Start (no Fiori Launchpad — recommended for development and demo)

```bash
npm run start-noflp
```

This opens the app directly at `index.html` with no SAP shell bar wrapper. The MockServer starts automatically from `Component.js` — no backend connection required.

### Start (with Fiori Launchpad sandbox)

```bash
npm start
```

Opens via `test/flp.html` — shows the full SAP Fiori shell bar with app tile.

### Build

```bash
npm run build
```

Produces optimised output in the `dist/` folder.

---

## Running Tests

### Unit tests

```bash
npm run unit-test
```

Opens `test/unit/unitTests.qunit.html` in the browser with QUnit test runner.

**Test files:**

| File | Tests | Coverage |
|------|-------|----------|
| `formatter.test.js` | 22 | statusState, statusText, formatAmount, isDraft |
| `RequestCreate.controller.test.js` | 18 | Validation logic, amount checks, Utils functions |

---

## Notes

- The MockServer intercepts all OData calls at runtime — no real backend is needed
- All data changes (create, update, approve, reject) persist in the MockServer during the session
- Refreshing the browser resets the MockServer to the original seed data in `TravelRequests.json`
- To connect to a real OData backend, replace the `serviceUrl` in `Component.js` `_startMockServer` with your actual service URL and remove the MockServer setup
