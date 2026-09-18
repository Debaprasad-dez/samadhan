import { PrismaClient, type Prisma } from "@prisma/client";
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

// The pooled URL (PgBouncer) drops this long batch halfway through; the seed
// is a one-shot job, so it talks to the database directly.
const db = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL });

/** Case writes go out a few at a time: hundreds of sequential round-trips outlive the connection. */
const CHUNK = 6;

/** Neon drops a long-running connection now and then (P1017); the next query reconnects. */
async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 4): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (attempt >= tries || (code !== "P1017" && code !== "P1001")) throw e;
      console.log(`  ${label}: ${code} — retry ${attempt}/${tries - 1}`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

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
  "Same problem in our para for weeks now.",
  "My children walk past here to school every day.",
  "Elderly people in our lane are struggling because of this.",
  "It is a health hazard — dengue cases are rising nearby.",
  "Our shop has lost customers because of this.",
  "I have faced the exact same issue a few houses away.",
  "This needs fixing before the next heavy rain.",
];

// Complaint text per category, written the way Agartala residents describe
// these problems in the local press (2023–2026): Smart City drain works left
// open, waterlogging after light rain, TSECL smart-meter bills and recharge
// outages, iron in DWS tap water, dead traffic signals, footpath encroachment,
// dengue around stagnant drains, leaking school roofs. {w} is the locality.
const COMPLAINTS: Record<string, [title: string, body: string][]> = {
  cat_san_garbage: [
    ["Garbage not lifted near {w} market for four days", "AMC's collection vehicle has not come to the lane behind {w} market since Monday. Bags are piled against the drain wall, dogs have torn them open, and the smell reaches the houses. Please restore daily door-to-door pickup."],
    ["Household waste dumped on the roadside at {w}", "People in {w} have started throwing household waste on the roadside because the nearest bin was removed during the drain work. The heap now blocks half the road and spills into the drain."],
  ],
  cat_san_bin: [
    ["Overflowing community bin at {w} chowmuhani", "The large bin at the {w} chowmuhani has been full for three days and waste is spilling onto the road. Rickshaws and school children have to go around it through traffic."],
  ],
  cat_san_toilet: [
    ["Public toilet near {w} bus stop locked", "The pay-and-use toilet near the {w} bus stop has been locked for a week, and the one beside it has no water or light. Vendors and passengers have nowhere to go."],
  ],
  cat_san_drain: [
    ["Drain choked with plastic and silt at {w}", "The roadside drain along the main road of {w} is choked with plastic and silt. Even light rain now sends dirty water onto the road and into shops. It has not been cleaned since before the monsoon."],
  ],
  cat_san_animal: [
    ["Dead dog lying by the road at {w}", "A dead dog has been lying beside the road at {w} for two days. The smell is unbearable and it is a few metres from a school gate. Please remove it."],
  ],
  cat_wat_nosupply: [
    ["No drinking water in {w} for three days", "Taps in our para of {w} have been dry for three days. DWS staff say a pipeline was damaged during the Smart City drain work, but no one has given a date for repair. Families are buying water jars."],
    ["Water comes for only 20 minutes a day in {w}", "For two weeks the supply in {w} has come for barely 20 minutes early in the morning, at very low force. Houses on higher ground get nothing. Residents are talking about blocking the road if this continues."],
  ],
  cat_wat_contam: [
    ["Yellow, iron-smelling tap water in {w}", "Water from the DWS line in {w} comes out yellow and smells of iron. It leaves a red stain on buckets within hours. Please check the iron removal plant serving our area and test the supply."],
  ],
  cat_wat_leak: [
    ["Pipeline burst after drain digging at {w}", "A DWS pipeline burst when the contractor dug the new drain at {w}. Clean water has been running onto the road for two days while our taps stay dry."],
  ],
  cat_wat_pressure: [
    ["Very low water pressure in {w}", "Supply pressure in {w} is so low that water does not reach the overhead tanks. Some houses now run motors directly on the line, which leaves even less for everyone after them."],
  ],
  cat_wat_illegal: [
    ["Motor fitted directly on the main line at {w}", "A building under construction at {w} has fitted a motor directly on the DWS main line. Houses beyond it get almost no water during supply hours."],
  ],
  cat_ele_outage: [
    ["Prepaid meter recharged but still no power in {w}", "I recharged my prepaid smart meter on the Tripura Power app, but power has not come back for over 24 hours. The 1912 helpline does not connect. Several houses in {w} have the same problem."],
    ["Repeated evening power cuts in {w}", "Power goes off three or four times every evening in {w}, each time for 30 to 40 minutes, with no notice. Students cannot study and the heat is hard on elderly people."],
  ],
  cat_ele_streetlight: [
    ["Street lights off along the {w} main road", "Seven street lights on the main road of {w} have been off for two weeks. The stretch is completely dark after 7 pm and women avoid walking there."],
  ],
  cat_ele_wire: [
    ["Live wire hanging low near {w} pond", "A service wire has snapped and hangs at head height near the pond in {w}. It sparks when it rains. Please disconnect it before someone is hurt."],
  ],
  cat_ele_voltage: [
    ["Low voltage damaging appliances in {w}", "In the evening the voltage in {w} drops so low that fans barely turn, and one refrigerator has already burnt out. The transformer on our road looks overloaded."],
  ],
  cat_ele_billing: [
    ["Smart meter bill far above actual use in {w}", "Since the smart meter was fitted, the bill for my two-room house in {w} has jumped to Rs 14,800. It shows a contracted load I never applied for. Please test the meter and correct the bill."],
  ],
  cat_road_pothole: [
    ["Deep potholes on the {w} road", "The road through {w} has deep potholes that fill with rain water and cannot be seen. Two scooter riders fell last week. It was dug up for pipe work and never properly restored."],
  ],
  cat_road_footpath: [
    ["Broken drain slabs on the {w} footpath", "Several drain cover slabs on the footpath at {w} are broken or missing. People now walk on the road beside fast traffic, and a child's leg went into a gap last week."],
  ],
  cat_road_waterlog: [
    ["Knee-deep water at {w} after a short rain", "Half an hour of rain leaves knee-deep water at {w}. It enters shops and houses and takes a day to drain away. The new drain here sits higher than the road and does not take the water."],
    ["Shops flooded again at {w}", "Traders at {w} had water inside their shops twice this week. Stock is damaged and customers stay away. The drain outlet is blocked with soil left by the contractor."],
  ],
  cat_road_signage: [
    ["Signboards missing at the {w} junction", "The signboards at the {w} junction were taken down during road widening and never put back. Drivers from outside keep turning into the narrow lanes by mistake."],
  ],
  cat_road_encroach: [
    ["Footpath at {w} taken over by stalls", "The footpath at {w} is fully occupied by stalls and parked two-wheelers, so people walk in the middle of the road. The stalls came back a few days after the last eviction drive."],
  ],
  cat_hea_mosquito: [
    ["Stagnant drain breeding mosquitoes in {w}", "Water has stood in the half-built drain at {w} for weeks and mosquitoes breed in it. Two people in our lane had dengue this month. Please clear the water and arrange fogging."],
  ],
  cat_hea_food: [
    ["Spoilt fish on sale at {w} market", "Fish that has clearly gone bad is being sold at the {w} market, and some of it has a chemical smell. Please send the food safety team to check the stalls."],
  ],
  cat_hea_strays: [
    ["Stray dogs chasing children in {w}", "A pack of stray dogs near the school gate in {w} chases children and two-wheelers. A child was bitten last week. Please arrange sterilisation and anti-rabies vaccination."],
  ],
  cat_hea_hospital: [
    ["Dirty toilets at the {w} health centre", "The toilets at the urban health centre in {w} have no water and are not cleaned. Patients waiting for hours have no choice but to use them."],
  ],
  cat_hea_epidemic: [
    ["Fever cases rising in one lane of {w}", "Eight people in one lane of {w} have had high fever in the last ten days, and some have tested positive for dengue. There has been no fogging or health camp yet."],
  ],
  cat_edu_infra: [
    ["School roof leaks and there is no boundary wall", "The tin roof of the primary school in {w} leaks in every rain, so classes move to the veranda. The school has no boundary wall either, and cattle and outsiders walk in."],
  ],
  cat_edu_meal: [
    ["Midday meal without vegetables at {w} school", "For two weeks the children at the school in {w} have been given only rice and thin dal for the midday meal. Parents were told supplies have not arrived."],
  ],
  cat_edu_teacher: [
    ["One teacher for five classes at {w} school", "At the primary school in {w}, a single teacher runs all five classes on most days and children are sent home early."],
  ],
  cat_edu_unsafe: [
    ["Cracks in the old school building at {w}", "Wide cracks have opened in the walls of the old school building in {w} and plaster falls from the ceiling. Classes are still held inside."],
  ],
  cat_edu_admission: [
    ["Class 6 admission refused at {w} school", "My daughter was refused admission to class 6 at the government school in {w} for lack of seats, although the notice board lists vacancies. No written reason was given."],
  ],
  cat_pol_noise: [
    ["Loudspeakers past midnight in {w}", "Loudspeakers are played at full volume past midnight almost every weekend in {w}. Elderly residents and students cannot sleep."],
  ],
  cat_pol_parking: [
    ["Illegal parking chokes the road at {w}", "Cars and autos park on both sides of the road at {w}, leaving room for one vehicle. Ambulances get stuck. The traffic police parking drives have not reached this stretch."],
  ],
  cat_pol_nuisance: [
    ["Drinking in the open near {w} playground", "Groups gather to drink near the {w} playground every evening and harass passers-by. Families have stopped using the ground."],
  ],
  cat_pol_traffic: [
    ["Traffic signal at {w} dead for weeks", "The traffic signal at the {w} crossing has not worked for weeks. Autos and cars push in from every side and there is a jam every morning and evening."],
    ["Unregistered autos crowding the {w} crossing", "Dozens of autos without permits stand at the {w} crossing and stop anywhere to pick up passengers, blocking the road for buses and ambulances."],
  ],
  cat_pol_safety: [
    ["Chain snatching on the dark stretch at {w}", "There have been two chain-snatching incidents this month on the stretch near {w}. The road is dark and there is no patrol after 9 pm."],
  ],
  cat_pw_building: [
    ["Old building leaning over the lane at {w}", "An old two-storey building at {w} is visibly leaning, and pieces fall onto the lane below. Please inspect it before it collapses."],
  ],
  cat_pw_drainage: [
    ["Smart City drain left half-built at {w}", "Drain work at {w} stopped weeks ago. The trench is open, soil is heaped on the road, and shops have lost their access. No one from the contractor comes to the site."],
    ["Open drain trench with no barricade at {w}", "The new drain trench at {w} has been open for a month with no barricade or light. An elderly man fell in last week. Please cover or fence it."],
  ],
  cat_pw_park: [
    ["Children's park at {w} overgrown and broken", "The swings in the {w} children's park are broken, the lights do not work, and the grass is waist-high. The park is unsafe after dark."],
  ],
  cat_pw_property: [
    ["Bus shelter at {w} without a roof", "The bus shelter at {w} has lost its roof sheets and the seating is broken. Passengers wait in the sun and rain."],
  ],
  cat_pw_bridge: [
    ["Rain water pooling on the city flyover", "Residents of {w} who use the flyover report that rain water stands on the deck because the outlets are blocked. Two-wheelers skid on it and the surface is breaking up."],
    ["Broken footbridge over the cherra at {w}", "The small footbridge over the cherra at {w} has broken railings and a loose slab. Children cross it every day to reach school."],
  ],
};

