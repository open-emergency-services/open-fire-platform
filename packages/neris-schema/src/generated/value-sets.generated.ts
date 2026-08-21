// AUTO-GENERATED from the NERIS data framework. DO NOT EDIT BY HAND.
// Re-run: NERIS_FRAMEWORK_PATH=... node scripts/generate.mjs
// Source: github.com/ulfsri/neris-framework

/** Value set `type_geo_source.csv` (6 choices). */
export const VS_TYPE_GEO_SOURCE = [
  "API_SUBMISSION",
  "SURVEY_123",
  "NERIS_GEOCODE_AWS",
  "NERIS_GEOCODE_ESRI",
  "NERIS_UI",
  "ARCHIVE"
] as const;
export type TypeGeoSource = typeof VS_TYPE_GEO_SOURCE[number];

/** Value set `type_incident_status.csv` (5 choices). */
export const VS_TYPE_INCIDENT_STATUS = [
  "SUBMITTED",
  "REJECTED",
  "APPROVED",
  "PENDING_APPROVAL",
  "FAILED"
] as const;
export type TypeIncidentStatus = typeof VS_TYPE_INCIDENT_STATUS[number];

/** Value set `type_invalid_reason.csv` (3 choices). */
export const VS_TYPE_INVALID_REASON = [
  "SUPERCEDED",
  "REMOVED",
  "DELETED"
] as const;
export type TypeInvalidReason = typeof VS_TYPE_INVALID_REASON[number];

/** Value set `type_aid.csv` (3 choices). */
export const VS_TYPE_AID = [
  "SUPPORT_AID",
  "IN_LIEU_AID",
  "ACTING_AS_AID"
] as const;
export type TypeAid = typeof VS_TYPE_AID[number];

/** Value set `type_aid_direction.csv` (2 choices). */
export const VS_TYPE_AID_DIRECTION = [
  "GIVEN",
  "RECEIVED"
] as const;
export type TypeAidDirection = typeof VS_TYPE_AID_DIRECTION[number];

/** Value set `type_aid_nonfd.csv` (6 choices). */
export const VS_TYPE_AID_NONFD = [
  "LAW_ENFORCEMENT",
  "SOCIAL_SERVICES",
  "ANIMAL_SERVICES",
  "HOUSING_SERVICES",
  "UTILITIES_PUBLIC_WORKS",
  "REMEDIATION_SERVICES"
] as const;
export type TypeAidNonfd = typeof VS_TYPE_AID_NONFD[number];

/** Value set `type_alarm_failure.csv` (7 choices). */
export const VS_TYPE_ALARM_FAILURE = [
  "EXPIRED",
  "NO_BATTERY",
  "IMPROPER_INSTALLATION",
  "DEVICE_MALFUNCTION",
  "TAMPER",
  "OTHER_NON_FUNCTIONAL_CAUSE",
  "UNABLE_TO_DETERMINE"
] as const;
export type TypeAlarmFailure = typeof VS_TYPE_ALARM_FAILURE[number];

/** Value set `type_alarm_fire.csv` (3 choices). */
export const VS_TYPE_ALARM_FIRE = [
  "MANUAL",
  "AUTOMATIC",
  "MANUAL_AND_AUTOMATIC"
] as const;
export type TypeAlarmFire = typeof VS_TYPE_ALARM_FIRE[number];

/** Value set `type_alarm_operation.csv` (5 choices). */
export const VS_TYPE_ALARM_OPERATION = [
  "OPERATED_ALERTED_OCCUPANT",
  "OPERATED_FAILED_TO_ALERT_OCCUPANT",
  "NO_OCCUPANT_TO_NOTIFY",
  "FAILED_TO_OPERATE",
  "INSUFFICIENT_SOURCE"
] as const;
export type TypeAlarmOperation = typeof VS_TYPE_ALARM_OPERATION[number];

/** Value set `type_alarm_other.csv` (4 choices). */
export const VS_TYPE_ALARM_OTHER = [
  "CARBON_MONOXIDE",
  "NATURAL_GAS",
  "HEAT_DETECTOR",
  "OTHER_CHEMICAL_DETECTOR"
] as const;
export type TypeAlarmOther = typeof VS_TYPE_ALARM_OTHER[number];

/** Value set `type_alarm_smoke.csv` (8 choices). */
export const VS_TYPE_ALARM_SMOKE = [
  "LONG_LIFE_BATTERY_POWERED",
  "REPLACEABLE_BATTERY_POWERED",
  "HARDWIRED",
  "INTERCONNECTED",
  "HARD_OF_HEARING_WITH_STROBE",
  "BED_SHAKER",
  "COMBINATION",
  "UNKNOWN"
] as const;
export type TypeAlarmSmoke = typeof VS_TYPE_ALARM_SMOKE[number];

/** Value set `type_casualty.csv` (3 choices). */
export const VS_TYPE_CASUALTY = [
  "UNINJURED",
  "INJURED_NONFATAL",
  "INJURED_FATAL"
] as const;
export type TypeCasualty = typeof VS_TYPE_CASUALTY[number];

/** Value set `type_casualty_action.csv` (13 choices). */
export const VS_TYPE_CASUALTY_ACTION = [
  "SEARCH_RESCUE",
  "CARRYING_SETTINGUP_EQUIPMENT",
  "ADVANCING_OPERATING_HOSELINE",
  "VEHICLE_EXTRICATION",
  "VENTILATION",
  "FORCIBLE_ENTRY",
  "PUMP_OPERATIONS",
  "EMS_PATIENT_CARE",
  "DURING_INCIDENT_RESPONSE",
  "SCENE_SAFETY_DIRECTING_TRAFFIC",
  "STANDBY",
  "INCIDENT_COMMAND",
  "OTHER"
] as const;
export type TypeCasualtyAction = typeof VS_TYPE_CASUALTY_ACTION[number];

/** Value set `type_casualty_cause.csv` (9 choices). */
export const VS_TYPE_CASUALTY_CAUSE = [
  "CAUGHT_TRAPPED_BY_FIRE_EXPLOSION",
  "FALL_JUMP",
  "STRESS_OVEREXERTION",
  "COLLAPSE",
  "CAUGHT_TRAPPED_BY_OBJECT",
  "STRUCK_CONTACT_WITH_OBJECT",
  "EXPOSURE",
  "VEHICLE_COLLISION",
  "OTHER"
] as const;
export type TypeCasualtyCause = typeof VS_TYPE_CASUALTY_CAUSE[number];

/** Value set `type_casualty_ppe.csv` (13 choices). */
export const VS_TYPE_CASUALTY_PPE = [
  "TURNOUT_COAT",
  "BUNKER_PANTS",
  "PROTECTIVE_HOOD",
  "GLOVES",
  "FACE_SHIELD_GOGGLES",
  "HELMET",
  "SCBA",
  "PASS_DEVICE",
  "RUBBER_KNEE_BOOTS",
  "3_4_BOOTS",
  "BRUSH_GEAR",
  "REFLECTIVE_VEST",
  "OTHER_SPECIAL_EQUIPMENT"
] as const;
export type TypeCasualtyPpe = typeof VS_TYPE_CASUALTY_PPE[number];

/** Value set `type_casualty_timeline.csv` (6 choices). */
export const VS_TYPE_CASUALTY_TIMELINE = [
  "RESPONDING",
  "INITIAL_RESPONSE",
  "CONTINUING_OPERATIONS",
  "EXTENDED_OPERATIONS",
  "AFTER_CONCLUSION_OF_INCIDENT",
  "UNKNOWN"
] as const;
export type TypeCasualtyTimeline = typeof VS_TYPE_CASUALTY_TIMELINE[number];

/** Value set `type_dept.csv` (3 choices). */
export const VS_TYPE_DEPT = [
  "CAREER",
  "VOLUNTEER",
  "COMBINATION"
] as const;
export type TypeDept = typeof VS_TYPE_DEPT[number];

/** Value set `type_disp_proto_fire.csv` (4 choices). */
export const VS_TYPE_DISP_PROTO_FIRE = [
  "PROQA",
  "IAED",
  "APCO",
  "OTHER"
] as const;
export type TypeDispProtoFire = typeof VS_TYPE_DISP_PROTO_FIRE[number];

/** Value set `type_disp_proto_med.csv` (4 choices). */
export const VS_TYPE_DISP_PROTO_MED = [
  "PROQA",
  "IAED",
  "APCO",
  "OTHER"
] as const;
export type TypeDispProtoMed = typeof VS_TYPE_DISP_PROTO_MED[number];

/** Value set `type_displace_cause.csv` (7 choices). */
export const VS_TYPE_DISPLACE_CAUSE = [
  "FIRE",
  "SMOKE",
  "WATER",
  "UTILITIES",
  "HAZARDOUS_SITUATION",
  "COLLAPSE",
  "OTHER"
] as const;
export type TypeDisplaceCause = typeof VS_TYPE_DISPLACE_CAUSE[number];

/** Value set `type_duty.csv` (7 choices). */
export const VS_TYPE_DUTY = [
  "RESPONDING_TO_EMERGENCY_INCIDENT",
  "WORKING_AT_SCENE_OF_FIRE_INCIDENT",
  "WORKING_AT_SCENE_OF_NONFIRE_INCIDENT",
  "RETURNING_FROM_EMERGENCY_INCIDENT",
  "TRAINING",
  "AFTER_INCIDENT",
  "OTHER_ON_DUTY_INCIDENT"
] as const;
export type TypeDuty = typeof VS_TYPE_DUTY[number];

/** Value set `type_emerghaz_powergen.csv` (4 choices). */
export const VS_TYPE_EMERGHAZ_POWERGEN = [
  "PHOTOVOLTAICS",
  "WIND_TURBINE",
  "OTHER",
  "NOT_APPLICABLE"
] as const;
export type TypeEmerghazPowergen = typeof VS_TYPE_EMERGHAZ_POWERGEN[number];

/** Value set `type_emerghaz_pv.csv` (5 choices). */
export const VS_TYPE_EMERGHAZ_PV = [
  "PANEL_WATER_HEATING",
  "PANEL_POWER_GENERATION",
  "TILE_POWER_GENERATION",
  "THIN_FILM_POWER_GENERATION",
  "OTHER"
] as const;
export type TypeEmerghazPv = typeof VS_TYPE_EMERGHAZ_PV[number];

/** Value set `type_emerghaz_pv_ign.csv` (2 choices). */
export const VS_TYPE_EMERGHAZ_PV_IGN = [
  "SOURCE",
  "TARGET"
] as const;
export type TypeEmerghazPvIgn = typeof VS_TYPE_EMERGHAZ_PV_IGN[number];

/** Value set `type_emerghaz_suppression.csv` (6 choices). */
export const VS_TYPE_EMERGHAZ_SUPPRESSION = [
  "RUN_COURSE",
  "SUPPRESSION_WATER_ONLY",
  "SUPPRESSION_WATER_ADDITIVE",
  "SUBMERGE_BURY",
  "FIRE_BLANKET",
  "BATTERY_PENETRATION"
] as const;
export type TypeEmerghazSuppression = typeof VS_TYPE_EMERGHAZ_SUPPRESSION[number];

/** Value set `type_entity.csv` (8 choices). */
export const VS_TYPE_ENTITY = [
  "LOCAL",
  "CONTRACT",
  "FEDERAL",
  "STATE",
  "OTHER",
  "PRIVATE",
  "TRANSPORTATION",
  "TRIBAL"
] as const;
export type TypeEntity = typeof VS_TYPE_ENTITY[number];

/** Value set `type_exposure_damage.csv` (4 choices). */
export const VS_TYPE_EXPOSURE_DAMAGE = [
  "NO_DAMAGE",
  "MINOR_DAMAGE",
  "MODERATE_DAMAGE",
  "MAJOR_DAMAGE"
] as const;
export type TypeExposureDamage = typeof VS_TYPE_EXPOSURE_DAMAGE[number];

/** Value set `type_exposure_item.csv` (4 choices). */
export const VS_TYPE_EXPOSURE_ITEM = [
  "STRUCTURE",
  "VEHICLE",
  "OUTDOOR_ENVIRONMENT",
  "OBJECT_OTHER"
] as const;
export type TypeExposureItem = typeof VS_TYPE_EXPOSURE_ITEM[number];

/** Value set `type_exposure_loc.csv` (2 choices). */
export const VS_TYPE_EXPOSURE_LOC = [
  "EXTERNAL_EXPOSURE",
  "INTERNAL_EXPOSURE"
] as const;
export type TypeExposureLoc = typeof VS_TYPE_EXPOSURE_LOC[number];

/** Value set `type_ff_nonff.csv` (2 choices). */
export const VS_TYPE_FF_NONFF = [
  "FF",
  "NONFF"
] as const;
export type TypeFfNonff = typeof VS_TYPE_FF_NONFF[number];

/** Value set `type_fire_bldg_damage.csv` (4 choices). */
export const VS_TYPE_FIRE_BLDG_DAMAGE = [
  "NO_DAMAGE",
  "MINOR_DAMAGE",
  "MODERATE_DAMAGE",
  "MAJOR_DAMAGE"
] as const;
export type TypeFireBldgDamage = typeof VS_TYPE_FIRE_BLDG_DAMAGE[number];

/** Value set `type_fire_cause_in.csv` (13 choices). */
export const VS_TYPE_FIRE_CAUSE_IN = [
  "OPERATING_EQUIPMENT",
  "ELECTRICAL",
  "BATTERY_POWER_STORAGE",
  "HEAT_FROM_ANOTHER_OBJECT",
  "EXPLOSIVES_FIREWORKS",
  "SMOKING_MATERIALS_ILLICIT_DRUGS",
  "OPEN_FLAME",
  "COOKING",
  "CHEMICAL",
  "ACT_OF_NATURE",
  "INCENDIARY",
  "OTHER_HEAT_SOURCE",
  "UNABLE_TO_BE_DETERMINED"
] as const;
export type TypeFireCauseIn = typeof VS_TYPE_FIRE_CAUSE_IN[number];

