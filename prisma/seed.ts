import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";
// Relative imports only — tsx does not reliably resolve the "@/" tsconfig alias.
// seed-data.ts has no imports of its own, so this is safe.
import {
  WARDS,
  DEPARTMENTS,
  CATEGORIES,
  BADGES,
  type CategorySeed,
} from "../src/lib/seed-data";

const db = new PrismaClient();

// ---------- helpers ----------
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** n distinct random elements from arr. */
function sampleN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

const OFFICER_PWD = "Officer@123!demo";
const ADMIN_PWD = "Admin@123!demo";

const COSIGN_REASONS = [
  "This affects my family's daily commute.",
  "Same problem on my street for weeks now.",
  "My children walk past here every day.",
  "Elderly residents are struggling because of this.",
  "It is a genuine health hazard for the whole lane.",
  "I have faced the exact same issue nearby.",
  "This needs urgent attention before monsoon.",
];

const CLOSURE_GOOD = [
  "Team visited the site on schedule, cleared the blockage completely, and verified with the complainant. Before/after photos attached; area inspected again after 24 hours and confirmed clear.",
  "Repair crew dispatched within SLA. Replaced the damaged unit, tested functionality, and obtained sign-off from the local resident committee. Follow-up inspection scheduled in two weeks.",
  "Issue resolved by the field team. Root cause was a clogged outlet which has been desilted; drainage flow restored and measured. Ward engineer has certified completion.",
];
const CLOSURE_BOILERPLATE = [
  "Matter has been examined and necessary action taken. Issue resolved.",
  "Complaint forwarded to concerned department. Needful done.",
  "The grievance has been disposed of as per procedure. Closed.",
];

interface SeededUser {
  id: string;
  role: string;
  departmentCode: string | null;
}