const CLOSURE_GOOD = [
  "Team visited the site on schedule, cleared the blockage completely, and verified with the complainant. Before/after photos attached; area inspected again after 24 hours and confirmed clear.",
  "Repair crew dispatched within SLA. Replaced the damaged unit, tested it, and obtained sign-off from the para committee. Follow-up inspection scheduled in two weeks.",
  "Root cause was a clogged outlet left by the drain contractor; it has been desilted and flow restored and measured. The contractor has been told to cover the open section. Ward engineer has certified completion.",
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
  const ankita = await db.user.create({
    data: {
      role: "CITIZEN",
      name: "Ankita Saha",
      phone: "+919999900001",
      wardCode: "W32", // Ramnagar
      reputation: 540,
      streakDays: 9,
      showOnLeaderboard: true,
      lastVisitAt: new Date(),
    },
  });

  const bikash = await db.user.create({
    data: {
      role: "OFFICER",
      name: "Bikash Debbarma",
      email: "bikash@amc.tripura.gov.in",
      passwordHash: bcrypt.hashSync(OFFICER_PWD, 12),
      departmentCode: "SANITATION",
      wardCode: "W25", // Durga Chowmuhani
      isDeptLead: true,
    },
  });

  await db.user.create({
    data: {
      role: "ADMIN",
      name: "Sharmila Chakraborty",
      email: "sharmila@amc.tripura.gov.in",
      passwordHash: bcrypt.hashSync(ADMIN_PWD, 12),
    },
  });

  // ---------- empty demo trio (live multi-user flow) ----------
  // Fresh, interlinked accounts in ward W25. Deliberately NOT added to the
  // citizens/officers pools below, so no seeded case references them — they
  // start pristine and the demo is driven live. Rohan & Tania file/co-sign;
  // Sanjib (SANITATION) receives their complaints in his inbox.
  await db.user.create({
    data: {
      role: "CITIZEN",
      name: "Rohan Deb",
      phone: "+919999900010",
      wardCode: "W25",
      reputation: 0,
      streakDays: 0,
      showOnLeaderboard: true,
      lastVisitAt: new Date(),
    },
  });
  await db.user.create({
    data: {
      role: "CITIZEN",
      name: "Tania Reang",
      phone: "+919999900011",
      wardCode: "W25",
      reputation: 0,
      streakDays: 0,
      showOnLeaderboard: true,
      lastVisitAt: new Date(),
    },
  });
  await db.user.create({
    data: {
      role: "OFFICER",
      name: "Sanjib Sinha",
      email: "sanjib@amc.tripura.gov.in",
      passwordHash: bcrypt.hashSync(OFFICER_PWD, 12),
      departmentCode: "SANITATION",
      wardCode: "W25",
      isDeptLead: false,
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
    { name: "Ratan Deb", email: "ratan@amc.tripura.gov.in", dept: "WATER", ward: "W32", lead: true },
    { name: "Sukanta Roy", email: "sukanta@amc.tripura.gov.in", dept: "ELECTRICITY", ward: "W16", lead: true },
    { name: "Kajal Sarkar", email: "kajal@amc.tripura.gov.in", dept: "ROADS", ward: "W36", lead: true },
    { name: "Mamata Jamatia", email: "mamata@amc.tripura.gov.in", dept: "HEALTH", ward: "W30", lead: true },
    { name: "Sutapa Acharjee", email: "sutapa@amc.tripura.gov.in", dept: "EDUCATION", ward: "W08", lead: true },
    { name: "Partha Debnath", email: "partha@amc.tripura.gov.in", dept: "POLICE", ward: "W37", lead: true },
    { name: "Nasrin Akhtar", email: "nasrin@amc.tripura.gov.in", dept: "PUBLIC_WORKS", ward: "W48", lead: true },
    { name: "Gautam Paul", email: "gautam@amc.tripura.gov.in", dept: "SANITATION", ward: "W10", lead: false },
    { name: "Swapna Dey", email: "swapna@amc.tripura.gov.in", dept: "ROADS", ward: "W22", lead: false },
  ];

  const officers: SeededUser[] = [
    { id: bikash.id, role: "OFFICER", departmentCode: "SANITATION" },
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
    "Sujit Saha", "Mousumi Debbarma", "Pranab Bhowmik", "Rina Jamatia", "Abhijit Das",
    "Sompa Chakraborty", "Dipankar Reang", "Papiya Nath", "Rakesh Tripura", "Soma Bhattacharjee",
    "Anjan Chakma", "Tumpa Paul", "Joydeep Sinha", "Nandita Halam", "Sabir Hossain",
    "Moumita Banik", "Biswajit Majumder", "Laxmi Noatia", "Arindam Datta", "Rubina Begum",
  ];
  const citizens: string[] = [ankita.id];
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

  // ---------- 420 cases ----------
  // 51 wards need more volume than the 24-ward seed to leave every ward with
  // a readable history (~8 cases each).
  const STATUS_PLAN: string[] = [
    ...Array(84).fill("OPEN"),
    ...Array(52).fill("ACKNOWLEDGED"),
    ...Array(74).fill("IN_PROGRESS"),
    ...Array(32).fill("AWAITING_INFO"),
    ...Array(94).fill("RESOLVED"),
    ...Array(32).fill("ESCALATED"),
    ...Array(52).fill("CLOSED"),
  ];
  // shuffle
  for (let i = STATUS_PLAN.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [STATUS_PLAN[i], STATUS_PLAN[j]] = [STATUS_PLAN[j], STATUS_PLAN[i]];
  }

  const now = new Date();
  const SEVERITIES = ["LOW", "MEDIUM", "HIGH"];
  let seq = 100;

  const caseWrites: Prisma.CaseCreateArgs[] = [];
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

    const [titleT, bodyT] = pick(COMPLAINTS[category.id]);
    const title = titleT.replaceAll("{w}", ward.name).slice(0, 80);
    const body = bodyT.replaceAll("{w}", ward.name);

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
        message: "Please share the nearest landmark and a photo of the spot.",
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

    caseWrites.push({
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

  // Retried per case, not per batch: a dropped connection can leave part of a
  // batch written, and re-creating one is a no-op on its unique case number.
  const createCase = (args: Prisma.CaseCreateArgs) =>
    withRetry(args.data.number, async () => {
      try {
        await db.case.create(args);
      } catch (e) {
        if ((e as { code?: string }).code !== "P2002") throw e;
      }
    });
  for (let i = 0; i < caseWrites.length; i += CHUNK) {
    await Promise.all(caseWrites.slice(i, i + CHUNK).map(createCase));
  }
  console.log(`  ${STATUS_PLAN.length} cases with timelines, upvotes & cosigns`);

  // ---------- a few badge awards for the demo citizen ----------
  await db.userBadge.createMany({
    data: [
      { userId: ankita.id, badgeId: "first-voice" },
      { userId: ankita.id, badgeId: "verified-resolver" },
      { userId: ankita.id, badgeId: "neighbour" },
      { userId: ankita.id, badgeId: "streak-starter" },
    ],
  });

  // ---------- a starter notification for Ankita ----------
  await db.notification.create({
    data: {
      userId: ankita.id,
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