/** Value set `type_fire_cause_out.csv` (14 choices). */
export const VS_TYPE_FIRE_CAUSE_OUT = [
  "NATURAL",
  "EQUIPMENT_VEHICLE_USE",
  "SMOKING_MATERIALS_ILLICIT_DRUGS",
  "RECREATION_CEREMONY",
  "DEBRIS_OPEN_BURNING",
  "RAILROAD_OPS_MAINTENANCE",
  "FIREARMS_EXPLOSIVES",
  "FIREWORKS",
  "POWER_GEN_TRANS_DIST",
  "STRUCTURE",
  "INCENDIARY",
  "BATTERY_POWER_STORAGE",
  "SPREAD_FROM_CONTROLLED_BURN",
  "UNABLE_TO_BE_DETERMINED"
] as const;
export type TypeFireCauseOut = typeof VS_TYPE_FIRE_CAUSE_OUT[number];

/** Value set `type_fire_condition_arrival.csv` (6 choices). */
export const VS_TYPE_FIRE_CONDITION_ARRIVAL = [
  "NO_SMOKE_FIRE_SHOWING",
  "SMOKE_SHOWING",
  "SMOKE_FIRE_SHOWING",
  "STRUCTURE_INVOLVED",
  "FIRE_SPREAD_BEYOND_STRUCTURE",
  "FIRE_OUT_UPON_ARRIVAL"
] as const;
export type TypeFireConditionArrival = typeof VS_TYPE_FIRE_CONDITION_ARRIVAL[number];

/** Value set `type_fire_invest.csv` (7 choices). */
export const VS_TYPE_FIRE_INVEST = [
  "INVESTIGATED_ON_SCENE_RESOURCE",
  "INVESTIGATED_BY_ARSON_FIRE_INVESTIGATOR",
  "INVESTIGATED_BY_OUTSIDE_AGENCY",
  "INVESTIGATED_BY_STATE_FIRE_MARSHAL",
  "INVESTIGATED_BY_INSURANCE",
  "INVESTIGATED_BY_NONFIRE_LAW_ENFORCEMENT",
  "INVESTIGATED_BY_OTHER"
] as const;
export type TypeFireInvest = typeof VS_TYPE_FIRE_INVEST[number];

/** Value set `type_fire_invest_need.csv` (6 choices). */
export const VS_TYPE_FIRE_INVEST_NEED = [
  "YES",
  "NO",
  "NOT_EVALUATED",
  "NOT_APPLICABLE",
  "NO_CAUSE_OBVIOUS",
  "OTHER"
] as const;
export type TypeFireInvestNeed = typeof VS_TYPE_FIRE_INVEST_NEED[number];

/** Value set `type_full_partial.csv` (3 choices). */
export const VS_TYPE_FULL_PARTIAL = [
  "FULL",
  "PARTIAL",
  "EXTENT_UNKNOWN"
] as const;
export type TypeFullPartial = typeof VS_TYPE_FULL_PARTIAL[number];

/** Value set `type_gender.csv` (6 choices). */
export const VS_TYPE_GENDER = [
  "MALE",
  "FEMALE",
  "TRANSGENDER_MALE_FEMALE_TO_MALE",
  "TRANSGENDER_FEMALE_MALE_TO_FEMALE",
  "OTHER_GENDER_IDENTITY",
  "UNKNOWN"
] as const;
export type TypeGender = typeof VS_TYPE_GENDER[number];

/** Value set `type_hazard_cause.csv` (5 choices). */
export const VS_TYPE_HAZARD_CAUSE = [
  "INTENTIONAL",
  "UNINTENTIONAL",
  "CONTAINER_CONTAINMENT_FAILURE",
  "ACT_OF_NATURE",
  "CAUSE_UNDER_INVESTIGATION"
] as const;
export type TypeHazardCause = typeof VS_TYPE_HAZARD_CAUSE[number];

/** Value set `type_hazard_disposition.csv` (8 choices). */
export const VS_TYPE_HAZARD_DISPOSITION = [
  "COMPLETED_FIRE_SERVICE_ONLY",
  "COMPLETED_WITH_FIRE_SERVICE_PRESENT",
  "RELEASED_TO_LOCAL_AGENCY",
  "RELEASED_TO_COUNTY_AGENCY",
  "RELEASED_TO_STATE_AGENCY",
  "RELEASED_TO_FEDERAL_AGENCY",
  "RELEASED_TO_PRIVATE_AGENCY",
  "RELEASED_TO_PROPERTY_OWNER"
] as const;
export type TypeHazardDisposition = typeof VS_TYPE_HAZARD_DISPOSITION[number];

/** Value set `type_hazard_dot.csv` (9 choices). */
export const VS_TYPE_HAZARD_DOT = [
  "EXPLOSIVES",
  "GASES",
  "FLAMMABLE_LIQUIDS",
  "FLAMMABLE_SOLIDS",
  "OXIDIZERS",
  "POISONS_AND_ETIOLOGIC_MATERIALS",
  "RADIOACTIVE_MATERIALS",
  "CORROSIVES",
  "MISCELLANEOUS_DANGEROUS_SUBSTANCES"
] as const;
export type TypeHazardDot = typeof VS_TYPE_HAZARD_DOT[number];

/** Value set `type_hazard_physical_state.csv` (5 choices). */
export const VS_TYPE_HAZARD_PHYSICAL_STATE = [
  "SOLID",
  "LIQUID",
  "GAS",
  "RADIOACTIVE",
  "UNKNOWN"
] as const;
export type TypeHazardPhysicalState = typeof VS_TYPE_HAZARD_PHYSICAL_STATE[number];

/** Value set `type_hazard_released_into.csv` (3 choices). */
export const VS_TYPE_HAZARD_RELEASED_INTO = [
  "AIR",
  "WATER",
  "GROUND"
] as const;
export type TypeHazardReleasedInto = typeof VS_TYPE_HAZARD_RELEASED_INTO[number];

/** Value set `type_hazard_unit.csv` (33 choices). */
export const VS_TYPE_HAZARD_UNIT = [
  "GAS_CUBIC_FOOT",
  "GAS_CUBIC_INCH",
  "GAS_CUBIC_CENTIMETER",
  "GAS_CUBIC_METER",
  "GAS_POUND",
  "LIQUID_CUBIC_CENTIMETER",
  "LIQUID_CUP",
  "LIQUID_GALLON",
  "LIQUID_GRAM",
  "LIQUID_KILOGRAM",
  "LIQUID_POUND",
  "LIQUID_LITER",
  "LIQUID_MILLIGRAM",
  "LIQUID_MILLILITER",
  "LIQUID_OUNCE",
  "LIQUID_PINT",
  "LIQUID_QUART",
  "LIQUID_TABLESPOON",
  "LIQUID_TEASPOON",
  "SOLID_GRAM",
  "SOLID_KILOGRAM",
  "SOLID_POUND",
  "SOLID_LITER",
  "SOLID_MILLIGRAM",
  "SOLID_OUNCE",
  "SOLID_TABLESPOON",
  "SOLID_TON",
  "SOLID_TEASPOON",
  "RADIOACTIVE_CURIE",
  "RADIOACTIVE_MEGABECQUEREL",
  "RADIOACTIVE_MILLICURIE",
  "RADIOACTIVE_TERABECQUEREL",
  "RADIOACTIVE_MICROCURIE"
] as const;
export type TypeHazardUnit = typeof VS_TYPE_HAZARD_UNIT[number];

/** Value set `type_job_classification.csv` (8 choices). */
export const VS_TYPE_JOB_CLASSIFICATION = [
  "CAREER",
  "PART_TIME",
  "PAID_ON_CALL",
  "INDUSTRIAL",
  "VOLUNTEER",
  "WILDLAND_FULL_TIME",
  "WILDLAND_PART_TIME",
  "WILDLAND_CONTRACT"
] as const;
export type TypeJobClassification = typeof VS_TYPE_JOB_CLASSIFICATION[number];

/** Value set `type_loc_csp_country.csv` (249 choices). */
export const VS_TYPE_LOC_CSP_COUNTRY = [
  "AD",
  "AE",
  "AF",
  "AG",
  "AI",
  "AL",
  "AM",
  "AO",
  "AQ",
  "AR",
  "AS",
  "AT",
  "AU",
  "AW",
  "AX",
  "AZ",
  "BA",
  "BB",
  "BD",
  "BE",
  "BF",
  "BG",
  "BH",
  "BI",
  "BJ",
  "BL",
  "BM",
  "BN",
  "BO",
  "BQ",
  "BR",
  "BS",
  "BT",
  "BV",
  "BW",
  "BY",
  "BZ",
  "CA",
  "CC",
  "CD",
  "CF",
  "CG",
  "CH",
  "CI",
  "CK",
  "CL",
  "CM",
  "CN",
  "CO",
  "CR",
  "CU",
  "CV",
  "CW",
  "CX",
  "CY",
  "CZ",
  "DE",
  "DJ",
  "DK",
  "DM",
  "DO",
  "DZ",
  "EC",
  "EE",
  "EG",
  "EH",
  "ER",
  "ES",
  "ET",
  "FI",
  "FJ",
  "FK",
  "FM",
  "FO",
  "FR",
  "GA",
  "GB",
  "GD",
  "GE",
  "GF",
  "GG",
  "GH",
  "GI",
  "GL",
  "GM",
  "GN",
  "GP",
  "GQ",
  "GR",
  "GS",
  "GT",
  "GU",
  "GW",
  "GY",
  "HK",
  "HM",
  "HN",
  "HR",
  "HT",
  "HU",
  "ID",
  "IE",
  "IL",
  "IM",
  "IN",
  "IO",
  "IQ",
  "IR",
  "IS",
  "IT",
  "JE",
  "JM",
  "JO",
  "JP",
  "KE",
  "KG",
  "KH",
  "KI",
  "KM",
  "KN",
  "KP",
  "KR",
  "KW",
  "KY",
  "KZ",
  "LA",
  "LB",
  "LC",
  "LI",
  "LK",
  "LR",
  "LS",
  "LT",
  "LU",
  "LV",
  "LY",
  "MA",
  "MC",
  "MD",
  "ME",
  "MF",
  "MG",
  "MH",
  "MK",
  "ML",
  "MM",
  "MN",
  "MO",
  "MP",
  "MQ",
  "MR",
  "MS",
  "MT",
  "MU",
  "MV",
  "MW",
  "MX",
  "MY",
  "MZ",
  "NA",
  "NC",
  "NE",
  "NF",
  "NG",
  "NI",
  "NL",
  "NO",
  "NP",
  "NR",
  "NU",
  "NZ",
  "OM",
  "PA",
  "PE",
  "PF",
  "PG",
  "PH",
  "PK",
  "PL",
  "PM",
  "PN",
  "PR",
  "PS",
  "PT",
  "PW",
  "PY",
  "QA",
  "RE",
  "RO",
  "RS",
  "RU",
  "RW",
  "SA",
  "SB",
  "SC",
  "SD",
  "SE",
  "SG",
  "SH",
  "SI",
  "SJ",
  "SK",
  "SL",
  "SM",
  "SN",
  "SO",
  "SR",
  "SS",
  "ST",
  "SV",
  "SX",
  "SY",
  "SZ",
  "TC",
  "TD",
  "TF",
  "TG",
  "TH",
  "TJ",
  "TK",
  "TL",
  "TM",
  "TN",
  "TO",
  "TR",
  "TT",
  "TV",
  "TW",
  "TZ",
  "UA",
  "UG",
  "UM",
  "US",
  "UY",
  "UZ",
  "VA",
  "VC",
  "VE",
  "VG",
  "VI",
  "VN",
  "VU",
  "WF",
  "WS",
  "YE",
  "YT",
  "ZA",
  "ZM",
  "ZW"
] as const;
export type TypeLocCspCountry = typeof VS_TYPE_LOC_CSP_COUNTRY[number];

/** Value set `type_loc_place.csv` (45 choices). */
export const VS_TYPE_LOC_PLACE = [
  "AIRCRAFT",
  "AIRPORT",
  "ARENA",
  "AUTOMOBILE",
  "BANK",
  "BAR",
  "BUS",
  "BICYCLE",
  "BUS_STATION",
  "CAFE",
  "CLASSROOM",
  "CLUB",
  "CONSTRUCTION",
  "CONVENTION_CENTER",
  "GOVERNMENT",
  "HOSPITAL",
  "HOTEL",
  "INDUSTRIAL",
  "LIBRARY",
  "MOTORCYCLE",
  "MUSEUM",
  "OFFICE",
  "OTHER",
  "OUTDOORS",
  "PARKING",
  "PLACE_OF_WORSHIP",
  "PRISON",
  "PUBLIC",
  "PUBLIC_TRANSPORT",
  "RESIDENCE",
  "RESTAURANT",
  "SCHOOL",
  "SHOPPING_AREA",
  "STADIUM",
  "STORE",
  "STREET",
  "THEATER",
  "TRAIN",
  "TRAIN_STATION",
  "TRUCK",
  "UNDERWAY",
  "UNKNOWN",
  "WAREHOUSE",
  "WATER",
  "WATERCRAFT"
] as const;
export type TypeLocPlace = typeof VS_TYPE_LOC_PLACE[number];

/** Value set `type_loc_sn_direction.csv` (4 choices). */
export const VS_TYPE_LOC_SN_DIRECTION = [
  "NORTHBOUND",
  "SOUTHBOUND",
  "EASTBOUND",
  "WESTBOUND"
] as const;
export type TypeLocSnDirection = typeof VS_TYPE_LOC_SN_DIRECTION[number];

