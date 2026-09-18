// Static reference data for Samadhan (Agartala, Tripura single-city seed).
// Consumed by prisma/seed.ts and at runtime (ward picker, category lists, classifier).
//
// Agartala Municipal Corporation has 51 wards run from four zonal offices
// (North, East, South, Central). Localities and zones are real; the pairing of
// a locality with a ward number is illustrative — AMC publishes no
// machine-readable ward-to-locality list. Coordinates are approximate.
//
// Ward codes follow the strict §8.2 Zod format /^[A-Z]{1,3}\d{0,2}$/: "W01"
// to "W51". Show them to people through wardLabel().

export interface WardSeed {
  code: string;
  name: string;
  zone: string;
  centerLat: number;
  centerLng: number;
}

export interface DepartmentSeed {
  code: string;
  name: string;
}

export interface CategorySeed {
  id: string;
  name: string;
  slaDays: number;
  departmentCode: string;
}

export interface BadgeSeed {
  id: string;
  name: string;
  description: string;
  iconKey: string;
}

// The 51 AMC wards, numbered zone by zone.
export const WARDS: WardSeed[] = [
  // North Zone
  { code: "W01", name: "Barjala", zone: "North Zone", centerLat: 23.8660, centerLng: 91.2690 },
  { code: "W02", name: "Chandinamura", zone: "North Zone", centerLat: 23.8730, centerLng: 91.2760 },
  { code: "W03", name: "Lichubagan", zone: "North Zone", centerLat: 23.8700, centerLng: 91.2850 },
  { code: "W04", name: "Nandannagar", zone: "North Zone", centerLat: 23.8790, centerLng: 91.2960 },
  { code: "W05", name: "Chanmari", zone: "North Zone", centerLat: 23.8620, centerLng: 91.2930 },
  { code: "W06", name: "Indranagar", zone: "North Zone", centerLat: 23.8570, centerLng: 91.3040 },
  { code: "W07", name: "Abhoynagar", zone: "North Zone", centerLat: 23.8500, centerLng: 91.2990 },
  { code: "W08", name: "Kunjaban", zone: "North Zone", centerLat: 23.8530, centerLng: 91.2880 },
  { code: "W09", name: "Gurkhabasti", zone: "North Zone", centerLat: 23.8470, centerLng: 91.2860 },
  { code: "W10", name: "Radhanagar", zone: "North Zone", centerLat: 23.8490, centerLng: 91.2790 },
  { code: "W11", name: "Bhati Abhoynagar", zone: "North Zone", centerLat: 23.8430, centerLng: 91.3010 },
  { code: "W12", name: "Jaynagar", zone: "North Zone", centerLat: 23.8420, centerLng: 91.2790 },
  { code: "W13", name: "Paschim Jaynagar", zone: "North Zone", centerLat: 23.8430, centerLng: 91.2730 },
  // East Zone
  { code: "W14", name: "Shibnagar", zone: "East Zone", centerLat: 23.8420, centerLng: 91.2920 },
  { code: "W15", name: "Paschim Shibnagar", zone: "East Zone", centerLat: 23.8400, centerLng: 91.2880 },
  { code: "W16", name: "Dhaleswar", zone: "East Zone", centerLat: 23.8370, centerLng: 91.2990 },
  { code: "W17", name: "Ashram Chowmuhani", zone: "East Zone", centerLat: 23.8330, centerLng: 91.2990 },
  { code: "W18", name: "Kashipur", zone: "East Zone", centerLat: 23.8330, centerLng: 91.3150 },
  { code: "W19", name: "Khayerpur", zone: "East Zone", centerLat: 23.8360, centerLng: 91.3280 },
  { code: "W20", name: "Chandrapur", zone: "East Zone", centerLat: 23.8420, centerLng: 91.3180 },
  { code: "W21", name: "Uttar Jogendranagar", zone: "East Zone", centerLat: 23.8290, centerLng: 91.3060 },
  { code: "W22", name: "Jogendranagar", zone: "East Zone", centerLat: 23.8240, centerLng: 91.3040 },
  { code: "W23", name: "Purba Jogendranagar", zone: "East Zone", centerLat: 23.8220, centerLng: 91.3130 },
  { code: "W24", name: "Aralia", zone: "East Zone", centerLat: 23.8160, centerLng: 91.3170 },
  { code: "W25", name: "Durga Chowmuhani", zone: "East Zone", centerLat: 23.8330, centerLng: 91.2930 },
  // Central Zone
  { code: "W26", name: "Palace Compound", zone: "Central Zone", centerLat: 23.8364, centerLng: 91.2830 },
  { code: "W27", name: "Banamalipur", zone: "Central Zone", centerLat: 23.8300, centerLng: 91.2870 },
  { code: "W28", name: "Dimsagar", zone: "Central Zone", centerLat: 23.8310, centerLng: 91.2820 },
  { code: "W29", name: "Town Pratapgarh", zone: "Central Zone", centerLat: 23.8230, centerLng: 91.2720 },
  { code: "W30", name: "Krishnanagar", zone: "Central Zone", centerLat: 23.8390, centerLng: 91.2780 },
  { code: "W31", name: "Paschim Krishnanagar", zone: "Central Zone", centerLat: 23.8390, centerLng: 91.2730 },
  { code: "W32", name: "Ramnagar", zone: "Central Zone", centerLat: 23.8350, centerLng: 91.2690 },
  { code: "W33", name: "Rajnagar", zone: "Central Zone", centerLat: 23.8310, centerLng: 91.2660 },
  { code: "W34", name: "Ranjitnagar", zone: "Central Zone", centerLat: 23.8270, centerLng: 91.2650 },
  { code: "W35", name: "Melarmath", zone: "Central Zone", centerLat: 23.8340, centerLng: 91.2850 },
  { code: "W36", name: "Battala", zone: "Central Zone", centerLat: 23.8285, centerLng: 91.2785 },
  { code: "W37", name: "Maharajganj Bazar", zone: "Central Zone", centerLat: 23.8300, centerLng: 91.2800 },
  { code: "W38", name: "Motor Stand", zone: "Central Zone", centerLat: 23.8260, centerLng: 91.2830 },
  { code: "W39", name: "Shantipara", zone: "Central Zone", centerLat: 23.8200, centerLng: 91.2770 },
  // South Zone
  { code: "W40", name: "Nagerjala", zone: "South Zone", centerLat: 23.8220, centerLng: 91.2850 },
  { code: "W41", name: "Bhattapukur", zone: "South Zone", centerLat: 23.8170, centerLng: 91.2820 },
  { code: "W42", name: "Dashamighat", zone: "South Zone", centerLat: 23.8190, centerLng: 91.2950 },
  { code: "W43", name: "Bardowali", zone: "South Zone", centerLat: 23.8150, centerLng: 91.2680 },
  { code: "W44", name: "Paschim Pratapgarh", zone: "South Zone", centerLat: 23.8190, centerLng: 91.2680 },
  { code: "W45", name: "Purba Pratapgarh", zone: "South Zone", centerLat: 23.8180, centerLng: 91.2740 },
  { code: "W46", name: "Arundhutinagar", zone: "South Zone", centerLat: 23.8070, centerLng: 91.2760 },
  { code: "W47", name: "Rajlaxminagar", zone: "South Zone", centerLat: 23.8030, centerLng: 91.2700 },
  { code: "W48", name: "Badharghat", zone: "South Zone", centerLat: 23.8000, centerLng: 91.2820 },
  { code: "W49", name: "Dakshin Badharghat", zone: "South Zone", centerLat: 23.7930, centerLng: 91.2830 },
  { code: "W50", name: "Siddhi Ashram", zone: "South Zone", centerLat: 23.7980, centerLng: 91.2710 },
  { code: "W51", name: "Madhya Pratapgarh", zone: "South Zone", centerLat: 23.8130, centerLng: 91.2720 },
];