async function main() {
  console.log("Seeding Samadhan…");

  // ---------- wipe (dependency order) ----------
  await db.caseEvent.deleteMany();
  await db.evidence.deleteMany();
  await db.upvote.deleteMany();
  await db.cosign.deleteMany();
  await db.notification.deleteMany();
  await db.userBadge.deleteMany();
  await db.mockMessage.deleteMany();
  await db.case.deleteMany();
  await db.category.deleteMany();
  await db.department.deleteMany();
  await db.ward.deleteMany();
  await db.badge.deleteMany();
  await db.user.deleteMany();

  // ---------- reference data ----------
  await db.ward.createMany({ data: WARDS });
  await db.department.createMany({
    data: DEPARTMENTS.map((d) => ({ code: d.code, name: d.name })),
  });
  for (const c of CATEGORIES) {
    await db.category.create({
      data: {
        id: c.id,
        name: c.name,
        slaDays: c.slaDays,
        departmentCode: c.departmentCode,
      },
    });
  }
  await db.badge.createMany({ data: BADGES });
  console.log(
    `  ${WARDS.length} wards · ${DEPARTMENTS.length} departments · ${CATEGORIES.length} categories · ${BADGES.length} badges`,
  );

  // ---------- demo personas (§13.2) ----------
  const priya = await db.user.create({
    data: {
      role: "CITIZEN",
      name: "Priya Sharma",
      phone: "+919999900001",
      wardCode: "HW",
      reputation: 540,
      streakDays: 9,
      showOnLeaderboard: true,
      lastVisitAt: new Date(),
    },
  });

  const rajesh = await db.user.create({
    data: {
      role: "OFFICER",
      name: "Rajesh Kumar",
      email: "rajesh@mcgm.gov.in",
      passwordHash: bcrypt.hashSync(OFFICER_PWD, 12),
      departmentCode: "SANITATION",
      wardCode: "KE",
      isDeptLead: true,
    },
  });

  const anita = await db.user.create({
    data: {
      role: "ADMIN",
      name: "Anita Desai",
      email: "anita@mcgm.gov.in",
      passwordHash: bcrypt.hashSync(ADMIN_PWD, 12),
    },
  });

  // ---------- extra officers: one lead per department ----------
  const extraOfficers: Array<{
    name: string;
    email: string;
    dept: string;
    ward: string;
    lead: boolean;
  }> = [
    { name: "Sunita Patil", email: "sunita@mcgm.gov.in", dept: "WATER", ward: "GN", lead: true },
    { name: "Imran Shaikh", email: "imran@mcgm.gov.in", dept: "ELECTRICITY", ward: "HW", lead: true },
    { name: "Deepa Nair", email: "deepa@mcgm.gov.in", dept: "ROADS", ward: "PN", lead: true },
    { name: "Arun Joshi", email: "arun@mcgm.gov.in", dept: "HEALTH", ward: "ME", lead: true },
    { name: "Meena Rao", email: "meena@mcgm.gov.in", dept: "EDUCATION", ward: "L", lead: true },
    { name: "Vikram Singh", email: "vikram@mcgm.gov.in", dept: "POLICE", ward: "A", lead: true },
    { name: "Farah Khan", email: "farah@mcgm.gov.in", dept: "PUBLIC_WORKS", ward: "RC", lead: true },
    { name: "Sanjay More", email: "sanjay@mcgm.gov.in", dept: "SANITATION", ward: "PN", lead: false },
    { name: "Reena Iyer", email: "reena@mcgm.gov.in", dept: "ROADS", ward: "KW", lead: false },
  ];

  const officers: SeededUser[] = [
    { id: rajesh.id, role: "OFFICER", departmentCode: "SANITATION" },
  ];
  for (const o of extraOfficers) {
    const created = await db.user.create({
      data: {
        role: "OFFICER",
        name: o.name,
        email: o.email,
        passwordHash: bcrypt.hashSync(OFFICER_PWD, 12),
        departmentCode: o.dept,
        wardCode: o.ward,
        isDeptLead: o.lead,
      },
    });
    officers.push({ id: created.id, role: "OFFICER", departmentCode: o.dept });
  }

  // ---------- extra citizens ----------
  const citizenNames = [
    "Amit Verma", "Sneha Kulkarni", "Rohit Mehta", "Fatima Ansari", "Karan Gupta",
    "Divya Pillai", "Manoj Tiwari", "Asha Bhosale", "Nitin Jadhav", "Pooja Reddy",
    "Sameer Qureshi", "Lakshmi Menon", "Harish Chand", "Neha Kapoor", "Tarun Das",
    "Ritu Agarwal", "Suresh Yadav", "Komal Shah", "Aditya Rane", "Zoya Sheikh",
  ];
  const citizens: string[] = [priya.id];
  for (let i = 0; i < citizenNames.length; i++) {
    const created = await db.user.create({
      data: {
        role: "CITIZEN",
        name: citizenNames[i],
        phone: `+9199999${String(10000 + i).padStart(5, "0")}`,
        wardCode: pick(WARDS).code,
        reputation: randInt(100, 1600),
        streakDays: randInt(0, 28),
        showOnLeaderboard: Math.random() < 0.6,
      },
    });
    citizens.push(created.id);
  }
  console.log(
    `  ${officers.length} officers · ${citizens.length} citizens (incl. demo personas)`,
  );

  // ---------- 200 cases ----------
  const STATUS_PLAN: string[] = [
    ...Array(40).fill("OPEN"),
    ...Array(25).fill("ACKNOWLEDGED"),
    ...Array(35).fill("IN_PROGRESS"),
    ...Array(15).fill("AWAITING_INFO"),
    ...Array(45).fill("RESOLVED"),
    ...Array(15).fill("ESCALATED"),
    ...Array(25).fill("CLOSED"),
  ];
  // shuffle
  for (let i = STATUS_PLAN.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [STATUS_PLAN[i], STATUS_PLAN[j]] = [STATUS_PLAN[j], STATUS_PLAN[i]];
  }

  const now = new Date();
  const SEVERITIES = ["LOW", "MEDIUM", "HIGH"];
  let seq = 100;

  const officersByDept = (dept: string) =>
    officers.filter((o) => o.departmentCode === dept);

  for (let n = 0; n < STATUS_PLAN.length; n++) {
    const status = STATUS_PLAN[n];
    const category: CategorySeed = pick(CATEGORIES);
    const ward = pick(WARDS);
    const severity = pick(SEVERITIES);
    const filerId = pick(citizens);
    const deptOfficers = officersByDept(category.departmentCode);
    const assignee =
      status === "OPEN" && Math.random() < 0.5
        ? null
        : (deptOfficers.length ? pick(deptOfficers) : pick(officers));

    const ageDays = randInt(1, 60);
    const createdAt = subDays(now, ageDays);
    const slaDueAt = addDays(createdAt, category.slaDays);

    const title = `${category.name} reported in ${ward.name}`.slice(0, 80);
    const body =
      `Residents of ${ward.name} (Ward ${ward.code}) have reported a recurring problem: ` +
      `${category.name.toLowerCase()}. The situation has persisted for several days and is ` +
      `causing inconvenience to the neighbourhood. Severity assessed as ${severity.toLowerCase()}. ` +
      `Requesting the ${category.departmentCode.replace("_", " ").toLowerCase()} department to inspect and act.`;

    // ----- timeline -----
    type Ev = {
      type: string;
      actorId: string | null;
      message?: string;
      metadata?: string;
      createdAt: Date;
    };
    const events: Ev[] = [
      { type: "CREATED", actorId: filerId, message: "Complaint filed.", createdAt },
    ];
    let cursor = createdAt;
    // Advance the timeline cursor by a random gap, never past (now - 1h).
    const step = (minH: number, maxH: number) => {
      cursor = new Date(
        Math.min(
          cursor.getTime() + randInt(minH, maxH) * 3_600_000,
          now.getTime() - 3_600_000,
        ),
      );
      return cursor;
    };
    const officerId = assignee?.id ?? null;

    let resolvedAt: Date | null = null;
    let closedAt: Date | null = null;
    let escalated = false;
    let qualityScore: number | null = null;
    let isBoilerplate: boolean | null = null;

    const ack = () =>
      events.push({
        type: "ACKNOWLEDGED",
        actorId: officerId,
        message: "Acknowledged by department officer.",
        createdAt: step(2, 36),
      });
    const inprog = () =>
      events.push({
        type: "STATUS_CHANGED",
        actorId: officerId,
        message: "Work started on site.",
        metadata: JSON.stringify({ to: "IN_PROGRESS" }),
        createdAt: step(4, 48),
      });

    if (status === "ACKNOWLEDGED") {
      ack();
    } else if (status === "IN_PROGRESS") {
      ack();
      inprog();
    } else if (status === "AWAITING_INFO") {
      ack();
      events.push({
        type: "INFO_REQUESTED",
        actorId: officerId,
        message: "Could you share the exact location and a photo?",
        createdAt: step(3, 24),
      });
    } else if (status === "RESOLVED") {
      ack();
      inprog();
      resolvedAt = step(6, 72);
      events.push({
        type: "RESOLVED",
        actorId: officerId,
        message: "Issue addressed; awaiting confirmation.",
        createdAt: resolvedAt,
      });
    } else if (status === "ESCALATED") {
      escalated = true;
      if (Math.random() < 0.7) ack();
      events.push({
        type: "ESCALATED",
        actorId: null,
        message: "SLA breached — auto-escalated to ward lead.",
        metadata: JSON.stringify({ reason: "SLA_BREACH" }),
        createdAt: step(1, 24),
      });
    } else if (status === "CLOSED") {
      ack();
      inprog();
      resolvedAt = step(6, 72);
      events.push({
        type: "RESOLVED",
        actorId: officerId,
        message: "Resolution completed.",
        createdAt: resolvedAt,
      });
      const boiler = Math.random() < 0.3;
      qualityScore = boiler ? randInt(1, 4) : randInt(6, 10);
      isBoilerplate = boiler;
      closedAt = step(2, 48);
      events.push({
        type: "CLOSED",
        actorId: officerId,
        message: boiler ? pick(CLOSURE_BOILERPLATE) : pick(CLOSURE_GOOD),
        metadata: JSON.stringify({ qualityScore, isBoilerplate }),
        createdAt: closedAt,
      });
    }

    // ----- engagement -----
    const otherCitizens = citizens.filter((c) => c !== filerId);
    const upvoters = sampleN(otherCitizens, randInt(0, 12));
    const cosigners = sampleN(upvoters, randInt(0, Math.min(4, upvoters.length)));

    const number = `SMD-2026-${String(seq++).padStart(6, "0")}`;

    await db.case.create({
      data: {
        number,
        title,
        body,
        status,
        severity,
        wardCode: ward.code,
        departmentCode: category.departmentCode,
        categoryId: category.id,
        filedById: filerId,
        assignedToId: officerId,
        slaDueAt,
        escalated,
        isPublic: Math.random() < 0.9,
        qualityScore,
        isBoilerplate,
        createdAt,
        resolvedAt,
        closedAt,
        events: { create: events },
        upvotes: {
          create: upvoters.map((uid) => ({
            userId: uid,
            createdAt: subDays(now, randInt(0, ageDays)),
          })),
        },
        cosigns: {
          create: cosigners.map((uid) => ({
            userId: uid,
            reason: pick(COSIGN_REASONS),
            createdAt: subDays(now, randInt(0, ageDays)),
          })),
        },
      },
    });
  }
  console.log(`  ${STATUS_PLAN.length} cases with timelines, upvotes & cosigns`);

  // ---------- a few badge awards for the demo citizen ----------
  await db.userBadge.createMany({
    data: [
      { userId: priya.id, badgeId: "first-voice" },
      { userId: priya.id, badgeId: "verified-resolver" },
      { userId: priya.id, badgeId: "neighbour" },
      { userId: priya.id, badgeId: "streak-starter" },
    ],
  });

  // ---------- a starter notification for Priya ----------
  await db.notification.create({
    data: {
      userId: priya.id,
      title: "Welcome to Samadhan",
      body: "File a complaint and track it like an Uber ride.",
      link: "/file",
    },
  });

  console.log("Seed complete.");
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