/** Value set `type_loc_sn_pre_post.csv` (389 choices). */
export const VS_TYPE_LOC_SN_PRE_POST = [
  "ABBEY",
  "ACCESS",
  "ACCESS ROAD",
  "ACRES",
  "AIRPORT",
  "ALCOVE",
  "ALLE",
  "ALLEY",
  "ANNEX",
  "APPROACH",
  "ARC",
  "ARCADE",
  "ARCH",
  "AVENIDA",
  "AVENUE",
  "AVENUE CIRCLE",
  "AVENUE COURT",
  "AVENUE LOOP",
  "AVENUE PATH",
  "AVENUE PLACE",
  "AVENUE WAY",
  "BANK",
  "BAY",
  "BAYOU",
  "BAYWAY",
  "BEACH",
  "BEND",
  "BLUFF",
  "BLUFFS",
  "BOTTOM",
  "BOARDWALK",
  "BOULEVARD",
  "BRANCH",
  "BRIDGE",
  "BROOK",
  "BROOKS",
  "BUREAU OF INDIAN AFFAIRS ROUTE",
  "BURG",
  "BURGS",
  "BYPASS",
  "CALLE",
  "CALLEJON",
  "CAMINO",
  "CAMP",
  "CANYON",
  "CAPE",
  "CARTWAY",
  "CAUSEWAY",
  "CENTER",
  "CENTRE",
  "CENTERS",
  "CHANNEL",
  "CHASE",
  "CHEMIN",
  "CIRCLE",
  "CIRCLES",
  "CIRCUS",
  "CLIFF",
  "CLIFFS",
  "CLOSE",
  "CLUB",
  "CLUSTER",
  "COAST HIGHWAY",
  "COMMON",
  "COMMONS",
  "CONCESSION ROAD",
  "CONCOURSE",
  "CONNECT",
  "CONNECTOR",
  "CORNER",
  "CORNERS",
  "CORRIDOR",
  "CORSO",
  "CORTE",
  "COUNTY FOREST ROAD",
  "COUNTY HIGHWAY",
  "COUNTY ROAD",
  "COUNTY ROUTE",
  "COUNTY STATE AID HIGHWAY",
  "COURS",
  "COURSE",
  "COURT",
  "COURTS",
  "COVE",
  "COVES",
  "CREEK",
  "CRESCENT",
  "CREST",
  "CROSS",
  "CROSSING",
  "CROSSINGS",
  "CROSSOVER",
  "CROSSROAD",
  "CROSSROADS",
  "CROSSWAY",
  "CURVE",
  "CUSTER COUNTY ROAD",
  "CUTOFF",
  "CUTTING",
  "DALE",
  "DAM",
  "DAWSON COUNTY ROAD",
  "DELL",
  "DIVIDE",
  "DOCK",
  "DOWN",
  "DOWNS",
  "DRAW",
  "DRIFT",
  "DRIVE",
  "DRIVES",
  "DRIVEWAY",
  "DUGWAY",
  "ECHO",
  "EDGE",
  "END",
  "ENTRANCE",
  "ENTRY",
  "ESPLANADE",
  "ESTATE",
  "ESTATES",
  "EXCHANGE",
  "EXIT",
  "EXPRESSWAY",
  "EXTENSION",
  "EXTENSIONS",
  "FALL",
  "FALLS",
  "FARE",
  "FARM",
  "FARM TO MARKET",
  "FEDERAL-AID SECONDARY HIGHWAY",
  "FERRY",
  "FIELD",
  "FIELDS",
  "FLAT",
  "FLATS",
  "FLOWAGE",
  "FLYWAY",
  "FORD",
  "FORDS",
  "FOREST",
  "FOREST ROAD",
  "FOREST HIGHWAY",
  "FORGE",
  "FORGES",
  "FORK",
  "FORKS",
  "FORT",
  "FREEWAY",
  "FRONT",
  "FRONTAGE ROAD",
  "GABLES",
  "GARDEN",
  "GARDENS",
  "GARTH",
  "GATE",
  "GATES",
  "GATEWAY",
  "GLADE",
  "GLEN",
  "GLENS",
  "GORGE",
  "GRADE",
  "GREEN",
  "GREENS",
  "GREENWAY",
  "GROVE",
  "GROVES",
  "HARBOR",
  "HARBORS",
  "HARBOUR",
  "HAUL ROAD",
  "HAVEN",
  "HEATH",
  "HEIGHTS",
  "HIDEAWAY",
  "HIGHWAY",
  "HILL",
  "HILLS",
  "HOLLOW",
  "HORN",
  "HORSESHOE",
  "INDIAN SERVICE ROAD",
  "INLET",
  "INTERSTATE",
  "INTERVAL",
  "ISLAND",
  "ISLANDS",
  "ISLE",
  "ISLES",
  "J-TURN",
  "JUNCTION",
  "JUNCTIONS",
  "KEEP",
  "KEY",
  "KEYS",
  "KNOLL",
  "KNOLLS",
  "LAIR",
  "LAKE",
  "LAKES",
  "LAND",
  "LANDING",
  "LANE",
  "LANE CIRCLE",
  "LANE COURT",
  "LANE ROAD",
  "LATERAL",
  "LEDGE",
  "LIGHT",
  "LIGHTS",
  "LINE",
  "LOAF",
  "LOCK",
  "LOCKS",
  "LODGE",
  "LOOKOUT",
  "LOOP",
  "LOOP ROAD",
  "LUGAR",
  "MALL",
  "MANOR",
  "MANORS",
  "MARKET",
  "MEADOW",
  "MEADOWS",
  "MEWS",
  "MILL",
  "MILLS",
  "MISSION",
  "MONTANA HIGHWAY",
  "MOTORWAY",
  "MOUNT",
  "MOUNTAIN",
  "MOUNTAINS",
  "NARROWS",
  "NATIONAL FOREST DEVELOPMENT ROAD",
  "NECK",
  "NOOK",
  "NORTH CAROLINA HIGHWAY",
  "OAKS",
  "OLD COUNTY ROAD",
  "ORCHARD",
  "OVAL",
  "OVERLOOK",
  "OVERPASS",
  "OVI",
  "PARK",
  "PARKE",
  "PARKS",
  "PARKWAY",
  "PARKWAYS",
  "PASEO",
  "PASS",
  "PASSAGE",
  "PATH",
  "PATHWAY",
  "PIKE",
  "PINE",
  "PINES",
  "PIAZZA",
  "PLACE",
  "PLACITA",
  "PLAIN",
  "PLAINS",
  "PLATZ",
  "PLAZA",
  "POINT",
  "POINTE",
  "POINTS",
  "PORT",
  "PORTS",
  "PRAIRIE",
  "PRIVATE ROAD",
  "PROMENADE",
  "PUBLIC ACCESS",
  "QUARTER",
  "QUAY",
  "RAMP",
  "RADIAL",
  "RANCH",
  "RANCHO",
  "RAPID",
  "RAPIDS",
  "REACH",
  "RECREATIONAL ROAD",
  "REST",
  "RETREAT",
  "RIDGE",
  "RIDGES",
  "RISE",
  "RIVER",
  "RIVER ROAD",
  "ROAD",
  "ROADS",
  "ROUND",
  "ROUTE",
  "ROW",
  "RUE",
  "RUN",
  "RUNNE",
  "RUNWAY",
  "SHOAL",
  "SHOALS",
  "SHORE",
  "SHORES",
  "SIDEROAD",
  "SKIES",
  "SKYWAY",
  "SLIP",
  "SPRING",
  "SPRINGS",
  "SPUR",
  "SPURS",
  "SQUARE",
  "SQUARES",
  "STATE HIGHWAY",
  "STATE PARK ROAD",
  "STATE PARKWAY",
  "STATE ROAD",
  "STATE ROUTE",
  "STATE SECONDARY",
  "STATE SPUR",
  "STATION",
  "STRAND",
  "STRASSE",
  "STRAVENUE",
  "STREAM",
  "STREET",
  "STREETS",
  "STREET COURT",
  "STREET LOOP",
  "STREET PATH",
  "STREET PLACE",
  "STREET WAY",
  "STREET CIRCLE",
  "STRIP",
  "SUMMIT",
  "TAXIWAY",
  "TERMINAL",
  "TERN",
  "TERRACE",
  "THROUGHWAY",
  "THRUWAY",
  "TIMBER ROAD",
  "TOWNLINE",
  "TOWN ROAD",
  "TOWNSHIP ROAD",
  "TRACE",
  "TRACK",
  "TRAFFICWAY",
  "TRAIL",
  "TRAILER",
  "TRIANGLE",
  "TRUCK TRAIL",
  "TUNNEL",
  "TURN",
  "TURNPIKE",
  "UNITED STATES FOREST SERVICE ROAD",
  "UNITED STATES HIGHWAY",
  "UNDERPASS",
  "UNION",
  "UNIONS",
  "UUNYE",
  "VALLEY",
  "VALLEYS",
  "VIA",
  "VIADUCT",
  "VIEW",
  "VIEWS",
  "VILLA",
  "VILLAGE",
  "VILLAGES",
  "VILLE",
  "VISTA",
  "VOG",
  "WADDY",
  "WALK",
  "WALKS",
  "WALL",
  "WAY",
  "WAYS",
  "WEEG",
  "WELL",
  "WELLS",
  "WOODS",
  "WYE",
  "WYND"
] as const;
export type TypeLocSnPrePost = typeof VS_TYPE_LOC_SN_PRE_POST[number];

/** Value set `type_loc_sn_pre_sep.csv` (12 choices). */
export const VS_TYPE_LOC_SN_PRE_SEP = [
  "OF_THE",
  "AT",
  "DE",
  "DE_LA",
  "DEL",
  "DE_LAS",
  "DES",
  "IN_THE",
  "TO_THE",
  "OF",
  "ON_THE",
  "TO"
] as const;
export type TypeLocSnPreSep = typeof VS_TYPE_LOC_SN_PRE_SEP[number];

/** Value set `type_location_cross_street.csv` (2 choices). */
export const VS_TYPE_LOCATION_CROSS_STREET = [
  "CLOSEST",
  "SECOND_CLOSEST"
] as const;
export type TypeLocationCrossStreet = typeof VS_TYPE_LOCATION_CROSS_STREET[number];

/** Value set `type_medical_patient_care.csv` (6 choices). */
export const VS_TYPE_MEDICAL_PATIENT_CARE = [
  "PATIENT_EVALUATED_CARE_PROVIDED",
  "PATIENT_EVALUATED_REFUSED_CARE",
  "PATIENT_EVALUATED_NO_CARE_REQUIRED",
  "PATIENT_REFUSED_EVALUATION_CARE",
  "PATIENT_SUPPORT_SERVICES_PROVIDED",
  "PATIENT_DEAD_ON_ARRIVAL"
] as const;
export type TypeMedicalPatientCare = typeof VS_TYPE_MEDICAL_PATIENT_CARE[number];

/** Value set `type_medical_patient_status.csv` (3 choices). */
export const VS_TYPE_MEDICAL_PATIENT_STATUS = [
  "IMPROVED",
  "UNCHANGED",
  "WORSE"
] as const;
export type TypeMedicalPatientStatus = typeof VS_TYPE_MEDICAL_PATIENT_STATUS[number];

/** Value set `type_medical_transport.csv` (5 choices). */
export const VS_TYPE_MEDICAL_TRANSPORT = [
  "TRANSPORT_BY_EMS_UNIT",
  "OTHER_AGENCY_TRANSPORT",
  "PATIENT_REFUSED_TRANSPORT",
  "NONPATIENT_TRANSPORT",
  "NO_TRANSPORT"
] as const;
export type TypeMedicalTransport = typeof VS_TYPE_MEDICAL_TRANSPORT[number];

/** Value set `type_noaction.csv` (3 choices). */
export const VS_TYPE_NOACTION = [
  "CANCELLED",
  "STAGED_STANDBY",
  "NO_INCIDENT_FOUND"
] as const;
export type TypeNoaction = typeof VS_TYPE_NOACTION[number];

/** Value set `type_occupant_response.csv` (7 choices). */
export const VS_TYPE_OCCUPANT_RESPONSE = [
  "EVACUATED",
  "IGNORED_ALARM",
  "UNABLE_TO_RESPOND",
  "ATTEMPTED_TO_EXTINGUISH",
  "ATTEMPTED_TO_RESCUE_OCCUPANTS",
  "ATTEMPTED_TO_RESCUE_ANIMALS",
  "UNKNOWN"
] as const;
export type TypeOccupantResponse = typeof VS_TYPE_OCCUPANT_RESPONSE[number];

/** Value set `type_pop_source.csv` (2 choices). */
export const VS_TYPE_POP_SOURCE = [
  "DEPARTMENT_ENTERED",
  "CENSUS_DERIVED"
] as const;
export type TypePopSource = typeof VS_TYPE_POP_SOURCE[number];

/** Value set `type_psap.csv` (2 choices). */
export const VS_TYPE_PSAP = [
  "PRIMARY",
  "SECONDARY"
] as const;
export type TypePsap = typeof VS_TYPE_PSAP[number];

/** Value set `type_psap_capa.csv` (2 choices). */
export const VS_TYPE_PSAP_CAPA = [
  "LEGACY",
  "NG911"
] as const;
export type TypePsapCapa = typeof VS_TYPE_PSAP_CAPA[number];

/** Value set `type_psap_disc.csv` (2 choices). */
export const VS_TYPE_PSAP_DISC = [
  "SINGLE",
  "MULTIPLE"
] as const;
export type TypePsapDisc = typeof VS_TYPE_PSAP_DISC[number];

/** Value set `type_psap_juris.csv` (2 choices). */
export const VS_TYPE_PSAP_JURIS = [
  "SINGLE",
  "MULTIPLE"
] as const;
export type TypePsapJuris = typeof VS_TYPE_PSAP_JURIS[number];

/** Value set `type_race.csv` (9 choices). */
export const VS_TYPE_RACE = [
  "AMERICAN_INDIAN_ALASKA_NATIVE",
  "ASIAN",
  "BLACK_AFRICAN_AMERICAN",
  "MIDDLE_EASTERN_NORTH_AFRICAN",
  "HISPANIC_LATINO",
  "NATIVE_HAWAIIAN_PACIFIC_ISLANDER",
  "WHITE",
  "OTHER",
  "UNKNOWN"
] as const;
export type TypeRace = typeof VS_TYPE_RACE[number];

/** Value set `type_region.csv` (7 choices). */
export const VS_TYPE_REGION = [
  "JURISDICTION",
  "BATTALION",
  "COUNCIL_DISTRICT",
  "DISTRICT",
  "DIVISION",
  "FIRST_DUE",
  "OTHER"
] as const;
export type TypeRegion = typeof VS_TYPE_REGION[number];

/** Value set `type_rel_dept_dept.csv` (8 choices). */
export const VS_TYPE_REL_DEPT_DEPT = [
  "IS_CHILD_OF",
  "IS_PARENT_OF",
  "MUTUALLY_AIDS",
  "IS_MUTUALLY_AIDED_BY",
  "AUTOMATICALLY_AIDS",
  "IS_AUTOMATICALLY_AIDED_BY",
  "CONTRACTUALLY_AIDS",
  "IS_CONTRACTUALLY_AIDED_BY"
] as const;
export type TypeRelDeptDept = typeof VS_TYPE_REL_DEPT_DEPT[number];

