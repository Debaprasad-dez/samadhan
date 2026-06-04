// Static reference data for Samadhan (Mumbai single-city seed).
// Consumed by prisma/seed.ts and at runtime (ward picker, category lists, classifier).
//
// Ward codes follow the strict §8.2 Zod format /^[A-Z]{1,3}\d{0,2}$/ (e.g. "KE"),
// rather than the illustrative "K-EAST" from §8.4.

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

// 24 MCGM wards (§13 Phase 0.7).
export const WARDS: WardSeed[] = [
  { code: "A", name: "Colaba & Fort", zone: "City", centerLat: 18.9067, centerLng: 72.8147 },
  { code: "B", name: "Sandhurst Road", zone: "City", centerLat: 18.9543, centerLng: 72.8355 },
  { code: "C", name: "Marine Lines", zone: "City", centerLat: 18.9501, centerLng: 72.8237 },
  { code: "D", name: "Grant Road", zone: "City", centerLat: 18.9627, centerLng: 72.8089 },
  { code: "E", name: "Byculla", zone: "City", centerLat: 18.9783, centerLng: 72.8331 },
  { code: "FS", name: "Parel", zone: "City", centerLat: 18.9981, centerLng: 72.8403 },
  { code: "FN", name: "Matunga", zone: "City", centerLat: 19.0276, centerLng: 72.8562 },
  { code: "GS", name: "Worli", zone: "City", centerLat: 19.0096, centerLng: 72.8175 },
  { code: "GN", name: "Dadar", zone: "City", centerLat: 19.0176, centerLng: 72.8479 },
  { code: "HE", name: "Bandra East", zone: "Western Suburbs", centerLat: 19.0607, centerLng: 72.8466 },
  { code: "HW", name: "Bandra West", zone: "Western Suburbs", centerLat: 19.0596, centerLng: 72.8295 },
  { code: "KE", name: "Andheri East", zone: "Western Suburbs", centerLat: 19.1136, centerLng: 72.8697 },
  { code: "KW", name: "Andheri West", zone: "Western Suburbs", centerLat: 19.1294, centerLng: 72.8273 },
  { code: "L", name: "Kurla", zone: "Eastern Suburbs", centerLat: 19.0726, centerLng: 72.8845 },
  { code: "ME", name: "Govandi", zone: "Eastern Suburbs", centerLat: 19.0509, centerLng: 72.9209 },
  { code: "MW", name: "Chembur", zone: "Eastern Suburbs", centerLat: 19.0625, centerLng: 72.8997 },
  { code: "N", name: "Ghatkopar", zone: "Eastern Suburbs", centerLat: 19.0863, centerLng: 72.9081 },
  { code: "PS", name: "Goregaon", zone: "Western Suburbs", centerLat: 19.1644, centerLng: 72.8493 },
  { code: "PN", name: "Malad", zone: "Western Suburbs", centerLat: 19.1872, centerLng: 72.8484 },
  { code: "RS", name: "Kandivali", zone: "Western Suburbs", centerLat: 19.2095, centerLng: 72.8526 },
  { code: "RC", name: "Borivali", zone: "Western Suburbs", centerLat: 19.2307, centerLng: 72.8567 },
  { code: "RN", name: "Dahisar", zone: "Western Suburbs", centerLat: 19.2496, centerLng: 72.8606 },
  { code: "S", name: "Bhandup", zone: "Eastern Suburbs", centerLat: 19.1426, centerLng: 72.9367 },
  { code: "T", name: "Mulund", zone: "Eastern Suburbs", centerLat: 19.1722, centerLng: 72.9568 },
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

// Lookup helpers.
export const categoriesByDept = (deptCode: string): CategorySeed[] =>
  CATEGORIES.filter((c) => c.departmentCode === deptCode);

export const slaDaysForCategory = (categoryId: string): number =>
  CATEGORIES.find((c) => c.id === categoryId)?.slaDays ?? 7;