// 8 departments (§5.4.2).
export const DEPARTMENTS: DepartmentSeed[] = [
  { code: "SANITATION", name: "Sanitation" },
  { code: "WATER", name: "Water" },
  { code: "ELECTRICITY", name: "Electricity" },
  { code: "ROADS", name: "Roads" },
  { code: "HEALTH", name: "Health" },
  { code: "EDUCATION", name: "Education" },
  { code: "POLICE", name: "Police" },
  { code: "PUBLIC_WORKS", name: "Public Works" },
];

// ~40 categories with SLA days (§5.7.1). Explicit slug ids keep them stable for AI + seed.
export const CATEGORIES: CategorySeed[] = [
  // Sanitation
  { id: "cat_san_garbage", name: "Garbage collection", slaDays: 3, departmentCode: "SANITATION" },
  { id: "cat_san_bin", name: "Overflowing bin", slaDays: 2, departmentCode: "SANITATION" },
  { id: "cat_san_toilet", name: "Public toilet", slaDays: 4, departmentCode: "SANITATION" },
  { id: "cat_san_drain", name: "Drain cleaning", slaDays: 4, departmentCode: "SANITATION" },
  { id: "cat_san_animal", name: "Dead animal removal", slaDays: 1, departmentCode: "SANITATION" },
  // Water
  { id: "cat_wat_nosupply", name: "No water supply", slaDays: 2, departmentCode: "WATER" },
  { id: "cat_wat_contam", name: "Contaminated water", slaDays: 1, departmentCode: "WATER" },
  { id: "cat_wat_leak", name: "Pipeline leakage", slaDays: 3, departmentCode: "WATER" },
  { id: "cat_wat_pressure", name: "Low pressure", slaDays: 4, departmentCode: "WATER" },
  { id: "cat_wat_illegal", name: "Illegal connection", slaDays: 7, departmentCode: "WATER" },
  // Electricity
  { id: "cat_ele_outage", name: "Power outage", slaDays: 1, departmentCode: "ELECTRICITY" },
  { id: "cat_ele_streetlight", name: "Street light fault", slaDays: 3, departmentCode: "ELECTRICITY" },
  { id: "cat_ele_wire", name: "Exposed wire", slaDays: 1, departmentCode: "ELECTRICITY" },
  { id: "cat_ele_voltage", name: "Voltage fluctuation", slaDays: 3, departmentCode: "ELECTRICITY" },
  { id: "cat_ele_billing", name: "Billing dispute", slaDays: 10, departmentCode: "ELECTRICITY" },
  // Roads
  { id: "cat_road_pothole", name: "Pothole", slaDays: 5, departmentCode: "ROADS" },
  { id: "cat_road_footpath", name: "Broken footpath", slaDays: 7, departmentCode: "ROADS" },
  { id: "cat_road_waterlog", name: "Waterlogging", slaDays: 3, departmentCode: "ROADS" },
  { id: "cat_road_signage", name: "Missing signage", slaDays: 10, departmentCode: "ROADS" },
  { id: "cat_road_encroach", name: "Encroachment", slaDays: 14, departmentCode: "ROADS" },
  // Health
  { id: "cat_hea_mosquito", name: "Mosquito breeding", slaDays: 3, departmentCode: "HEALTH" },
  { id: "cat_hea_food", name: "Food adulteration", slaDays: 5, departmentCode: "HEALTH" },
  { id: "cat_hea_strays", name: "Stray dogs", slaDays: 7, departmentCode: "HEALTH" },
  { id: "cat_hea_hospital", name: "Hospital sanitation", slaDays: 4, departmentCode: "HEALTH" },
  { id: "cat_hea_epidemic", name: "Epidemic risk", slaDays: 1, departmentCode: "HEALTH" },
  // Education
  { id: "cat_edu_infra", name: "School infrastructure", slaDays: 14, departmentCode: "EDUCATION" },
  { id: "cat_edu_meal", name: "Midday meal", slaDays: 7, departmentCode: "EDUCATION" },
  { id: "cat_edu_teacher", name: "Teacher absence", slaDays: 10, departmentCode: "EDUCATION" },
  { id: "cat_edu_unsafe", name: "Unsafe building", slaDays: 3, departmentCode: "EDUCATION" },
  { id: "cat_edu_admission", name: "Admission grievance", slaDays: 14, departmentCode: "EDUCATION" },
  // Police
  { id: "cat_pol_noise", name: "Noise complaint", slaDays: 2, departmentCode: "POLICE" },
  { id: "cat_pol_parking", name: "Illegal parking", slaDays: 3, departmentCode: "POLICE" },
  { id: "cat_pol_nuisance", name: "Public nuisance", slaDays: 3, departmentCode: "POLICE" },
  { id: "cat_pol_traffic", name: "Traffic violation", slaDays: 5, departmentCode: "POLICE" },
  { id: "cat_pol_safety", name: "Safety concern", slaDays: 1, departmentCode: "POLICE" },
  // Public Works
  { id: "cat_pw_building", name: "Building safety", slaDays: 3, departmentCode: "PUBLIC_WORKS" },
  { id: "cat_pw_drainage", name: "Drainage construction", slaDays: 14, departmentCode: "PUBLIC_WORKS" },
  { id: "cat_pw_park", name: "Park maintenance", slaDays: 10, departmentCode: "PUBLIC_WORKS" },
  { id: "cat_pw_property", name: "Public property damage", slaDays: 7, departmentCode: "PUBLIC_WORKS" },
  { id: "cat_pw_bridge", name: "Bridge / flyover", slaDays: 14, departmentCode: "PUBLIC_WORKS" },
];