/** Value set `type_rel_dept_station.csv` (1 choices). */
export const VS_TYPE_REL_DEPT_STATION = [
  "INCLUDES"
] as const;
export type TypeRelDeptStation = typeof VS_TYPE_REL_DEPT_STATION[number];

/** Value set `type_rel_event_incident.csv` (3 choices). */
export const VS_TYPE_REL_EVENT_INCIDENT = [
  "CAUSED_BY",
  "CAUSED",
  "INCLUDES"
] as const;
export type TypeRelEventIncident = typeof VS_TYPE_REL_EVENT_INCIDENT[number];

/** Value set `type_rel_incident_incident.csv` (1 choices). */
export const VS_TYPE_REL_INCIDENT_INCIDENT = [
  "DUPLICATED_BY"
] as const;
export type TypeRelIncidentIncident = typeof VS_TYPE_REL_INCIDENT_INCIDENT[number];

/** Value set `type_rel_station_station.csv` (1 choices). */
export const VS_TYPE_REL_STATION_STATION = [
  "UNKNOWN"
] as const;
export type TypeRelStationStation = typeof VS_TYPE_REL_STATION_STATION[number];

/** Value set `type_rel_unit_unit.csv` (1 choices). */
export const VS_TYPE_REL_UNIT_UNIT = [
  "UNKNOWN"
] as const;
export type TypeRelUnitUnit = typeof VS_TYPE_REL_UNIT_UNIT[number];

/** Value set `type_rescue.csv` (6 choices). */
export const VS_TYPE_RESCUE = [
  "RESCUED_BY_FIREFIGHTER",
  "RESCUED_BY_FF_RIT",
  "RESCUED_BY_NONFIREFIGHTER",
  "EVAC_ASSISTED_BY_FIREFIGHTER",
  "SELF_EVACUATION",
  "NO_RESCUE_NEEDED"
] as const;
export type TypeRescue = typeof VS_TYPE_RESCUE[number];

/** Value set `type_rescue_action.csv` (8 choices). */
export const VS_TYPE_RESCUE_ACTION = [
  "VENTILATION",
  "HYDRAULIC_TOOL_USE",
  "UNDERWATER_DIVE",
  "ROPE_RIGGING",
  "BREAK_BREACH_WALL",
  "BRACE_WALL_INFRASTRUCTURE",
  "TRENCH_SHORING",
  "SUPPLY_AIR"
] as const;
export type TypeRescueAction = typeof VS_TYPE_RESCUE_ACTION[number];

/** Value set `type_rescue_elevation.csv` (4 choices). */
export const VS_TYPE_RESCUE_ELEVATION = [
  "ON_FLOOR",
  "ON_BED",
  "ON_FURNITURE",
  "OTHER"
] as const;
export type TypeRescueElevation = typeof VS_TYPE_RESCUE_ELEVATION[number];

/** Value set `type_rescue_impediment.csv` (6 choices). */
export const VS_TYPE_RESCUE_IMPEDIMENT = [
  "HOARDING_CONDITIONS",
  "ACCESS_LIMITATIONS",
  "PHYSICAL_MEDICAL_CONDITIONS_PERSON",
  "IMPAIRED_PERSON",
  "OTHER",
  "NONE"
] as const;
export type TypeRescueImpediment = typeof VS_TYPE_RESCUE_IMPEDIMENT[number];

/** Value set `type_rescue_mode.csv` (5 choices). */
export const VS_TYPE_RESCUE_MODE = [
  "REMOVAL_FROM_STRUCTURE",
  "EXTRICATION",
  "DISENTANGLEMENT",
  "RECOVERY",
  "OTHER"
] as const;
export type TypeRescueMode = typeof VS_TYPE_RESCUE_MODE[number];

/** Value set `type_rescue_path.csv` (2 choices). */
export const VS_TYPE_RESCUE_PATH = [
  "REMOVAL_ALONG_PRIMARY_PATH",
  "REMOVAL_ALONG_ALT_PATH"
] as const;
export type TypeRescuePath = typeof VS_TYPE_RESCUE_PATH[number];

/** Value set `type_rescue_presence_known.csv` (3 choices). */
export const VS_TYPE_RESCUE_PRESENCE_KNOWN = [
  "KNOWN_DISPATCH",
  "KNOWN_ARRIVAL",
  "KNOWN_DURING"
] as const;
export type TypeRescuePresenceKnown = typeof VS_TYPE_RESCUE_PRESENCE_KNOWN[number];

/** Value set `type_response_mode.csv` (2 choices). */
export const VS_TYPE_RESPONSE_MODE = [
  "EMERGENT",
  "NON_EMERGENT"
] as const;
export type TypeResponseMode = typeof VS_TYPE_RESPONSE_MODE[number];

/** Value set `type_room.csv` (14 choices). */
export const VS_TYPE_ROOM = [
  "ASSEMBLY",
  "BATHROOM",
  "BEDROOM",
  "KITCHEN",
  "LIVING_SPACE",
  "HALLWAY_FOYER",
  "GARAGE",
  "BALCONY_PORCH_DECK",
  "BASEMENT",
  "ATTIC",
  "OFFICE",
  "UTILITY_ROOM",
  "OTHER",
  "UNKNOWN"
] as const;
export type TypeRoom = typeof VS_TYPE_ROOM[number];

/** Value set `type_rr_presence.csv` (3 choices). */
export const VS_TYPE_RR_PRESENCE = [
  "PRESENT",
  "NOT_PRESENT",
  "NOT_APPLICABLE"
] as const;
export type TypeRrPresence = typeof VS_TYPE_RR_PRESENCE[number];

/** Value set `type_serv_ems.csv` (7 choices). */
export const VS_TYPE_SERV_EMS = [
  "NO_MEDICAL",
  "BLS_NO_TRANSPORT",
  "ALS_NO_TRANSPORT",
  "BLS_TRANSPORT",
  "ALS_TRANSPORT",
  "AERO_TRANSPORT",
  "COMMUNITY_MED"
] as const;
export type TypeServEms = typeof VS_TYPE_SERV_EMS[number];

/** Value set `type_serv_fd.csv` (37 choices). */
export const VS_TYPE_SERV_FD = [
  "STRUCTURAL_FIREFIGHTING",
  "HIGHRISE_FIREFIGHTING",
  "WILDLAND_FIREFIGHTING",
  "PETROCHEM_FIREFIGHTING",
  "ARFF_FIREFIGHTING",
  "MARINE_FIREFIGHTING",
  "HAZMAT_OPS",
  "HAZMAT_TECHNICIAN",
  "ROPE_RESCUE",
  "COLLAPSE_RESCUE",
  "VEHICLE_RESCUE",
  "ANIMAL_TECHRESCUE",
  "WILDERNESS_SAR",
  "TRENCH_RESCUE",
  "CONFINED_SPACE",
  "MACHINERY_RESCUE",
  "CAVE_SAR",
  "MINE_SAR",
  "HELO_SAR",
  "WATER_SAR",
  "SWIFTWATER_SAR",
  "DIVE_SAR",
  "ICE_RESCUE",
  "SURF_RESCUE",
  "WATERCRAFT_RESCUE",
  "FLOOD_SAR",
  "TOWER_SAR",
  "REHABILITATION",
  "RRD_EXISTING",
  "RRD_NEWCONST",
  "RRD_PUBLICED",
  "RRD_PLANS",
  "CAUSE_ORIGIN",
  "TRAINING_ELF",
  "TRAINING_VETFF",
  "TRAINING_OD",
  "TRAINING_DRIVER"
] as const;
export type TypeServFd = typeof VS_TYPE_SERV_FD[number];

/** Value set `type_serv_invest.csv` (5 choices). */
export const VS_TYPE_SERV_INVEST = [
  "COMPANY_LEVEL",
  "YOUTH_FIRESETTER",
  "DEDICATED",
  "LAW_ENFORCEMENT",
  "K9_DETECT"
] as const;
export type TypeServInvest = typeof VS_TYPE_SERV_INVEST[number];

/** Value set `type_source_target.csv` (3 choices). */
export const VS_TYPE_SOURCE_TARGET = [
  "SOURCE",
  "TARGET",
  "UNKNOWN"
] as const;
export type TypeSourceTarget = typeof VS_TYPE_SOURCE_TARGET[number];

/** Value set `type_special_modifier.csv` (7 choices). */
export const VS_TYPE_SPECIAL_MODIFIER = [
  "ACTIVE_ASSAILANT",
  "MCI",
  "FEDERAL_DECLARED_DISASTER",
  "STATE_DECLARED_DISASTER",
  "COUNTY_LOCAL_DECLARED_DISASTER",
  "URBAN_CONFLAGRATION",
  "VIOLENCE_AGAINST_RESPONDER"
] as const;
export type TypeSpecialModifier = typeof VS_TYPE_SPECIAL_MODIFIER[number];

/** Value set `type_suppress_appliance.csv` (12 choices). */
export const VS_TYPE_SUPPRESS_APPLIANCE = [
  "FIRE_EXTINGUISHER",
  "BOOSTER_FIRE_HOSE",
  "SMALL_DIAMETER_FIRE_HOSE",
  "MEDIUM_DIAMETER_FIRE_HOSE",
  "GROUND_MONITOR",
  "MASTER_STREAM",
  "ELEVATED_MASTER_STREAM_STANDPIPE",
  "BUILDING_STANDPIPE",
  "BUILDING_FDC",
  "AIRATTACK_HELITACK",
  "OTHER",
  "NONE"
] as const;
export type TypeSuppressAppliance = typeof VS_TYPE_SUPPRESS_APPLIANCE[number];

/** Value set `type_suppress_cooking.csv` (5 choices). */
export const VS_TYPE_SUPPRESS_COOKING = [
  "COMMERCIAL_HOOD_SUPPRESSION",
  "RESIDENTIAL_HOOD_MOUNTED",
  "TEMPERATURE_LIMITING_STOVE",
  "ELECTRIC_POWER_CUTOFF_DEVICE",
  "OTHER"
] as const;
export type TypeSuppressCooking = typeof VS_TYPE_SUPPRESS_COOKING[number];

/** Value set `type_suppress_fire.csv` (8 choices). */
export const VS_TYPE_SUPPRESS_FIRE = [
  "WET_PIPE_SPRINKLER_SYSTEM",
  "DRY_PIPE_SPRINKLER_SYSTEM",
  "PRE_ACTION_SYSTEM",
  "DELUGE_SYSTEM",
  "CLEAN_AGENT_SYSTEM",
  "INDUSTRIAL_DRY_CHEM_SYSTEM",
  "OTHER",
  "UNKNOWN"
] as const;
export type TypeSuppressFire = typeof VS_TYPE_SUPPRESS_FIRE[number];

/** Value set `type_suppress_no_operation.csv` (8 choices). */
export const VS_TYPE_SUPPRESS_NO_OPERATION = [
  "SYSTEM_SHUTOFF_PRIOR_TO_INCIDENT",
  "SYSTEM_SHUTOFF_DURING_INCIDENT",
  "SYSTEM_INOPERABLE",
  "SYSTEM_DAMAGED_COMPROMISED",
  "SYSTEM_NOT_SUITABLE",
  "INSUFFICIENT_WATER_SUPPLY",
  "INSUFFICIENT_SOURCE",
  "UNABLE_TO_DETERMINE"
] as const;
export type TypeSuppressNoOperation = typeof VS_TYPE_SUPPRESS_NO_OPERATION[number];

/** Value set `type_suppress_operation.csv` (3 choices). */
export const VS_TYPE_SUPPRESS_OPERATION = [
  "OPERATED_EFFECTIVE",
  "OPERATED_NOT_EFFECTIVE",
  "NO_OPERATION"
] as const;
export type TypeSuppressOperation = typeof VS_TYPE_SUPPRESS_OPERATION[number];

/** Value set `type_suppress_time.csv` (3 choices). */
export const VS_TYPE_SUPPRESS_TIME = [
  "PRE_SUPPRESSION",
  "DURING_SUPPRESSION",
  "POST_SUPPRESSION"
] as const;
export type TypeSuppressTime = typeof VS_TYPE_SUPPRESS_TIME[number];

/** Value set `type_unit.csv` (49 choices). */
export const VS_TYPE_UNIT = [
  "CREW_TRANS",
  "ENGINE_STRUCT",
  "ENGINE_WUI",
  "BOAT",
  "BOAT_LARGE",
  "LADDER_SMALL",
  "LADDER_QUINT",
  "LADDER_TALL",
  "QUINT_TALL",
  "PLATFORM",
  "PLATFORM_QUINT",
  "LADDER_TILLER",
  "ARFF",
  "FOAM",
  "TENDER",
  "CREW",
  "HELO_GENERAL",
  "HELO_FIRE",
  "HELO_RESCUE",
  "UAS_FIRE",
  "UAS_RECON",
  "AIR_TANKER",
  "AIR_EMS",
  "AIR_RECON",
  "ALS_AMB",
  "BLS_AMB",
  "EMS_NOTRANS",
  "EMS_SUPV",
  "MAB",
  "CHIEF_STAFF_COMMAND",
  "HAZMAT",
  "DECON",
  "POV",
  "RESCUE_HEAVY",
  "RESCUE_MEDIUM",
  "RESCUE_LIGHT",
  "RESCUE_USAR",
  "RESCUE_WATER",
  "SCBA",
  "AIR_LIGHT",
  "REHAB",
  "MOBILE_ICP",
  "MOBILE_COMMS",
  "DOZER",
  "OTHER_GROUND",
  "ATV_EMS",
  "ATV_FIRE",
  "INVEST",
  "UTIL"
] as const;
export type TypeUnit = typeof VS_TYPE_UNIT[number];

/** Value set `type_vacancy.csv` (7 choices). */
export const VS_TYPE_VACANCY = [
  "NEW_CONSTRUCTION_REMODEL",
  "ABANDONED",
  "FOR_SALE_LEASE",
  "FORECLOSURE",
  "DAMAGE_DECAY",
  "SEASONAL_OCCASIONALLY_OCCUPIED",
  "UNKNOWN"
] as const;
export type TypeVacancy = typeof VS_TYPE_VACANCY[number];

