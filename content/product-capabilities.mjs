export const capabilityStatuses = Object.freeze({
  available: "Available",
  paid_pilot_preview: "Paid-pilot preview",
  coming_soon: "Coming soon",
});

export const productCapabilities = Object.freeze([
  Object.freeze({
    key: "soap_note",
    name: "SOAP Note Generator",
    status: "paid_pilot_preview",
    description:
      "Create editable SOAP drafts for clinician review and manual copy or export. Cosmas does not write to an EHR.",
  }),
  Object.freeze({
    key: "intake_prep",
    name: "Intake Prep",
    status: "paid_pilot_preview",
    description:
      "Send a patient-authored, five-question Visit Prep. An authorized practice user can configure the wording and order.",
  }),
  Object.freeze({
    key: "session_prep",
    name: "Session Prep",
    status: "coming_soon",
    description:
      "A provider-only, read-only pre-session brief. It is not available in the public paid pilot yet.",
  }),
  Object.freeze({
    key: "scribe",
    name: "Scribe",
    status: "coming_soon",
    description:
      "Foreground web and PWA capture comes first. Desktop and native-mobile clients remain on the roadmap.",
  }),
  Object.freeze({
    key: "cab",
    name: "Computer-Assisted Billing",
    status: "coming_soon",
    description:
      "Billing intelligence only. CAB provides advisory recommendations for clinician or coder review. It will not write to the EHR, submit claims, generate 837P files, or enroll practices with a clearinghouse; those capabilities are not on the roadmap.",
  }),
]);