// 9 badges (§5.3.2). iconKey maps to a lucide-react icon name.
export const BADGES: BadgeSeed[] = [
  { id: "first-voice", name: "First Voice", description: "Filed your first complaint", iconKey: "mic" },
  { id: "verified-resolver", name: "Verified Resolver", description: "Had your first complaint resolved", iconKey: "badge-check" },
  { id: "neighbour", name: "Neighbour", description: "Co-signed 5 complaints", iconKey: "handshake" },
  { id: "watchdog", name: "Watchdog", description: "Gave 10 helpful upvotes", iconKey: "eye" },
  { id: "streak-starter", name: "Streak Starter", description: "Reached a 7-day check-in streak", iconKey: "calendar" },
  { id: "streak-keeper", name: "Streak Keeper", description: "Reached a 30-day check-in streak", iconKey: "calendar-days" },
  { id: "quality-reviewer", name: "Quality Reviewer", description: "Correctly flagged 5 boilerplate disposals", iconKey: "search" },
  { id: "district-voice", name: "District Voice", description: "Filed in 3 different categories", iconKey: "git-fork" },
  { id: "civic-patron", name: "Civic Patron", description: "Reached the Civic Patron tier", iconKey: "crown" },
];

/** "W07" → "7": the number people say. Codes outside the W-series pass through. */
export const wardLabel = (code: string): string =>
  /^W\d+$/.test(code) ? String(Number(code.slice(1))) : code;

// Lookup helpers.
export const categoriesByDept = (deptCode: string): CategorySeed[] =>
  CATEGORIES.filter((c) => c.departmentCode === deptCode);

export const slaDaysForCategory = (categoryId: string): number =>
  CATEGORIES.find((c) => c.id === categoryId)?.slaDays ?? 7;