/** Value set `type_water_supply.csv` (8 choices). */
export const VS_TYPE_WATER_SUPPLY = [
  "HYDRANT_LESS_500",
  "HYDRANT_GREATER_500",
  "TANK_WATER",
  "WATER_TENDER_SHUTTLE",
  "NURSE_OTHER_APPARATUS",
  "DRAFT_FROM_STATIC_SOURCE",
  "SUPPLY_FROM_FIRE_BOAT",
  "FOAM_ADDITIVE"
] as const;
export type TypeWaterSupply = typeof VS_TYPE_WATER_SUPPLY[number];

/** Value set `type_yes_no_unknown.csv` (3 choices). */
export const VS_TYPE_YES_NO_UNKNOWN = [
  "YES",
  "NO",
  "UNKNOWN"
] as const;
export type TypeYesNoUnknown = typeof VS_TYPE_YES_NO_UNKNOWN[number];

/** Value set `type_activity.csv` (16 choices). */
export const VS_TYPE_ACTIVITY = [
  "DRIVING_RIDING_DEPARTMENT_VEHICLE",
  "DRIVING_RIDING_OTHER_VEHICLE",
  "MOVING_ABOUT_STATION_ALARM",
  "MOVING_ABOUT_STATION_NORMAL",
  "STATION_MAINTENANCE",
  "VEHICLE_MAINTENANCE",
  "EQUIPMENT_MAINTENANCE",
  "PHYSICAL_FITNESS_ACTIVITY",
  "COOKING_ACTIVITY",
  "TRAINING_ACTIVITY_DRILL",
  "INVESTIGATION",
  "INSPECTION",
  "ADMINISTRATIVE_WORK",
  "COMMUNICATIONS_WORK",
  "AT_REST",
  "OTHER"
] as const;
export type TypeActivity = typeof VS_TYPE_ACTIVITY[number];

/** Value set `type_alcohol_tobacco_drugs.csv` (6 choices). */
export const VS_TYPE_ALCOHOL_TOBACCO_DRUGS = [
  "ALCOHOL_USER",
  "TOBACCO_USER",
  "SMOKER_OTHER",
  "MARIJUANA_USER",
  "OTHER_ILLICIT_DRUGS",
  "NONE"
] as const;
export type TypeAlcoholTobaccoDrugs = typeof VS_TYPE_ALCOHOL_TOBACCO_DRUGS[number];

/** Value set `type_appliances_equipment.csv` (35 choices). */
export const VS_TYPE_APPLIANCES_EQUIPMENT = [
  "HEATING_COOLING_EQUIPMENT: PORTABLE_AIR_CONDITIONING",
  "HEATING_COOLING_EQUIPMENT: PORTABLE_HEATER",
  "HEATING_COOLING_EQUIPMENT: CENTRAL_HEATING",
  "HEATING_COOLING_EQUIPMENT: CENTRAL_AIR_CONDITIONING",
  "HEATING_COOLING_EQUIPMENT: FIREPLACE",
  "HEATING_COOLING_EQUIPMENT: CHIMNEY",
  "HEATING_COOLING_EQUIPMENT: CHIMNEY_CONNECTOR",
  "HEATING_COOLING_EQUIPMENT: WATER_HEATER",
  "HEATING_COOLING_EQUIPMENT: OTHER",
  "HEATING_COOLING_EQUIPMENT: VENT_EXHAUST_FAN",
  "COOKING_EQUIPMENT: GAS_RANGE_OVEN",
  "COOKING_EQUIPMENT: ELECTRIC_RANGE_OVEN",
  "COOKING_EQUIPMENT: MICROWAVE_OVEN",
  "COOKING_EQUIPMENT: TOASTER_OVEN",
  "COOKING_EQUIPMENT: AIR_FRYER",
  "COOKING_EQUIPMENT: OIL_FRYER",
  "COOKING_EQUIPMENT: OTHER_COOKING",
  "ELECTRICAL_EQUIPMENT: PERMANENT_ELECTRICAL_CORD_CABLE",
  "ELECTRICAL_EQUIPMENT: TEMPORARY_ELECTRICAL_CORD_CABLE",
  "ELECTRICAL_EQUIPMENT: RECEPTACLE_SWITCH",
  "ELECTRICAL_EQUIPMENT: LIGHTING",
  "ELECTRICAL_EQUIPMENT: TRANSFORMER",
  "ELECTRICAL_EQUIPMENT: PANEL_BOARD_SWITCH_BOARD",
  "ELECTRICAL_EQUIPMENT: OTHER",
  "ELECTRICAL_EQUIPMENT: POWER_STRIPS_ADAPTERS",
  "APPLIANCES_EQUIPMENT: AUDIO_VISUAL_EQUIPMENT",
  "APPLIANCES_EQUIPMENT: CLOTHES_DRYER",
  "APPLIANCES_EQUIPMENT: WASHING_MACHINE",
  "APPLIANCES_EQUIPMENT: DISHWASHER",
  "APPLIANCES_EQUIPMENT: REFRIGERATOR",
  "APPLIANCES_EQUIPMENT: PRESSING_IRON",
  "APPLIANCES_EQUIPMENT: SHOP_TOOLS",
  "APPLIANCES_EQUIPMENT: TORCH",
  "APPLIANCES_EQUIPMENT: OUTDOOR_GRILL_FIRE_PIT",
  "APPLIANCES_EQUIPMENT: OTHER"
] as const;
export type TypeAppliancesEquipment = typeof VS_TYPE_APPLIANCES_EQUIPMENT[number];

/** Value set `type_aspect.csv` (8 choices). */
export const VS_TYPE_ASPECT = [
  "NORTH_WEST",
  "SOUTH_WEST",
  "NORTH",
  "SOUTH",
  "EAST",
  "WEST",
  "NORTH_EAST",
  "SOUTH_EAST"
] as const;
export type TypeAspect = typeof VS_TYPE_ASPECT[number];

/** Value set `type_assignment.csv` (12 choices). */
export const VS_TYPE_ASSIGNMENT = [
  "FIRE_SUPPRESSION",
  "HAZMAT",
  "RESCUE",
  "EMS",
  "PREVENTION_INSPECTION",
  "TRAINING",
  "MAINTENANCE",
  "COMMUNICATIONS",
  "ADMINISTRATION",
  "FIRE_INVESTIGATIONS",
  "MIH_PARAMEDICINE",
  "OTHER"
] as const;
export type TypeAssignment = typeof VS_TYPE_ASSIGNMENT[number];

/** Value set `type_attached.csv` (7 choices). */
export const VS_TYPE_ATTACHED = [
  "FENCE",
  "PORCH_DECK",
  "CARPORT_LEANTO",
  "PATIO_COVER_AWNING",
  "GARAGE",
  "OTHER",
  "NONE"
] as const;
export type TypeAttached = typeof VS_TYPE_ATTACHED[number];

/** Value set `type_attached_material.csv` (4 choices). */
export const VS_TYPE_ATTACHED_MATERIAL = [
  "COMBUSTIBLE",
  "NON COMBUSTIBLE",
  "NONE PRESENT",
  "UNKNOWN"
] as const;
export type TypeAttachedMaterial = typeof VS_TYPE_ATTACHED_MATERIAL[number];

/** Value set `type_auto_body_style.csv` (17 choices). */
export const VS_TYPE_AUTO_BODY_STYLE = [
  "AMBULANCE",
  "BUS",
  "CONVERTIBLE",
  "COUPE",
  "FIRE TRUCK",
  "HARDTOP",
  "HATCHBACK",
  "HEARSE",
  "LIMOUSINE",
  "MINIVAN",
  "MOTORIZED_HOME",
  "PICKUP",
  "ROADSTER",
  "SUV",
  "SEDAN",
  "STATION_WAGON",
  "VAN"
] as const;
export type TypeAutoBodyStyle = typeof VS_TYPE_AUTO_BODY_STYLE[number];

/** Value set `type_auto_make.csv` (66 choices). */
export const VS_TYPE_AUTO_MAKE = [
  "Acura",
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "BMW",
  "Bentley Motors",
  "Bollinger Motors",
  "Bugatti",
  "Buick",
  "Cadillac",
  "Canoo",
  "Chevrolet",
  "Chrysler",
  "DeLorean Motor Company",
  "Dodge",
  "Ferrari",
  "Fiat",
  "Fisker",
  "Ford",
  "GMC",
  "Genesis",
  "Honda",
  "Hummer",
  "Hyundai",
  "Ineos",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Karma",
  "Kia",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Lordstown Motors",
  "Lotus",
  "Lucid Motors",
  "Maserati",
  "Maybach",
  "Mazda",
  "McLaren",
  "Mercedes-AMG",
  "Mercedes-Benz",
  "Mercury",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Oldsmobile",
  "Polestar",
  "Pontiac",
  "Porsche",
  "Plymouth",
  "Ram",
  "Rivian",
  "Rolls-Royce",
  "Saab",
  "Saturn",
  "Scion",
  "Smart",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "VinFast",
  "Volvo"
] as const;
export type TypeAutoMake = typeof VS_TYPE_AUTO_MAKE[number];

/** Value set `type_battery_cell.csv` (4 choices). */
export const VS_TYPE_BATTERY_CELL = [
  "POUCH_POLYMER",
  "CYLINDRICAL",
  "PRISMATIC",
  "BUTTON_COIN"
] as const;
export type TypeBatteryCell = typeof VS_TYPE_BATTERY_CELL[number];

/** Value set `type_battery_chemistry.csv` (10 choices). */
export const VS_TYPE_BATTERY_CHEMISTRY = [
  "LITHIUM_ION",
  "LITHIUM_METAL",
  "LITHIUM_IRON_PHOSPHATE",
  "LITHIUM_SULPHUR",
  "SODIUM_ION",
  "ALKALINE",
  "LEAD_ACID",
  "NICKEL_METAL_HYDRIDE",
  "UNKNOWN",
  "OTHER"
] as const;
export type TypeBatteryChemistry = typeof VS_TYPE_BATTERY_CHEMISTRY[number];

/** Value set `type_bldg_damage.csv` (5 choices). */
export const VS_TYPE_BLDG_DAMAGE = [
  "MINOR_DAMAGE",
  "MODERATE_DAMAGE",
  "DESTROYED",
  "INACCESSIBLE",
  "NO DAMAGE"
] as const;
export type TypeBldgDamage = typeof VS_TYPE_BLDG_DAMAGE[number];

/** Value set `type_body_part_injured.csv` (22 choices). */
export const VS_TYPE_BODY_PART_INJURED = [
  "EAR",
  "EYE",
  "NOSE",
  "MOUTH",
  "HEAD_OTHER",
  "NECK_SHOULDERS",
  "BACK_SPINE",
  "BACK_OTHER",
  "CHEST",
  "ABDOMEN",
  "PELVIS_GROIN",
  "HIP_LOWER_BACK_BUTTOCKS",
  "ARM",
  "LEG",
  "HANDS_FINGERS",
  "FOOT_TOES",
  "LUNGS",
  "HEART",
  "STOMACH",
  "INTESTINAL_TRACT",
  "GENITO_URINARY",
  "OTHER"
] as const;
export type TypeBodyPartInjured = typeof VS_TYPE_BODY_PART_INJURED[number];

/** Value set `type_construction.csv` (10 choices). */
export const VS_TYPE_CONSTRUCTION = [
  "TYPE_IA",
  "TYPE_IB",
  "TYPE_IIA",
  "TYPE_IIB",
  "TYPE_IIIA",
  "TYPE_IIIB",
  "TYPE_IV",
  "TYPE_VA",
  "TYPE_VB",
  "UNKNOWN"
] as const;
export type TypeConstruction = typeof VS_TYPE_CONSTRUCTION[number];

/** Value set `type_contributing_hazards.csv` (4 choices). */
export const VS_TYPE_CONTRIBUTING_HAZARDS = [
  "CIRCUITS_TRIPPED",
  "GAS_FUEL_ON",
  "CO_DETECTED",
  "OTHER"
] as const;
export type TypeContributingHazards = typeof VS_TYPE_CONTRIBUTING_HAZARDS[number];

/** Value set `type_deck_porch_grade.csv` (4 choices). */
export const VS_TYPE_DECK_PORCH_GRADE = [
  "ON GRADE",
  "ELEVATED",
  "NONE PRESENT",
  "BELOW_GRADE_SUNKEN"
] as const;
export type TypeDeckPorchGrade = typeof VS_TYPE_DECK_PORCH_GRADE[number];

/** Value set `type_deck_porch_material.csv` (7 choices). */
export const VS_TYPE_DECK_PORCH_MATERIAL = [
  "COMPOSITE",
  "MASONRY/CONCRETE",
  "WOOD",
  "VINYL_PLASTIC_PVC",
  "METAL",
  "OTHER",
  "UNKNOWN"
] as const;
export type TypeDeckPorchMaterial = typeof VS_TYPE_DECK_PORCH_MATERIAL[number];

/** Value set `type_dins_origin_cause.csv` (5 choices). */
export const VS_TYPE_DINS_ORIGIN_CAUSE = [
  "DIRECT FLAME IMPINGEMENT",
  "EMBERS",
  "RADIANT HEAT",
  "UNKNOWN",
  "OTHER"
] as const;
export type TypeDinsOriginCause = typeof VS_TYPE_DINS_ORIGIN_CAUSE[number];

/** Value set `type_dins_origin_location.csv` (11 choices). */
export const VS_TYPE_DINS_ORIGIN_LOCATION = [
  "ATTACHED FENCE",
  "ATTACHED PATIO COVER/CARPORT",
  "DECK ELEVATED",
  "DECK ON GRADE",
  "EAVES",
  "ROOF",
  "SIDING",
  "WINDOW",
  "VENT",
  "UNKNOWN",
  "OTHER"
] as const;
export type TypeDinsOriginLocation = typeof VS_TYPE_DINS_ORIGIN_LOCATION[number];

/** Value set `type_disposition.csv` (6 choices). */
export const VS_TYPE_DISPOSITION = [
  "FIRST_AID_ONLY",
  "HOSPITAL",
  "DOCTORS_OFFICE",
  "MORGUE_FUNERAL_HOME",
  "RESIDENCE",
  "NO_CARE_NEEDED"
] as const;
export type TypeDisposition = typeof VS_TYPE_DISPOSITION[number];

/** Value set `type_distance_unit.csv` (2 choices). */
export const VS_TYPE_DISTANCE_UNIT = [
  "FEET",
  "MILES"
] as const;
export type TypeDistanceUnit = typeof VS_TYPE_DISTANCE_UNIT[number];

