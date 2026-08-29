// This registry records product truth. The build serializes only entries that
// are available; not-offered entries remain internal.
export const capabilityStatuses = Object.freeze({
  available: "Available",
  not_offered: "Not offered",
});

export const productCapabilities = Object.freeze([
  Object.freeze({
    key: "soap_note",
    name: "Recorded-visit SOAP workflow",
    status: "available",
    description:
      "Upload a visit recording, review and edit the draft SOAP note, then copy and paste the reviewed note into the patient chart.",
  }),
  Object.freeze({
    key: "intake_prep",
    name: "Intake Prep",
    status: "not_offered",
    description: "Not offered as a public Cosmas product.",
  }),
  Object.freeze({
    key: "session_prep",
    name: "Session Prep",
    status: "not_offered",
    description: "Not offered as a public Cosmas product.",
  }),
  Object.freeze({
    key: "scribe",
    name: "Scribe",
    status: "not_offered",
    description: "Not offered as a public Cosmas product.",
  }),
  Object.freeze({
    key: "cab",
    name: "Computer-Assisted Billing",
    status: "not_offered",
    description: "Not offered as a public Cosmas product.",
  }),
]);
