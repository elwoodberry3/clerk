import type { LegalCitation } from "@/lib/rules/types";

export const MI_CITATIONS = {
  foiaReceipt: {
    cite: "MCL 15.235(1)",
    summary:
      "An emailed, faxed, or other electronic request is received 1 business day after it is sent. A request delivered to spam or junk mail is received 1 day after the township first becomes aware of it.",
    url: "https://capitol.legislature.mi.gov/documents/mcl/pdf/mcl-15-235.pdf",
  },
  foiaResponse: {
    cite: "MCL 15.235(2)",
    summary:
      "Respond within 5 business days after receipt: grant, deny, grant in part, or issue one extension notice of up to 10 business days.",
    url: "https://capitol.legislature.mi.gov/documents/mcl/pdf/mcl-15-235.pdf",
  },
  foiaDenialContents: {
    cite: "MCL 15.235(5)",
    summary:
      "A denial must explain the basis, certify non-existence where applicable, describe what was separated, explain appeal and court rights, and give notice of attorneys' fees and damages.",
    url: "https://capitol.legislature.mi.gov/documents/mcl/pdf/mcl-15-235.pdf",
  },
  foiaExtension: {
    cite: "MCL 15.235(2)(d), (7)",
    summary:
      "Only one extension notice per request, of not more than 10 business days, stating the reasons and the new response date.",
    url: "https://capitol.legislature.mi.gov/documents/mcl/pdf/mcl-15-235.pdf",
  },
  businessDay: {
    cite: "Mich. Attorney General opinion (op10248)",
    summary:
      '"Business days" are consecutive weekdays other than Saturdays, Sundays, and legal holidays, whether or not the office is open.',
    url: "https://www.ag.state.mi.us/opinion/datafiles/2000s/op10248.htm",
  },
  legalHolidays: {
    cite: "MCL 435.101",
    summary: "Michigan's list of legal holidays, including Lincoln's Birthday and Columbus Day.",
    url: "https://www.legislature.mi.gov/documents/mcl/pdf/MCL-435-101.pdf",
  },
  foiaFees: {
    cite: "MCL 15.234",
    summary:
      "Labor at the lowest-paid capable employee's wage in 15-minute increments (rounded down), up to 50% fringe, paper at no more than $0.10/sheet; deposit up to half only if the estimate exceeds $50.",
    url: "https://ombudsman.legislature.mi.gov/documents/mcl/pdf/MCL-15-234.pdf",
  },
  minutes: {
    cite: "MCL 15.269(3)",
    summary:
      "Proposed minutes must be available within 8 business days after the meeting; approved minutes within 5 business days after the meeting at which they are approved.",
    url: "https://capitol.legislature.mi.gov/documents/mcl/pdf/mcl-15-269.pdf",
  },
} as const satisfies Record<string, LegalCitation>;

export type MichiganCitationKey = keyof typeof MI_CITATIONS;