/** Value set `type_eaves.csv` (4 choices). */
export const VS_TYPE_EAVES = [
  "ENCLOSED",
  "UNENCLOSED",
  "NO EAVES",
  "UNKNOWN"
] as const;
export type TypeEaves = typeof VS_TYPE_EAVES[number];

/** Value set `type_emerghaz_elec.csv` (48 choices). */
export const VS_TYPE_EMERGHAZ_ELEC = [
  "CONSUMER_PRODUCTS: APPLIANCE_TOOL",
  "CONSUMER_PRODUCTS: CELL_PHONE",
  "CONSUMER_PRODUCTS: COMPUTER_TABLET",
  "CONSUMER_PRODUCTS: ELECTRONIC_CIGARETTE",
  "CONSUMER_PRODUCTS: POWER_BANK",
  "CONSUMER_PRODUCTS: TOY",
  "CONSUMER_PRODUCTS: OTHER",
  "ENERGY_STORAGE_SYSTEM: HYDROELECTRIC",
  "ENERGY_STORAGE_SYSTEM: BATTERY",
  "ENERGY_STORAGE_SYSTEM: COMPRESSED_AIR",
  "ENERGY_STORAGE_SYSTEM: FLYWHEEL",
  "ENERGY_STORAGE_SYSTEM: OTHER",
  "E_MOBILITY: POWER_ASSISTED_BICYCLE",
  "E_MOBILITY: ELECTRIC_SCOOTER_MOPED",
  "E_MOBILITY: PERSONAL_MOBILITY_ASSIST",
  "E_MOBILITY: OTHER",
  "ELECTRIC_VEHICLE: CAR_RR: FULL_ELECTRIC",
  "ELECTRIC_VEHICLE: CAR_RR: PLUG_IN_HYBRID",
  "ELECTRIC_VEHICLE: CAR_RR: HYBRID",
  "ELECTRIC_VEHICLE: CAR_RR: FUEL_CELL",
  "ELECTRIC_VEHICLE: TRUCK_PASSENGER_RR: FULL_ELECTRIC",
  "ELECTRIC_VEHICLE: TRUCK_PASSENGER_RR: PLUG_IN_HYBRID",
  "ELECTRIC_VEHICLE: TRUCK_PASSENGER_RR: HYBRID",
  "ELECTRIC_VEHICLE: TRUCK_PASSENGER_RR: FUEL_CELL",
  "ELECTRIC_VEHICLE: TRUCK_COMMERCIAL_RR: FULL_ELECTRIC",
  "ELECTRIC_VEHICLE: TRUCK_COMMERCIAL_RR: PLUG_IN_HYBRID",
  "ELECTRIC_VEHICLE: TRUCK_COMMERCIAL_RR: HYBRID",
  "ELECTRIC_VEHICLE: TRUCK_COMMERCIAL_RR: FUEL_CELL",
  "ELECTRIC_VEHICLE: BUS_RR: FULL_ELECTRIC",
  "ELECTRIC_VEHICLE: BUS_RR: PLUG_IN_HYBRID",
  "ELECTRIC_VEHICLE: BUS_RR: HYBRID",
  "ELECTRIC_VEHICLE: BUS_RR: FUEL_CELL",
  "ELECTRIC_VEHICLE: BOAT_RECREATIONAL: FULL_ELECTRIC",
  "ELECTRIC_VEHICLE: BOAT_RECREATIONAL: PLUG_IN_HYBRID",
  "ELECTRIC_VEHICLE: BOAT_RECREATIONAL: HYBRID",
  "ELECTRIC_VEHICLE: BOAT_RECREATIONAL: Fuel_Cell",
  "ELECTRIC_VEHICLE: BOAT_COMMERCIAL: FULL_ELECTRIC",
  "ELECTRIC_VEHICLE: BOAT_COMMERCIAL: PLUG_IN_HYBRID",
  "ELECTRIC_VEHICLE: BOAT_COMMERCIAL: HYBRID",
  "ELECTRIC_VEHICLE: BOAT_COMMERCIAL: FUEL_CELL",
  "ELECTRIC_VEHICLE: LIGHT_EV_NRR: FULL_ELECTRIC",
  "ELECTRIC_VEHICLE: LIGHT_EV_NRR: PLUG_IN_HYBRID",
  "ELECTRIC_VEHICLE: LIGHT_EV_NRR: HYBRID",
  "ELECTRIC_VEHICLE: LIGHT_EV_NRR: FUEL_CELL",
  "ELECTRIC_VEHICLE: OTHER: FULL_ELECTRIC",
  "ELECTRIC_VEHICLE: OTHER: PLUG_IN_HYBRID",
  "ELECTRIC_VEHICLE: OTHER: HYBRID",
  "ELECTRIC_VEHICLE: OTHER: FUEL_CELL"
] as const;
export type TypeEmerghazElec = typeof VS_TYPE_EMERGHAZ_ELEC[number];

/** Value set `type_exposure.csv` (6 choices). */
export const VS_TYPE_EXPOSURE = [
  "SMOKE",
  "DERMAL",
  "INFECTIOUS_DISEASE",
  "HEAT",
  "HAZMAT",
  "OTHER"
] as const;
export type TypeExposure = typeof VS_TYPE_EXPOSURE[number];

/** Value set `type_exterior_finish.csv` (9 choices). */
export const VS_TYPE_EXTERIOR_FINISH = [
  "WOOD",
  "BRICK_STONE",
  "VINYL",
  "ASHPHALT",
  "METAL",
  "CONCRETE",
  "EIFS",
  "STUCCO",
  "FIBER_CEMENT"
] as const;
export type TypeExteriorFinish = typeof VS_TYPE_EXTERIOR_FINISH[number];

/** Value set `type_fire_spread.csv` (5 choices). */
export const VS_TYPE_FIRE_SPREAD = [
  "OBJECT",
  "ROOM",
  "FLOOR",
  "BUILDING",
  "BEYOND_BUILDING"
] as const;
export type TypeFireSpread = typeof VS_TYPE_FIRE_SPREAD[number];

/** Value set `type_foundation.csv` (9 choices). */
export const VS_TYPE_FOUNDATION = [
  "CRAWL_SPACE",
  "POURED_CONCRETE_SLAB",
  "FULL_BASEMENT",
  "SLAB_ON_GRADE",
  "INSULATED_CONCRETE",
  "PIER_AND_BEAM_PILE",
  "CONCRETE_PANELS",
  "WOOD",
  "STONE"
] as const;
export type TypeFoundation = typeof VS_TYPE_FOUNDATION[number];

/** Value set `type_fuel_arrangement.csv` (3 choices). */
export const VS_TYPE_FUEL_ARRANGEMENT = [
  "GROUND_FUELS",
  "SURFACE_FUELS",
  "CROWN_FUELS"
] as const;
export type TypeFuelArrangement = typeof VS_TYPE_FUEL_ARRANGEMENT[number];

/** Value set `type_fuel_distribution.csv` (2 choices). */
export const VS_TYPE_FUEL_DISTRIBUTION = [
  "CONTINUOUS_HORIZONTAL",
  "LADDER_VERTICAL"
] as const;
export type TypeFuelDistribution = typeof VS_TYPE_FUEL_DISTRIBUTION[number];

/** Value set `type_fuel_size.csv` (5 choices). */
export const VS_TYPE_FUEL_SIZE = [
  "LESS_THAN_0.25",
  "0.25_TO_1",
  "1_TO_3",
  "3_TO_8",
  "GREATER_THAN_8"
] as const;
export type TypeFuelSize = typeof VS_TYPE_FUEL_SIZE[number];

/** Value set `type_general_fire_cause.csv` (4 choices). */
export const VS_TYPE_GENERAL_FIRE_CAUSE = [
  "NATURAL",
  "ACCIDENTAL",
  "INCENDIARY",
  "UNDETERMINED"
] as const;
export type TypeGeneralFireCause = typeof VS_TYPE_GENERAL_FIRE_CAUSE[number];

/** Value set `type_hazsit_type.csv` (9 choices). */
export const VS_TYPE_HAZSIT_TYPE = [
  "SPILL",
  "LEAK",
  "FIRE",
  "EXPLOSION",
  "MATERIAL_ENTERED_WATERWAY",
  "SOLID_DISPERSION",
  "VAPOR_GAS_DISPERSION",
  "ENVIRONMENTAL_DAMAGE",
  "NO_RELEASE"
] as const;
export type TypeHazsitType = typeof VS_TYPE_HAZSIT_TYPE[number];

/** Value set `type_health_problems.csv` (19 choices). */
export const VS_TYPE_HEALTH_PROBLEMS = [
  "HEART_FAILURE",
  "COPD",
  "ASTHMA",
  "CARDIAC_ARRHYTHMIA",
  "HYPERTENSION",
  "KIDNEY_DISEASE",
  "CANCER",
  "CVA_STROKE",
  "MYOCARDIAL_INFARCTION",
  "SEIZURE_DISORDER",
  "DIABETES",
  "POST_SURGERY",
  "OPEN_WOUNDS",
  "PAIN_CONTROL",
  "PSYCHOLOGICAL_BEHAVIORAL_HEALTH",
  "SUBSTANCE_USE_DISORDER",
  "PHYSICAL_LIMITATIONS_DISABILITY",
  "OTHER",
  "NONE"
] as const;
export type TypeHealthProblems = typeof VS_TYPE_HEALTH_PROBLEMS[number];

/** Value set `type_human_factors.csv` (15 choices). */
export const VS_TYPE_HUMAN_FACTORS = [
  "HOARDING_DISORDER",
  "INTELLECTUAL_DISABILITY",
  "PHYSICAL_DISABILITY",
  "ILLICIT_DRUG_USE",
  "ALCOHOL_USE",
  "ASLEEP",
  "JUVENILE_BEHAVIOR",
  "ELDERLY_AGING",
  "HOMELESSNESS",
  "MEDICAL_CONDITION",
  "MENTAL_HEALTH",
  "CULTURAL_RELIGIOUS_BEHAVIOR",
  "MEDICAL_OXYGEN",
  "NONE",
  "OTHER"
] as const;
export type TypeHumanFactors = typeof VS_TYPE_HUMAN_FACTORS[number];

/** Value set `type_hydrant_impediment.csv` (17 choices). */
export const VS_TYPE_HYDRANT_IMPEDIMENT = [
  "OBSTRUCTION",
  "VISUAL_BARRIER",
  "BROKEN_STEM",
  "HARD_OPEN",
  "HARD_CLOSE",
  "LEAKING",
  "CAP_MISSING",
  "CAP_NOT_REMOVABLE",
  "CHATTER",
  "DEFECTIVE_THREAD",
  "DRAIN_DEFECTIVE",
  "FROZEN",
  "NON_FUNCTION_FROST_JACKET",
  "CHAINS_MISSING",
  "NEEDS_PAINT",
  "MARKER_MISSING",
  "NEEDS_GREASE"
] as const;
export type TypeHydrantImpediment = typeof VS_TYPE_HYDRANT_IMPEDIMENT[number];

/** Value set `type_indoor_outdoor.csv` (2 choices). */
export const VS_TYPE_INDOOR_OUTDOOR = [
  "INDOOR",
  "OUTDOOR"
] as const;
export type TypeIndoorOutdoor = typeof VS_TYPE_INDOOR_OUTDOOR[number];

/** Value set `type_initial_detection.csv` (13 choices). */
export const VS_TYPE_INITIAL_DETECTION = [
  "SMOKE_ALARM",
  "HEAT_ALARM",
  "AUTOMATIC_SUPPRESSION",
  "VISUAL_SIGHTING",
  "SPECIALTY_DETECTOR",
  "MANUAL_ACTIVATION",
  "ODOR",
  "PET",
  "AUDIBLE_NOISE",
  "ALERTED_BY_PERSON",
  "NO_INITIAL_DETECTION",
  "UNKNOWN",
  "OTHER"
] as const;
export type TypeInitialDetection = typeof VS_TYPE_INITIAL_DETECTION[number];

/** Value set `type_injury.csv` (51 choices). */
export const VS_TYPE_INJURY = [
  "SMOKE_INHALATION",
  "HAZARDOUS_FUMES_INHALATION",
  "DIFFICULTY_BREATHING",
  "BURNS_THERMAL",
  "BURNS_SCALD",
  "BURNS_CHEMICAL",
  "BURNS_ELECTRIC",
  "CUT_LACERATION",
  "STAB_PUNCTURE_WOUND",
  "GUNSHOT_PROJECTILE_WOUND",
  "CONTUSION_BRUISE",
  "ABRASION",
  "DISLOCATION",
  "STRAIN_SPRAIN",
  "FRACTURE",
  "SWELLING",
  "CRUSHING",
  "AMPUTATION",
  "CARDIAC_SYMPTOMS",
  "CARDIAC_ARREST",
  "STROKE",
  "RESPIRATORY_ARREST",
  "CHILLS",
  "FEVER",
  "NAUSEA",
  "VOMITING",
  "NUMBNESS_TINGLING_PARESTHESIA",
  "PARALYSIS",
  "FROSTBITE",
  "PREGNANCY_CHILDBRITH_MISCARRIAGE",
  "EYE_TRAUMA",
  "DROWNING",
  "FOREIGN_BODY_OBSTRUCTION",
  "ELECTRIC_SHOCK",
  "POISON",
  "CONVULSION_SEIZURE",
  "INTERNAL_TRAUMA",
  "HEMORRHAGING_INTERNAL_BLEEDING",
  "DISORIENTATION",
  "DIZZINESS_FAINTING_WEAKNESS",
  "HEAT_STROKE",
  "DEHYDRATION",
  "ALLERGIC_REACTION",
  "DRUG_OVERDOSE_DRUG_RELATED",
  "ALCOHOL_IMIPAIRMENT",
  "EMOTIONAL_PSYCHOLOGICAL_DISTRESS",
  "MENTAL_HEALTH",
  "SHOCK",
  "UNCONSCIOUS",
  "PAIN_ONLY",
  "OTHER"
] as const;
export type TypeInjury = typeof VS_TYPE_INJURY[number];

