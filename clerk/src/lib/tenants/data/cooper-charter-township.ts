import type { Tenant } from "@/lib/tenants/schema";

const SITE = "https://www.coopertwp.org";

/**
 * Cooper Charter Township, Kalamazoo County.
 *
 * Every fact below was taken from the township's public website on 2026-10-22 and carries
 * its source URL. Nothing marked "public-site" has been confirmed by township staff yet;
 * confirmation happens in discovery (docs/onboarding-a-township.md, step 3).
 */
export const cooperCharterTownship: Tenant = {
  slug: "cooper-charter-township",
  name: "Cooper Charter Township",
  shortName: "Cooper Township",
  county: "Kalamazoo",
  state: "MI",
  timeZone: "America/Detroit",
  website: SITE,
  phone: "269-382-0223",
  address: { street: "1590 West D Ave.", city: "Kalamazoo", state: "MI", zip: "49009" },
  board: [
    { name: "Jeff Sorensen", role: "Supervisor" },
    { name: "DeAnna Janssen", role: "Clerk" },
    { name: "Robin DeHaan", role: "Treasurer" },
    { name: "Fred Vlietstra", role: "Trustee" },
    { name: "Adam Tuinstra", role: "Trustee" },
    { name: "Marc Rowlson", role: "Trustee" },
    { name: "Ray Wilson", role: "Trustee" },
  ],
  meetings: {
    body: "Township Board",
    weekOfMonth: 2,
    weekday: 1,
    time: "7:00 PM",
    location: "Cooper Township Hall, 1590 West D Avenue",
    provenance: { sourceUrl: `${SITE}/boards-and-committees/`, status: "public-site" },
  },
  foia: {
    coordinatorRole: "Township Clerk",
    policyUrl: `${SITE}/wp-content/uploads/2019/02/Amd.-FOIA-Procedures-and-Guidelines.pdf`,
    fees: {
      // Placeholders until discovery: the lowest-paid capable employee's actual wage and the
      // township's adopted fringe percentage must come from the clerk.
      lowestPaidCapableHourlyWage: 18.5,
      fringePercent: 35,
      copyCostPerSheet: 0.1,
      provenance: { sourceUrl: `${SITE}/freedom-of-information-act/`, status: "placeholder" },
    },
  },
  minutes: {
    heading: "THE CHARTER TOWNSHIP OF COOPER",
    certificationLine:
      "I, the undersigned, the duly qualified and elected Clerk for the Charter Township of Cooper, Kalamazoo County, Michigan, DO HEREBY CERTIFY that the foregoing is a true and complete copy of certain proceedings taken by the Township Board.",
    provenance: {
      sourceUrl: `${SITE}/wp-content/uploads/2023/07/tb-minutes-07102023.pdf`,
      status: "public-site",
    },
  },
  residentLine: {
    greeting:
      "Thank you for calling Cooper Charter Township. I'm the township's virtual assistant. How can I help?",
    faqs: [
      {
        id: "winter-taxes",
        topic: "Taxes",
        sampleQuestion: "When are my winter taxes due?",
        keywords: ["tax", "taxes", "winter", "summer", "due", "bill", "pay", "payment"],
        answer:
          "Winter tax bills go out around December 1 and are due February 14; interest starts February 15. Summer taxes are due September 14. The township accepts payments through February 28, and on March 1 unpaid taxes go to the Kalamazoo County Treasurer. You can pay in person, by mail, online through Point and Pay, or at the 24-hour drop box to the right of the main entrance.",
        followUp: "text-link",
        provenance: { sourceUrl: `${SITE}/taxes/`, status: "public-site" },
      },
      {
        id: "cemetery-lots",
        topic: "Cemeteries",
        sampleQuestion: "How do I buy a cemetery plot?",
        keywords: ["cemetery", "plot", "lot", "burial", "grave", "headstone"],
        answer:
          "Cooper Township has two cemeteries: East Cooper Cemetery at 7942 N. Riverview Drive and West Cooper Cemetery at 7530 Douglas Avenue. Burials and lot sales go through the Township Clerk, and fees are on the township fee schedule. The cemeteries are open sunrise to sunset.",
        followUp: "take-message",
        provenance: { sourceUrl: `${SITE}/cemeteries/`, status: "public-site" },
      },
      {
        id: "recycling",
        topic: "Recycling",
        sampleQuestion: "What day is recycling pickup?",
        keywords: ["recycling", "recycle", "trash", "garbage", "pickup", "bulk", "herbie"],
        answer:
          "Republic Services picks up single-stream recycling every other week. Your day (Tuesday, Wednesday, or Thursday) depends on your street, so I can text you the route map. Put your cart out the night before. For a missed pickup, call Republic Services at 1-888-249-5112.",
        followUp: "text-link",
        provenance: { sourceUrl: `${SITE}/curbside-pick-up-and-recycling/`, status: "public-site" },
      },
      {
        id: "voting",
        topic: "Elections",
        sampleQuestion: "Where and when can I vote early?",
        keywords: ["vote", "voting", "election", "ballot", "absentee", "register", "polls"],
        answer:
          "Early in-person voting for the November 3 election runs Saturday, October 24 through Sunday, November 1, from 8 a.m. to 4 p.m., at Cooper Township Hall only. On Election Day, polls are open 7 a.m. to 8 p.m. You can check your registration and polling place at the Michigan Voter Information Center.",
        followUp: "transfer",
        provenance: { sourceUrl: `${SITE}/elections/`, status: "public-site" },
      },
      {
        id: "burn-permit",
        topic: "Burning",
        sampleQuestion: "Do I need a burn permit?",
        keywords: ["burn", "burning", "fire", "permit", "bonfire", "leaves"],
        answer:
          "Cooper Township no longer requires burning permits, but you still need to follow the township's burning guidelines and any State burn ban in effect. I can text you the guidelines.",
        followUp: "text-link",
        provenance: { sourceUrl: `${SITE}/applications/`, status: "public-site" },
      },
      {
        id: "hall-rental",
        topic: "Room rental",
        sampleQuestion: "Can I rent the township hall?",
        keywords: ["rent", "rental", "hall", "room", "party", "reserve"],
        answer:
          "Yes. The township has a room rental application packet. I can text you the packet, and the office can confirm availability Monday through Friday, 8 a.m. to 4 p.m.",
        followUp: "text-link",
        provenance: { sourceUrl: `${SITE}/applications/`, status: "public-site" },
      },
      {
        id: "foia-request",
        topic: "Public records",
        sampleQuestion: "How do I file a FOIA request?",
        keywords: ["foia", "records", "record", "freedom", "information", "copy", "copies"],
        answer:
          "You can submit a written Freedom of Information Act request by mail or in person at 1590 West D Ave., using the township's FOIA request form or your own letter. The township responds within the time Michigan law allows. I can text you the form and the township's FOIA procedures.",
        followUp: "text-link",
        provenance: { sourceUrl: `${SITE}/freedom-of-information-act/`, status: "public-site" },
      },
      {
        id: "office-hours",
        topic: "Office hours",
        sampleQuestion: "What are your office hours?",
        keywords: ["hours", "open", "office", "closed", "address", "located"],
        answer:
          "The Township Office at 1590 West D Ave. in Kalamazoo is open Monday through Friday, 8 a.m. to 4 p.m.",
        followUp: "none",
        provenance: { sourceUrl: `${SITE}/`, status: "public-site" },
      },
    ],
  },
  salesNotes: [
    "Clerk's published duty list covers agendas, minutes, payroll, HR, the website, and the phone system.",
    "Board meets the 2nd Monday, which collides with Columbus Day (a Michigan legal holiday) every October.",
    "General election on Nov 3, 2026 with 9 days of early voting at Township Hall; do not call before Nov 16.",
    "Posts draft minutes publicly (e.g. 10092023-TB-Minutes-Draft.pdf), so the 8-business-day clock is already visible to residents.",
  ],
};