/** Value set `type_injury_cause.csv` (12 choices). */
export const VS_TYPE_INJURY_CAUSE = [
  "FALL",
  "JUMP",
  "SLIP_TRIP",
  "EXPOSURE",
  "STRUCK_ASSAULTED_PERSON_ANIMAL_OBJECT",
  "CONTACT_WITH_OBJECT_BY_PERSONNEL",
  "OVEREXERTION_STRAIN",
  "TRAPPED_CAUGHT",
  "VEHICLE_COLLISION_ACCIDENT",
  "STRUCK_BY_VEHICLE",
  "MEDICAL_EVENT",
  "OTHER"
] as const;
export type TypeInjuryCause = typeof VS_TYPE_INJURY_CAUSE[number];

/** Value set `type_intersitial_space.csv` (6 choices). */
export const VS_TYPE_INTERSITIAL_SPACE = [
  "DUCT",
  "FLOOR_ASSEMBLY",
  "CRAWL_SPACE",
  "CEILING",
  "ATTIC",
  "OTHER"
] as const;
export type TypeIntersitialSpace = typeof VS_TYPE_INTERSITIAL_SPACE[number];

/** Value set `type_location_use.csv` (78 choices). */
export const VS_TYPE_LOCATION_USE = [
  "AGRICULTURE_STRUCT: STORAGE_SILO",
  "AGRICULTURE_STRUCT: FARM_BUILDING",
  "AGRICULTURE_STRUCT: AUCTION_FEEDLOT",
  "AGRICULTURE_STRUCT: ANIMAL_PROCESSING",
  "AGRICULTURE_STRUCT: VETERINARY_LIVESTOCK",
  "ASSEMBLY: COMMUNITY_CENTER",
  "ASSEMBLY: CONVENTION_CENTER",
  "ASSEMBLY: INDOOR_ARENA",
  "ASSEMBLY: OUTDOOR_ARENA_AMPHITHEATER_PARK",
  "ASSEMBLY: TEMP_OUTDOOR_STRUCT_EVENT",
  "ASSEMBLY: RELIGIOUS",
  "ASSEMBLY: MUSEUM_EXHIBIT_HALL_LIBRARY",
  "COMMERCIAL: ENTERTAINMENT_RECREATION",
  "COMMERCIAL: RESTAURANT_CAFE",
  "COMMERCIAL: BAR_NIGHTCLUB",
  "COMMERCIAL: OFFICE_OTHER_TECHNICAL_SERVICES",
  "COMMERCIAL: RETAIL_WHOLESALE_TRADE",
  "COMMERCIAL: THEATERS_STUDIO",
  "COMMERCIAL: VEHICLE_REPAIR_SERVICES",
  "COMMERCIAL: VEHICLE_FUELING_CHARGING_STATION",
  "COMMERCIAL: VETERINARY_PET",
  "EDUCATION: COLLEGES_UNIVERSITIES",
  "EDUCATION: OTHER_EDUCATIONAL_BUILDINGS",
  "EDUCATION: PREK_DAYCARE",
  "EDUCATION: K_12_SCHOOLS",
  "GOVERNMENT: POLICE_EMERGENCY_STATION",
  "GOVERNMENT: FIRE_MEDICAL_STATION",
  "GOVERNMENT: JAIL_PRISON_REFORMATORY",
  "GOVERNMENT: GENERAL_SERVICES",
  "GOVERNMENT: NON_CIVILIAN_STRUCTURES",
  "INDUSTRIAL: CHEMICAL",
  "INDUSTRIAL: COLD_STORAGE",
  "INDUSTRIAL: FOOD_DRUGS",
  "INDUSTRIAL: HEAVY",
  "INDUSTRIAL: LIGHT",
  "INDUSTRIAL: METALS_MINERALS_PROCESSING",
  "HEALTH_CARE: MEDICAL_OFFICE_CLINIC",
  "HEALTH_CARE: HOSPITAL_24_HOUR_MEDICAL_FACILITIES",
  "HEALTH_CARE: NURSING_HOME_ASSISTED_LIVING_RESIDENCE_ONSITE",
  "HEALTH_CARE: ALCOHOL_DRUG_REHABILITATION_CENTER",
  "RESIDENTIAL: CONGREGATE_HOUSING",
  "RESIDENTIAL: MANUFACTURED_MOBILE_HOME",
  "RESIDENTIAL: DETATCHED_SINGLE_FAMILY_DWELLING",
  "RESIDENTIAL: ATTACHED_SINGLE_FAMILY_DWELLING",
  "RESIDENTIAL: MULTI_FAMILY_LOWRISE_DWELLING",
  "RESIDENTIAL: MULTI_FAMILY_MIDRISE_DWELLING",
  "RESIDENTIAL: MULTI_FAMILY_HIGHRISE_DWELLING",
  "RESIDENTIAL: DETATCHED_GARAGE",
  "RESIDENTIAL: UNHOUSED_TEMPORARY_SHELTER",
  "RESIDENTIAL: TEMPORARY_LODGING_HOTEL_MOTEL",
  "UNCLASSIFIED: UNCLASSIFIED",
  "UTILITY_MISC: TRANSPORTATION_STATION_HUB_AREA",
  "UTILITY_MISC: ENERGY_FACILITY_INFRASTRUCTURE",
  "UTILITY_MISC: WATER_SANITATION_FACILITY_INFRASTRUCTURE",
  "UTILITY_MISC: TRASH_RECYCLING_FACILITY",
  "STORAGE: STORAGE_PORTABLE_BUILDING",
  "STORAGE: STORAGE_MULTI_TENANT",
  "STORAGE: STORAGE_SINGLE_TENANT",
  "ROADWAY_ACCESS: SIDEWALK",
  "ROADWAY_ACCESS: STREET",
  "ROADWAY_ACCESS: HIGHWAY_INTERSTATE",
  "ROADWAY_ACCESS: LIMITED_ACCESS_HIGHWAY_INTERSTATE",
  "ROADWAY_ACCESS: BRIDGE",
  "ROADWAY_ACCESS: TUNNEL",
  "ROADWAY_ACCESS: RAILROAD_RAILYARD",
  "ROADWAY_ACCESS: PARKING_LOT_GARAGE",
  "OUTDOOR: GROUND_VACANT_LAND",
  "OUTDOOR: CAMP_SITE",
  "OUTDOOR: PLAYGROUND_PARK_RECREATIONAL_AREA",
  "OUTDOOR: HIKING_TRAIL",
  "OUTDOOR: ORCHARD_CROPS_FARMLAND",
  "OUTDOOR: FOREST_GRASSLANDS_WOODLAND_WILDLAND_AREAS",
  "OUTDOOR: WATERFRONT",
  "OUTDOOR: OPEN_WATER",
  "OUTDOOR_INDUSTRIAL: DUMP_LANDFILL",
  "OUTDOOR_INDUSTRIAL: INDUSTRIAL_YARD",
  "OUTDOOR_INDUSTRIAL: MINE",
  "OUTDOOR_INDUSTRIAL: CONSTRUCTION_SITE"
] as const;
export type TypeLocationUse = typeof VS_TYPE_LOCATION_USE[number];

/** Value set `type_lot_units.csv` (2 choices). */
export const VS_TYPE_LOT_UNITS = [
  "SQUARE_FEET",
  "ACRES"
] as const;
export type TypeLotUnits = typeof VS_TYPE_LOT_UNITS[number];

/** Value set `type_nfpa_rating.csv` (5 choices). */
export const VS_TYPE_NFPA_RATING = [
  "BLUE",
  "GREEN",
  "ORANGE",
  "RED",
  "BLACK"
] as const;
export type TypeNfpaRating = typeof VS_TYPE_NFPA_RATING[number];

/** Value set `type_outdoor_activities.csv` (19 choices). */
export const VS_TYPE_OUTDOOR_ACTIVITIES = [
  "WEATHER",
  "SUPPRESSION_ACTIVITY",
  "CONSTRUCTION",
  "ELECTRICAL_UTILITIES",
  "FARMING_RANCHING",
  "GOVERNMENTAL_TRIBAL_ACTIVITIES",
  "HUNTING_TRAPPING_FISHING",
  "LAW_ENFORCEMENT",
  "LOGGING_FORESTRY",
  "MILITARY",
  "MINING_EXTRACTION",
  "MOTORIST",
  "OTHER_UTILITIES",
  "PRIVATE_RESIDENTIAL",
  "RAILROAD",
  "RECREATION",
  "TRANSIENT",
  "OTHER",
  "UNKNOWN"
] as const;
export type TypeOutdoorActivities = typeof VS_TYPE_OUTDOOR_ACTIVITIES[number];

/** Value set `type_outdoor_cause.csv` (137 choices). */
export const VS_TYPE_OUTDOOR_CAUSE = [
  "NATURAL: LIGHTNING",
  "NATURAL: VOLCANO",
  "NATURAL: SPONTANEOUS_COMBUSTION",
  "NATURAL: OTHER",
  "NATURAL: ANIMAL",
  "NATURAL: UNKNOWN",
  "DEBRIS_OPEN_BURNING: BRANDING",
  "DEBRIS_OPEN_BURNING: BURN_BARREL",
  "DEBRIS_OPEN_BURNING: BURNING_PERSONAL_ITEMS",
  "DEBRIS_OPEN_BURNING: DISTRESS_SIGNAL_FIRE",
  "DEBRIS_OPEN_BURNING: DITCH_FENCE_LINE_BURNING",
  "DEBRIS_OPEN_BURNING: ESCAPED_PRESCRIBED_BURN",
  "DEBRIS_OPEN_BURNING: FIELD_AGRICULTURAL_BURNING",
  "DEBRIS_OPEN_BURNING: HAND_PILE_SLASH",
  "DEBRIS_OPEN_BURNING: MACHINE_PILE_SLASH",
  "DEBRIS_OPEN_BURNING: OPEN_TRASH_BURNING",
  "DEBRIS_OPEN_BURNING: OTHER_LAND_CLEARING",
  "DEBRIS_OPEN_BURNING: PEST_CONTROL_DETERRENT_SMOKE_OUT",
  "DEBRIS_OPEN_BURNING: RIGHT_OF_WAY_CLEARING",
  "DEBRIS_OPEN_BURNING: YARD_DEBRIS",
  "DEBRIS_OPEN_BURNING: OTHER",
  "DEBRIS_OPEN_BURNING: UNKNOWN",
  "EQUIPMENT_VEHICLE_USE: ELECTRIC_MOTOR_POWER_TOOLS_BATTERY",
  "EQUIPMENT_VEHICLE_USE: TRAILER",
  "EQUIPMENT_VEHICLE_USE: AIRCRAFT",
  "EQUIPMENT_VEHICLE_USE: CHAINSAW_BRUSH_SAW_WEED_TRIMMER",
  "EQUIPMENT_VEHICLE_USE: COMMERCIAL_TRANSPORT_VEHICLE",
  "EQUIPMENT_VEHICLE_USE: HEAVY_EQUIPMENT_IMPLEMENTS",
  "EQUIPMENT_VEHICLE_USE: OHV_ATV_MOTORCYCLE",
  "EQUIPMENT_VEHICLE_USE: PASSENGER_VEHICLE_MOTORIZED_RV",
  "EQUIPMENT_VEHICLE_USE: TRACTOR_MOWER_BRUSH_HOG",
  "EQUIPMENT_VEHICLE_USE: UAS_MODEL_ROCKETS_AIRPLANES",
  "EQUIPMENT_VEHICLE_USE: WATERCRAFT",
  "EQUIPMENT_VEHICLE_USE: HOT_WORK",
  "EQUIPMENT_VEHICLE_USE: OTHER_SMALL_ENGINE_EQUIPMENT",
  "EQUIPMENT_VEHICLE_USE: OTHER",
  "EQUIPMENT_VEHICLE_USE: UNKNOWN",
  "FIREARMS_EXPLOSIVES: BLACK_POWDER_MUZZLE_LOADING",
  "FIREARMS_EXPLOSIVES: BLASTING",
  "FIREARMS_EXPLOSIVES: EXPLODING_TARGET_SHOOTING",
  "FIREARMS_EXPLOSIVES: DENTONATED_CORD",
  "FIREARMS_EXPLOSIVES: FLARES_FUSES",
  "FIREARMS_EXPLOSIVES: INERT_TARGET_SHOOTING",
  "FIREARMS_EXPLOSIVES: MILITARY_ORDINANCE",
  "FIREARMS_EXPLOSIVES: NON_MILITARY_TRACER",
  "FIREARMS_EXPLOSIVES: AMMONIUM_NITRATE_FUEL_OIL",
  "FIREARMS_EXPLOSIVES: IMPROVISED_EXPLOSIVE_DEVICE",
  "FIREARMS_EXPLOSIVES: PIPE_BOMB",
  "FIREARMS_EXPLOSIVES: OTHER_EXPLOSIVES",
  "FIREARMS_EXPLOSIVES: OTHER",
  "FIREARMS_EXPLOSIVES: UNKNOWN",
  "FIREWORKS: EXPLOSIVES M_80",
  "FIREWORKS: EXPLOSIVES M_100",
  "FIREWORKS: EXPLOSIVES M_1000",
  "FIREWORKS: EXPLOSIVES 1_4_Stick",
  "FIREWORKS: EXPLOSIVES CHERRY_BOMB",
  "FIREWORKS: EXPLOSIVES SILVER_SALUTE",
  "FIREWORKS: EXPLOSIVES SPARKLER_BOMB",
  "FIREWORKS: EXPLOSIVES ALTERED_CONSUMER_FIREWORKS",
  "FIREWORKS: EXPLOSIVES HOMEMADE_EXPLOSIVE_DEVICE",
  "FIREWORKS: PROFESSIONAL_DISPLAY OUTDOOR_AERIAL_SHELL",
  "FIREWORKS: PROFESSIONAL_DISPLAY OUTDOOR_LOW_LEVEL",
  "FIREWORKS: PROFESSIONAL_DISPLAY OUTDOOR_GROUND_LEVEL",
  "FIREWORKS: PROFESSIONAL_DISPLAY OUTDOOR_PROXIMATE",
  "FIREWORKS: PROFESSIONAL_DISPLAY INDOOR_PROXIMATE",
  "FIREWORKS: CONSUMER_AERIAL COMETS_MINES_SHELLS",
  "FIREWORKS: CONSUMER_AERIAL RELOADABLE_TUBE_AERIAL",
  "FIREWORKS: CONSUMER_AERIAL ROMAN_CANDLES",
  "FIREWORKS: CONSUMER_AERIAL ROCKETS",
  "FIREWORKS: CONSUMER_AERIAL MISSLES",
  "FIREWORKS: CONSUMER_AERIAL HELICOPTERS",
  "FIREWORKS: CONSUMER_AERIAL OTHER_SPECIALTY_ITEMS",
  "FIREWORKS: CONSUMER_NON_AERIAL COMBINAITON_ITEMS",
  "FIREWORKS: CONSUMER_NON_AERIAL FOUNTAINS",
  "FIREWORKS: CONSUMER_NON_AERIAL GROUND_SPINNERS",
  "FIREWORKS: CONSUMER_NON_AERIAL HANDHELD_SPARKLERS",
  "FIREWORKS: CONSUMER_NON_AERIAL WHEELS",
  "FIREWORKS: CONSUMER_NON_AERIAL FIRECRACKERS",
  "FIREWORKS: CONSUMER_NON_AERIAL CHASERS",
  "FIREWORKS: CONSUMER_NON_AERIAL OTHER_SPECIALTY_ITEMS",
  "FIREWORKS: DEREGULATED_NOVELTIES SNAP_CAPS",
  "FIREWORKS: DEREGULATED_NOVELTIES PARTY_POPPERS",
  "FIREWORKS: DEREGULATED_NOVELTIES SMOKE_BALLS",
  "FIREWORKS: DEREGULATED_NOVELTIES SNAKES",
  "FIREWORKS: DEREGULATED_NOVELTIES WIRE_CORE_SPARKLERS",
  "FIREWORKS: MODEL_AMATEUR_ROCKETS",
  "FIREWORKS: OTHER",
  "FIREWORKS: UNKNOWN",
  "POWER_GEN_TRANS_DIST: ELECTRICAL_TRANSMISSION_DISTRIBUTION_SYSTEMS",
  "POWER_GEN_TRANS_DIST: OIL_GAS_PRODUCTION_TRANSPORTATION",
  "POWER_GEN_TRANS_DIST: SOLAR_UTILITY_SYSTEM",
  "POWER_GEN_TRANS_DIST: ENERGY_STORAGE_SYSTEM",
  "POWER_GEN_TRANS_DIST: WIND_TURBINE_WINDMILLS_UTLITY_SYSTEM",
  "POWER_GEN_TRANS_DIST: OTHER",
  "POWER_GEN_TRANS_DIST: UNKNOWN",
  "RAILROAD_OPS_MAINTENANCE: BRAKES",
  "RAILROAD_OPS_MAINTENANCE: DERAILMENT",
  "RAILROAD_OPS_MAINTENANCE: DYNAMIC_GRID_FAILURE",
  "RAILROAD_OPS_MAINTENANCE: EXHAUST_PARTICLES",
  "RAILROAD_OPS_MAINTENANCE: RAIL_GRINDING",
  "RAILROAD_OPS_MAINTENANCE: RIGHT_OF_WAY_VEGETATION_MAINTENANCE",
  "RAILROAD_OPS_MAINTENANCE: TRACK_REPLACEMENT",
  "RAILROAD_OPS_MAINTENANCE: HOT_WORK",
  "RAILROAD_OPS_MAINTENANCE: OTHER_MECHANICAL_FAILURE",
  "RAILROAD_OPS_MAINTENANCE: OTHER",
  "RAILROAD_OPS_MAINTENANCE: UNKNOWN",
  "RECREATION_CEREMONY: BARBEQUE_SMOKER",
  "RECREATION_CEREMONY: BONFIRE_PARTY_FIRE",
  "RECREATION_CEREMONY: CAMPFIRE",
  "RECREATION_CEREMONY: CEREMONIAL_FIRE",
  "RECREATION_CEREMONY: GAS_COOKING_WARMING_LIGHTING_DEVICE",
  "RECREATION_CEREMONY: LUMINARY",
  "RECREATION_CEREMONY: OUTDOOR_OVEN_FIREPLACE_METAL_FIRE_RING",
  "RECREATION_CEREMONY: OTHER",
  "RECREATION_CEREMONY: UNKNOWN",
  "SMOKING_MATERIALS_ILLICIT_DRUGS: CIGAR_CIGARETTE_PIPE",
  "SMOKING_MATERIALS_ILLICIT_DRUGS: ELECTRONIC_CIGARETTE",
  "SMOKING_MATERIALS_ILLICIT_DRUGS: DRUG_PARAPHERNALIA",
  "SMOKING_MATERIALS_ILLICIT_DRUGS: ILLEGAL_SUBSTANCE_MANUFACTURE",
  "SMOKING_MATERIALS_ILLICIT_DRUGS: OTHER",
  "SMOKING_MATERIALS_ILLICIT_DRUGS: UNKNOWN",
  "MISUSE_FIRE: LIGHTER_MATCHES",
  "MISUSE_FIRE: GLASS_REFRACTION_MAGNIFYING_GLASS",
  "MISUSE_FIRE: INCENDIARY_DEVICE",
  "MISUSE_FIRE: FLINT_FRICTION",
  "MISUSE_FIRE: OTHER",
  "MISUSE_FIRE: UNKNOWN",
  "ARSON: DEVICE",
  "ARSON: HOT_SET",
  "ARSON: OTHER",
  "ARSON: UNKNOWN",
  "STRUCTURE: SPREAD_FROM_STRUCTURE",
  "STRUCTURE: ELECTRIC_FENCE",
  "UNDETERMINED: UNDER_INVESTIGATION",
  "UNDETERMINED: NOT_INVESTIGATED",
  "UNDETERMINED: ORIGIN_AND_OR_CAUSE_NOT_IDENTIFIED",
  "UNDETERMINED: ORIGIN_DESTROYED"
] as const;
export type TypeOutdoorCause = typeof VS_TYPE_OUTDOOR_CAUSE[number];

/** Value set `type_product_contribution.csv` (3 choices). */
export const VS_TYPE_PRODUCT_CONTRIBUTION = [
  "IGNITION",
  "RELEASE",
  "SPREAD"
] as const;
export type TypeProductContribution = typeof VS_TYPE_PRODUCT_CONTRIBUTION[number];

/** Value set `type_rate_of_spread.csv` (5 choices). */
export const VS_TYPE_RATE_OF_SPREAD = [
  "SLOW",
  "MODERATE",
  "DANGEROUS",
  "CRITICAL",
  "UNKNOWN"
] as const;
export type TypeRateOfSpread = typeof VS_TYPE_RATE_OF_SPREAD[number];

/** Value set `type_reason_not_engaged.csv` (10 choices). */
export const VS_TYPE_REASON_NOT_ENGAGED = [
  "NO_ONE_HOME",
  "MINOR_HOME_ALONE",
  "OCCUPANT_REFUSED",
  "LANGUAGE_BARRIER",
  "VACANT_HOME",
  "UNSAFE_TO_APPROACH",
  "NO_TRESPASSING_SIGNS",
  "LOCKED_GATE",
  "HOSTILE_PERSON",
  "REFUSED"
] as const;
export type TypeReasonNotEngaged = typeof VS_TYPE_REASON_NOT_ENGAGED[number];

/** Value set `type_referral.csv` (5 choices). */
export const VS_TYPE_REFERRAL = [
  "ED",
  "OTHER_MEDICAL_PERSONNEL",
  "FD_EMS",
  "SELF",
  "OTHER"
] as const;
export type TypeReferral = typeof VS_TYPE_REFERRAL[number];

/** Value set `type_relative_position.csv` (6 choices). */
export const VS_TYPE_RELATIVE_POSITION = [
  "VALLEY_BOTTOM",
  "LOWER_SLOPE",
  "MID_SLOPE",
  "UPPER_SLOPE",
  "RIDGE_TOP",
  "UNKNOWN"
] as const;
export type TypeRelativePosition = typeof VS_TYPE_RELATIVE_POSITION[number];

/** Value set `type_roof_material.csv` (10 choices). */
export const VS_TYPE_ROOF_MATERIAL = [
  "METAL",
  "ASPHALT_SHINGLES",
  "WOOD_SHINGLES",
  "COMPOSITE_SHINGLES",
  "CLAY_TILES",
  "CONCRETE_TILES",
  "SOLAR_TILES",
  "MEMBRANE",
  "SLATE",
  "OTHER"
] as const;
export type TypeRoofMaterial = typeof VS_TYPE_ROOF_MATERIAL[number];

/** Value set `type_service_type.csv` (3 choices). */
export const VS_TYPE_SERVICE_TYPE = [
  "VOLUNTEER",
  "CAREER",
  "COMBINATION"
] as const;
export type TypeServiceType = typeof VS_TYPE_SERVICE_TYPE[number];

/** Value set `type_services_referred.csv` (15 choices). */
export const VS_TYPE_SERVICES_REFERRED = [
  "ADULT_PROTECTIVE_SERVICES",
  "CHILD_PROTECTIVE_SERVICES",
  "OTHER_SOCIAL_SERVICES",
  "HOUSING_SERVICES",
  "ANIMAL_SERVICES",
  "LAW_ENFORCEMENT",
  "UTILITIES",
  "FOOD_SERVICES",
  "MENTAL_HEALTH_SERVICES",
  "PARAMEDICINE",
  "CODE_ENFORCEMENT",
  "YOUTH_FIRE_SETTER_PROGRAM",
  "SUBSTANCE_TREATMENT",
  "MEDICAL_SERVICES",
  "OTHER"
] as const;
export type TypeServicesReferred = typeof VS_TYPE_SERVICES_REFERRED[number];

/** Value set `type_severity.csv` (5 choices). */
export const VS_TYPE_SEVERITY = [
  "MINOR",
  "MODERATE",
  "SEVERE",
  "LIFE_THREATENING",
  "DEATH"
] as const;
export type TypeSeverity = typeof VS_TYPE_SEVERITY[number];

/** Value set `type_shift.csv` (11 choices). */
export const VS_TYPE_SHIFT = [
  "24_ON_24_OFF",
  "24_ON_48_OFF",
  "24_ON_72_OFF",
  "48_ON_96_OFF",
  "72_ON_96_OFF",
  "10_ON_14_OFF",
  "9_ON_15_OFF",
  "12_ON_12_OFF",
  "8_HRS_5_DAYS",
  "10_HRS_4_DAYS",
  "OTHER"
] as const;
export type TypeShift = typeof VS_TYPE_SHIFT[number];

/** Value set `type_target_audience.csv` (8 choices). */
export const VS_TYPE_TARGET_AUDIENCE = [
  "PARENTS",
  "K_12",
  "COLLEGE_STUDENTS",
  "65_OVER",
  "HOME_OWNERS",
  "HOME_RENTERS",
  "GENERAL_PUBLIC",
  "OTHER"
] as const;
export type TypeTargetAudience = typeof VS_TYPE_TARGET_AUDIENCE[number];

/** Value set `type_traumatic_event.csv` (12 choices). */
export const VS_TYPE_TRAUMATIC_EVENT = [
  "ACTIVE SHOOTER",
  "NON-FIREFIGHTER FATALITY",
  "FIREFIGHTER FATALITY",
  "FIREFIGHTER NON-FATAL INJURY",
  "FIREFIGHTER NEAR MISS",
  "VIOLENCE AGAINST RESPONDER",
  "PEDIATRIC CPR",
  "HOMICIDE SUICIDE VIOLENT DEATH",
  "DANGER THREAT TO LIFE",
  "SEXUAL VIOLENCE AGAINST RESPONDER",
  "DISASTER_RESPONSE",
  "MASS_CASUALTY_INCIDENT"
] as const;
export type TypeTraumaticEvent = typeof VS_TYPE_TRAUMATIC_EVENT[number];

/** Value set `type_vehicle_powertrain.csv` (5 choices). */
export const VS_TYPE_VEHICLE_POWERTRAIN = [
  "INTERNAL_COMBUSTION",
  "ELECTRIC",
  "PLUG_IN_HYBRID",
  "HYBRID",
  "COMPRESSED_NATURAL_GAS"
] as const;
export type TypeVehiclePowertrain = typeof VS_TYPE_VEHICLE_POWERTRAIN[number];

/** Value set `type_vehicle_type.csv` (25 choices). */
export const VS_TYPE_VEHICLE_TYPE = [
  "AUTOMOBILE",
  "AIRPLANE",
  "HELICOPTER",
  "AERIAL_OTHER",
  "BOAT_SHIP",
  "MOTORCYCLE",
  "RAIL",
  "TRAILER",
  "FARM",
  "FOOD_TRUCK",
  "CONSTRUCTION",
  "MOTORIZED_HOME",
  "BUS",
  "ATV",
  "SPORT_UTILITY",
  "MILITARY_OTHER",
  "UTILITY_VEHICLE",
  "AERIAL_LIFT_PLATFORM",
  "TOW_TRUCK",
  "VAN",
  "CARGO",
  "FREIGHT",
  "SCOOTER_MOPED",
  "BICYCLE",
  "JET_SKI"
] as const;
export type TypeVehicleType = typeof VS_TYPE_VEHICLE_TYPE[number];

/** Value set `type_vents.csv` (5 choices). */
export const VS_TYPE_VENTS = [
  "MESH SCREEN <= 1/8 \"",
  "MESH SCREEN > 1/8 \"",
  "NO VENTS",
  "UNSCREENED",
  "UNKNOWN"
] as const;
export type TypeVents = typeof VS_TYPE_VENTS[number];

/** Value set `type_window_damage.csv` (4 choices). */
export const VS_TYPE_WINDOW_DAMAGE = [
  "SHATTERED",
  "CRACKED",
  "MELTED_WARPED",
  "NO_DAMAGE"
] as const;
export type TypeWindowDamage = typeof VS_TYPE_WINDOW_DAMAGE[number];

/** Value set `type_window_panes.csv` (5 choices). */
export const VS_TYPE_WINDOW_PANES = [
  "DOUBLE PANE",
  "TRIPLE PANE",
  "SINGLE PANE",
  "NO WINDOWS",
  "UNKNOWN"
] as const;
export type TypeWindowPanes = typeof VS_TYPE_WINDOW_PANES[number];

/** Value set `type_zoning.csv` (8 choices). */
export const VS_TYPE_ZONING = [
  "RESIDENTIAL",
  "COMMERCIAL",
  "INDUSTRIAL",
  "AGRICULTURAL",
  "RURAL",
  "MIXED_USE",
  "INSTITUTION_PUBLIC",
  "WUI"
] as const;
export type TypeZoning = typeof VS_TYPE_ZONING[number];
