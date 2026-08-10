// AUTO-GENERATED from the NERIS data framework. DO NOT EDIT BY HAND.
// Re-run: node scripts/generate.mjs
// Source: github.com/ulfsri/neris-framework

/** NERIS incident-type hierarchy (value_1 → value_2 → value_3). */
export interface NerisIncidentType { l1: string; l2: string; l3: string; label: string; active: boolean; }

export const NERIS_INCIDENT_TYPES: NerisIncidentType[] = [
  {
    "l1": "FIRE",
    "l2": "OUTSIDE_FIRE",
    "l3": "CONSTRUCTION_WASTE",
    "label": "Fire / Outside Fire / Construction Waste",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "OUTSIDE_FIRE",
    "l3": "OTHER_OUTSIDE_FIRE",
    "label": "Fire / Outside Fire / Other Outside Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "OUTSIDE_FIRE",
    "l3": "OUTSIDE_TANK_FIRE",
    "label": "Fire / Outside Fire / Outside Tank Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "OUTSIDE_FIRE",
    "l3": "TRASH_RUBBISH_FIRE",
    "label": "Fire / Outside Fire / Trash / Rubbish Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "OUTSIDE_FIRE",
    "l3": "VEGETATION_GRASS_FIRE",
    "label": "Fire / Outside Fire / Vegetation / Grass Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "OUTSIDE_FIRE",
    "l3": "WILDFIRE_WILDLAND",
    "label": "Fire / Outside Fire / Wildfire - Wildland",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "OUTSIDE_FIRE",
    "l3": "WILDFIRE_URBAN_INTERFACE",
    "label": "Fire / Outside Fire / Wildfire - Urban Interface",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "OUTSIDE_FIRE",
    "l3": "UTILITY_INFRASTRUCTURE_FIRE",
    "label": "Fire / Outside Fire / Utility Infrastructure Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "OUTSIDE_FIRE",
    "l3": "DUMPSTER_OUTDOOR_CONTAINER_FIRE",
    "label": "Fire / Outside Fire / Dumpster / Other Outdoor Container Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "SPECIAL_FIRE",
    "l3": "ESS_FIRE",
    "label": "Fire / Special Fire / ESS Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "SPECIAL_FIRE",
    "l3": "EXPLOSION",
    "label": "Fire / Special Fire / Explosion",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "SPECIAL_FIRE",
    "l3": "INFRASTRUCTURE_FIRE",
    "label": "Fire / Special Fire / Infrastructure Fire (Tunnel, Bridge)",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "STRUCTURE_FIRE",
    "l3": "STRUCTURAL_INVOLVEMENT_FIRE",
    "label": "Fire / Structure Fire / Structural Involvement",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "STRUCTURE_FIRE",
    "l3": "ROOM_AND_CONTENTS_FIRE",
    "label": "Fire / Structure Fire / Room and Contents Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "STRUCTURE_FIRE",
    "l3": "CONFINED_COOKING_APPLIANCE_FIRE",
    "label": "Fire / Structure Fire / Confined Cooking / Appliance Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "STRUCTURE_FIRE",
    "l3": "CHIMNEY_FIRE",
    "label": "Fire / Structure Fire / Chimney Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "TRANSPORTATION_FIRE",
    "l3": "AIRCRAFT_FIRE",
    "label": "Fire / Transportation Fire / Aircraft Emergency",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "TRANSPORTATION_FIRE",
    "l3": "VEHICLE_FIRE_PASSENGER",
    "label": "Fire / Transportation Fire / Vehicle Fire - Passenger",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "TRANSPORTATION_FIRE",
    "l3": "VEHICLE_FIRE_COMMERCIAL",
    "label": "Fire / Transportation Fire / Vehicle Fire - Commercial",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "TRANSPORTATION_FIRE",
    "l3": "VEHICLE_FIRE_RV",
    "label": "Fire / Transportation Fire / Vehicle Fire - RV",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "TRANSPORTATION_FIRE",
    "l3": "VEHICLE_FIRE_FOOD_TRUCK",
    "label": "Fire / Transportation Fire / Vehicle Fire - Food Truck",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "TRANSPORTATION_FIRE",
    "l3": "BOAT_PERSONAL_WATERCRAFT_BARGE_FIRE",
    "label": "Fire / Transportation Fire / Boat / Personal Watercraft / Barge Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "TRANSPORTATION_FIRE",
    "l3": "POWERED_MOBILITY_DEVICE_FIRE",
    "label": "Fire / Transportation Fire / Powered Mobility Device Fire",
    "active": true
  },
  {
    "l1": "FIRE",
    "l2": "TRANSPORTATION_FIRE",
    "l3": "TRAIN_RAIL_FIRE",
    "label": "Fire / Transportation Fire / Train / Rail Fire",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "HAZARD_NONCHEM",
    "l3": "BOMB_THREAT_RESPONSE_SUSPICIOUS_PACKAGE",
    "label": "Hazardous Situation / Hazard Non-Chemical / Bomb Threat / Bomb Response / Suspicious Package",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "HAZARD_NONCHEM",
    "l3": "ELEC_POWER_LINE_DOWN_ARCHING_MALFUNC",
    "label": "Hazardous Situation / Hazard Non-Chemical / Electrical Power Line Down / Arching / Malfunction",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "HAZARD_NONCHEM",
    "l3": "ELEC_HAZARD_SHORT_CIRCUIT",
    "label": "Hazardous Situation / Hazard Non-Chemical / Electrical Hazard / Short Circuit",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "HAZARD_NONCHEM",
    "l3": "MOTOR_VEHICLE_COLLISION",
    "label": "Hazardous Situation / Hazard Non-Chemical / Motor Vehicle Collision",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "HAZARDOUS_MATERIALS",
    "l3": "FUEL_SPILL_ODOR",
    "label": "Hazardous Situation / Hazardous Materials / Fuel Spill / Fuel Odor",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "HAZARDOUS_MATERIALS",
    "l3": "GAS_LEAK_ODOR",
    "label": "Hazardous Situation / Hazardous Materials / Gas Leak / Gas Odor",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "HAZARDOUS_MATERIALS",
    "l3": "CARBON_MONOXIDE_RELEASE",
    "label": "Hazardous Situation / Hazardous Materials / Carbon Monoxide Release",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "HAZARDOUS_MATERIALS",
    "l3": "BIOLOGICAL_RELEASE_INCIDENT",
    "label": "Hazardous Situation / Hazardous Materials / Biological Release / Incident",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "HAZARDOUS_MATERIALS",
    "l3": "RADIOACTIVE_RELEASE_INCIDENT",
    "label": "Hazardous Situation / Hazardous Materials / Radioactive Release / Incident",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "HAZARDOUS_MATERIALS",
    "l3": "HAZMAT_RELEASE_TRANSPORT",
    "label": "Hazardous Situation / Hazardous Materials / Hazardous Material Release (Chemical from Transportation)",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "HAZARDOUS_MATERIALS",
    "l3": "HAZMAT_RELEASE_FACILITY",
    "label": "Hazardous Situation / Hazardous Materials / Hazardous Material Release (Chemical from Fixed Facility)",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "OVERPRESSURE",
    "l3": "RUPTURE_WITHOUT_FIRE",
    "label": "Hazardous Situation / Overpressure / Rupture Without Fire",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "OVERPRESSURE",
    "l3": "NO_RUPTURE",
    "label": "Hazardous Situation / Overpressure / No Rupture",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "INVESTIGATION",
    "l3": "ODOR",
    "label": "Hazardous Situation / Investigation / Odor",
    "active": true
  },
  {
    "l1": "HAZSIT",
    "l2": "INVESTIGATION",
    "l3": "SMOKE_INVESTIGATION",
    "label": "Hazardous Situation / Investigation / Smoke Investigation",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "ABDOMINAL_PAIN",
    "label": "Medical / Illness / Abdominal Pain / Problems",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "ALLERGIC_REACTION_STINGS",
    "label": "Medical / Illness / Allergic Reaction / Stings",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "BACK_PAIN_NON_TRAUMA",
    "label": "Medical / Illness / Back Pain (Non-Trauma)",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "BREATHING_PROBLEMS",
    "label": "Medical / Illness / Breathing Problems",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "CARDIAC_ARREST",
    "label": "Medical / Illness / Cardiac Arrest",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "CHEST_PAIN_NON_TRAUMA",
    "label": "Medical / Illness / Chest Pain (Non-Trauma)",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "CONVULSIONS_SEIZURES",
    "label": "Medical / Illness / Convulsions / Seizures",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "DIABETIC_PROBLEMS",
    "label": "Medical / Illness / Diabetic Problems",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "HEADACHE",
    "label": "Medical / Illness / Headache",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "HEART_PROBLEMS",
    "label": "Medical / Illness / Heart Problems",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "OVERDOSE",
    "label": "Medical / Illness / Overdose / Poisoning",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "PANDEMIC_EPIDEMIC_OUTBREAK",
    "label": "Medical / Illness / Pandemic / Epidemic / Outbreak",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "PREGNANCY_CHILDBIRTH",
    "label": "Medical / Illness / Pregnancy / Childbirth",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "PSYCHOLOGICAL_BEHAVIOR_ISSUES",
    "label": "Medical / Illness / Psychological Behavior Issues",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "SICK_CASE",
    "label": "Medical / Illness / Sick Case",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "STROKE_CVA",
    "label": "Medical / Illness / Stroke / CVA",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "UNCONSCIOUS_VICTIM",
    "label": "Medical / Illness / Unconscious Victim",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "WELL_PERSON_CHECK",
    "label": "Medical / Illness / Well Person Check",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "ALTERED_MENTAL_STATUS",
    "label": "Medical / Illness / Altered Mental Status",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "NAUSEA_VOMITING",
    "label": "Medical / Illness / Nausea / Vomiting",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "UNKNOWN_PROBLEM",
    "label": "Medical / Illness / Unknown Problem",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "ILLNESS",
    "l3": "NO_APPROPRIATE_CHOICE",
    "label": "Medical / Illness / No Appropriate Choice",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "ANIMAL_BITES",
    "label": "Medical / Injury / Trauma / Animal Bites",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "ASSAULT",
    "label": "Medical / Injury / Trauma / Assault",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "BURNS_EXPLOSION",
    "label": "Medical / Injury / Trauma / Burns / Explosion",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "CARBON_MONOXIDE_OTHER_INHALATION_INJURY",
    "label": "Medical / Injury / Trauma / Carbon Monoxide / Other Inhalation Injury",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "CHOKING",
    "label": "Medical / Injury / Trauma / Choking",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "DROWNING_DIVING_SCUBA_ACCIDENT",
    "label": "Medical / Injury / Trauma / Drowning / Diving / SCUBA Accident",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "ELECTROCUTION",
    "label": "Medical / Injury / Trauma / Electrocution",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "EYE_TRAUMA",
    "label": "Medical / Injury / Trauma / Eye Trauma",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "FALL",
    "label": "Medical / Injury / Trauma / Fall",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "HEAT_COLD_EXPOSURE",
    "label": "Medical / Injury / Trauma / Heat / Cold Exposure",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "MOTOR_VEHICLE_COLLISION",
    "label": "Medical / Injury / Trauma / Motor Vehicle Collision",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "INDUSTRIAL_INACCESSIBLE_ENTRAPMENT",
    "label": "Medical / Injury / Trauma / Industrial Accident/Inaccessible Incident/Other Entrapment (Non-Vehicle)",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "POISONING",
    "label": "Medical / Injury / Trauma / Poisoning",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "GUNSHOT_WOUND",
    "label": "Medical / Injury / Trauma / Gunshot Wound",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "HEMORRHAGE_LACERATION",
    "label": "Medical / Injury / Trauma / Hemorrhage / Laceration",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "STAB_PENETRATING_TRAUMA",
    "label": "Medical / Injury / Trauma / Stab / Penetrating Trauma",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "INJURY",
    "l3": "OTHER_TRAUMATIC_INJURY",
    "label": "Medical / Injury / Trauma / Other Traumatic Injury",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "OTHER",
    "l3": "HEALTHCARE_PROFESSIONAL_ADMISSION",
    "label": "Medical / Other / Healthcare Professional Admission",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "OTHER",
    "l3": "MEDICAL_ALARM",
    "label": "Medical / Other / Medical Alarm",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "OTHER",
    "l3": "STANDBY_REQUEST",
    "label": "Medical / Other / Standby Request",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "OTHER",
    "l3": "TRANSFER_INTERFACILITY",
    "label": "Medical / Other / Transfer / Interfacility",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "OTHER",
    "l3": "AIRMEDICAL_TRANSPORT",
    "label": "Medical / Other / Airmedical Transport",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "OTHER",
    "l3": "INTERCEPT_OTHER_UNIT",
    "label": "Medical / Other / Intercept Other Unit",
    "active": true
  },
  {
    "l1": "MEDICAL",
    "l2": "OTHER",
    "l3": "COMMUNITY_PUBLIC_HEALTH",
    "label": "Medical / Other / Community Public Health",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "CITIZEN_ASSIST",
    "l3": "LOST_PERSON",
    "label": "Public Service / Citizen Assist / Lost Person",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "CITIZEN_ASSIST",
    "l3": "PERSON_IN_DISTRESS",
    "label": "Public Service / Citizen Assist / Person In Distress",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "CITIZEN_ASSIST",
    "l3": "CITIZEN_ASSIST_SERVICE_CALL",
    "label": "Public Service / Citizen Assist / Citizen Assist / Service Call",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "CITIZEN_ASSIST",
    "l3": "LIFT_ASSIST",
    "label": "Public Service / Citizen Assist / Lift Assist",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "ALARMS_NONMED",
    "l3": "FIRE_ALARM",
    "label": "Public Service / Alarms (Non Medical) / Fire / Smoke Alarm",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "ALARMS_NONMED",
    "l3": "GAS_ALARM",
    "label": "Public Service / Alarms (Non Medical) / Gas Alarm",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "ALARMS_NONMED",
    "l3": "CO_ALARM",
    "label": "Public Service / Alarms (Non Medical) / CO Alarm",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "ALARMS_NONMED",
    "l3": "OTHER_ALARM",
    "label": "Public Service / Alarms (Non Medical) / Other Alarm",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "DISASTER_WEATHER",
    "l3": "DAMAGE_ASSESSMENT",
    "label": "Public Service / Disaster / Weather / Damage Assessment",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "DISASTER_WEATHER",
    "l3": "WEATHER_RESPONSE",
    "label": "Public Service / Disaster / Weather / Weather Response",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "OTHER",
    "l3": "MOVE_UP",
    "label": "Public Service / Other / Move-up",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "OTHER",
    "l3": "STANDBY",
    "label": "Public Service / Other / Standby",
    "active": true
  },
  {
    "l1": "PUBSERV",
    "l2": "OTHER",
    "l3": "DAMAGED_HYDRANT",
    "label": "Public Service / Other / Damaged Hydrant",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "OUTSIDE",
    "l3": "BACKOUNTRY_RESCUE",
    "label": "Rescue / Outside / Backcountry Rescue",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "OUTSIDE",
    "l3": "CONFINED_SPACE_RESCUE",
    "label": "Rescue / Outside / Confined Space Rescue",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "OUTSIDE",
    "l3": "TRENCH",
    "label": "Rescue / Outside / Trench",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "OUTSIDE",
    "l3": "EXTRICATION_ENTRAPPED",
    "label": "Rescue / Outside / Extrication / Entrapped",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "OUTSIDE",
    "l3": "HIGH_ANGLE_RESCUE",
    "label": "Rescue / Outside / High Angle Rescue",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "OUTSIDE",
    "l3": "LOW_ANGLE_RESCUE",
    "label": "Rescue / Outside / Low Angle Rescue",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "OUTSIDE",
    "l3": "STEEP_ANGLE_RESCUE",
    "label": "Rescue / Outside / Steep Angle Rescue",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "OUTSIDE",
    "l3": "LIMITED_NO_ACCESS",
    "label": "Rescue / Outside / Limited/No Access",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "STRUCTURE",
    "l3": "BUILDING_STRUCTURE_COLLAPSE",
    "label": "Rescue / Structure / Building Collapse / Structure Collapse",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "STRUCTURE",
    "l3": "CONFINED_SPACE_RESCUE",
    "label": "Rescue / Structure / Confined Space Rescue",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "STRUCTURE",
    "l3": "ELEVATOR_ESCALATOR_RESCUE",
    "label": "Rescue / Structure / Elevator / Escalator Rescue",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "STRUCTURE",
    "l3": "EXTRICATION_ENTRAPPED",
    "label": "Rescue / Structure / Extrication / Entrapped",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "TRANSPORTATION",
    "l3": "MOTOR_VEHICLE_EXTRICATION_ENTRAPPED",
    "label": "Rescue / Transportation (Land) / Motor Vehicle Collision Extrication / Entrapment",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "TRANSPORTATION",
    "l3": "TRAIN_RAIL_COLLISION_DERAILMENT",
    "label": "Rescue / Transportation (Land) / Train and Rail Collision / Derailment",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "TRANSPORTATION",
    "l3": "AVIATION_COLLISION_CRASH",
    "label": "Rescue / Transportation (Land) / Aviation Collision / Crash",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "TRANSPORTATION",
    "l3": "AVIATION_STANDBY",
    "label": "Rescue / Transportation (Land) / Aviation Standby",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "WATER",
    "l3": "PERSON_IN_WATER_STANDING",
    "label": "Rescue / Water / Person in Water (Standing Water/Lake)",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "WATER",
    "l3": "PERSON_IN_WATER_SWIFTWATER",
    "label": "Rescue / Water / Person in Water (Swiftwater/River)",
    "active": true
  },
  {
    "l1": "RESCUE",
    "l2": "WATER",
    "l3": "WATERCRAFT_IN_DISTRESS",
    "label": "Rescue / Water / Watercraft in Distress",
    "active": true
  },
  {
    "l1": "NOEMERG",
    "l2": "FALSE_ALARM",
    "l3": "INTENTIONAL_FALSE_ALARM",
    "label": "No Emergency / False Alarm / Intentional False Alarm",
    "active": true
  },
  {
    "l1": "NOEMERG",
    "l2": "FALSE_ALARM",
    "l3": "MALFUNCTIONING_ALARM",
    "label": "No Emergency / False Alarm / Malfunctioning Alarm",
    "active": true
  },
  {
    "l1": "NOEMERG",
    "l2": "FALSE_ALARM",
    "l3": "ACCIDENTAL_ALARM",
    "label": "No Emergency / False Alarm / Accidental Alarm",
    "active": true
  },
  {
    "l1": "NOEMERG",
    "l2": "FALSE_ALARM",
    "l3": "OTHER_FALSE_CALL",
    "label": "No Emergency / False Alarm / Other False Call",
    "active": true
  },
  {
    "l1": "NOEMERG",
    "l2": "FALSE_ALARM",
    "l3": "BOMB_SCARE",
    "label": "No Emergency / False Alarm / Bomb Scare",
    "active": true
  },
  {
    "l1": "NOEMERG",
    "l2": "GOOD_INTENT",
    "l3": "NO_INCIDENT_FOUND_LOCATION_ERROR",
    "label": "No Emergency / Good Intent / No Incident Found Upon Arrival / Location Error",
    "active": true
  },
  {
    "l1": "NOEMERG",
    "l2": "GOOD_INTENT",
    "l3": "CONTROLLED_BURNING_AUTHORIZED",
    "label": "No Emergency / Good Intent / Controlled Burning (Authorized)",
    "active": true
  },
  {
    "l1": "NOEMERG",
    "l2": "GOOD_INTENT",
    "l3": "SMOKE_FROM_NONHOSTILE_SOURCE",
    "label": "No Emergency / Good Intent / Smoke From Nonhostile Source (Smoke Scare)",
    "active": true
  },
  {
    "l1": "NOEMERG",
    "l2": "GOOD_INTENT",
    "l3": "INVESTIGATE_HAZARDOUS_RELEASE",
    "label": "No Emergency / Good Intent / Investigate Hazardous Release (Nothing Found)",
    "active": true
  },
  {
    "l1": "NOEMERG",
    "l2": "CANCELLED",
    "l3": "",
    "label": "No Emergency / Cancelled",
    "active": true
  },
  {
    "l1": "LAWENFORCE",
    "l2": "",
    "l3": "",
    "label": "Law Enforcement Support",
    "active": true
  }
];

export type NerisIncidentLeafType =
  | 'CONSTRUCTION_WASTE'
  | 'OTHER_OUTSIDE_FIRE'
  | 'OUTSIDE_TANK_FIRE'
  | 'TRASH_RUBBISH_FIRE'
  | 'VEGETATION_GRASS_FIRE'
  | 'WILDFIRE_WILDLAND'
  | 'WILDFIRE_URBAN_INTERFACE'
  | 'UTILITY_INFRASTRUCTURE_FIRE'
  | 'DUMPSTER_OUTDOOR_CONTAINER_FIRE'
  | 'ESS_FIRE'
  | 'EXPLOSION'
  | 'INFRASTRUCTURE_FIRE'
  | 'STRUCTURAL_INVOLVEMENT_FIRE'
  | 'ROOM_AND_CONTENTS_FIRE'
  | 'CONFINED_COOKING_APPLIANCE_FIRE'
  | 'CHIMNEY_FIRE'
  | 'AIRCRAFT_FIRE'
  | 'VEHICLE_FIRE_PASSENGER'
  | 'VEHICLE_FIRE_COMMERCIAL'
  | 'VEHICLE_FIRE_RV'
  | 'VEHICLE_FIRE_FOOD_TRUCK'
  | 'BOAT_PERSONAL_WATERCRAFT_BARGE_FIRE'
  | 'POWERED_MOBILITY_DEVICE_FIRE'
  | 'TRAIN_RAIL_FIRE'
  | 'BOMB_THREAT_RESPONSE_SUSPICIOUS_PACKAGE'
  | 'ELEC_POWER_LINE_DOWN_ARCHING_MALFUNC'
  | 'ELEC_HAZARD_SHORT_CIRCUIT'
  | 'MOTOR_VEHICLE_COLLISION'
  | 'FUEL_SPILL_ODOR'
  | 'GAS_LEAK_ODOR'
  | 'CARBON_MONOXIDE_RELEASE'
  | 'BIOLOGICAL_RELEASE_INCIDENT'
  | 'RADIOACTIVE_RELEASE_INCIDENT'
  | 'HAZMAT_RELEASE_TRANSPORT'
  | 'HAZMAT_RELEASE_FACILITY'
  | 'RUPTURE_WITHOUT_FIRE'
  | 'NO_RUPTURE'
  | 'ODOR'
  | 'SMOKE_INVESTIGATION'
  | 'ABDOMINAL_PAIN'
  | 'ALLERGIC_REACTION_STINGS'
  | 'BACK_PAIN_NON_TRAUMA'
  | 'BREATHING_PROBLEMS'
  | 'CARDIAC_ARREST'
  | 'CHEST_PAIN_NON_TRAUMA'
  | 'CONVULSIONS_SEIZURES'
  | 'DIABETIC_PROBLEMS'
  | 'HEADACHE'
  | 'HEART_PROBLEMS'
  | 'OVERDOSE'
  | 'PANDEMIC_EPIDEMIC_OUTBREAK'
  | 'PREGNANCY_CHILDBIRTH'
  | 'PSYCHOLOGICAL_BEHAVIOR_ISSUES'
  | 'SICK_CASE'
  | 'STROKE_CVA'
  | 'UNCONSCIOUS_VICTIM'
  | 'WELL_PERSON_CHECK'
  | 'ALTERED_MENTAL_STATUS'
  | 'NAUSEA_VOMITING'
  | 'UNKNOWN_PROBLEM'
  | 'NO_APPROPRIATE_CHOICE'
  | 'ANIMAL_BITES'
  | 'ASSAULT'
  | 'BURNS_EXPLOSION'
  | 'CARBON_MONOXIDE_OTHER_INHALATION_INJURY'
  | 'CHOKING'
  | 'DROWNING_DIVING_SCUBA_ACCIDENT'
  | 'ELECTROCUTION'
  | 'EYE_TRAUMA'
  | 'FALL'
  | 'HEAT_COLD_EXPOSURE'
  | 'INDUSTRIAL_INACCESSIBLE_ENTRAPMENT'
  | 'POISONING'
  | 'GUNSHOT_WOUND'
  | 'HEMORRHAGE_LACERATION'
  | 'STAB_PENETRATING_TRAUMA'
  | 'OTHER_TRAUMATIC_INJURY'
  | 'HEALTHCARE_PROFESSIONAL_ADMISSION'
  | 'MEDICAL_ALARM'
  | 'STANDBY_REQUEST'
  | 'TRANSFER_INTERFACILITY'
  | 'AIRMEDICAL_TRANSPORT'
  | 'INTERCEPT_OTHER_UNIT'
  | 'COMMUNITY_PUBLIC_HEALTH'
  | 'LOST_PERSON'
  | 'PERSON_IN_DISTRESS'
  | 'CITIZEN_ASSIST_SERVICE_CALL'
  | 'LIFT_ASSIST'
  | 'FIRE_ALARM'
  | 'GAS_ALARM'
  | 'CO_ALARM'
  | 'OTHER_ALARM'
  | 'DAMAGE_ASSESSMENT'
  | 'WEATHER_RESPONSE'
  | 'MOVE_UP'
  | 'STANDBY'
  | 'DAMAGED_HYDRANT'
  | 'BACKOUNTRY_RESCUE'
  | 'CONFINED_SPACE_RESCUE'
  | 'TRENCH'
  | 'EXTRICATION_ENTRAPPED'
  | 'HIGH_ANGLE_RESCUE'
  | 'LOW_ANGLE_RESCUE'
  | 'STEEP_ANGLE_RESCUE'
  | 'LIMITED_NO_ACCESS'
  | 'BUILDING_STRUCTURE_COLLAPSE'
  | 'ELEVATOR_ESCALATOR_RESCUE'
  | 'MOTOR_VEHICLE_EXTRICATION_ENTRAPPED'
  | 'TRAIN_RAIL_COLLISION_DERAILMENT'
  | 'AVIATION_COLLISION_CRASH'
  | 'AVIATION_STANDBY'
  | 'PERSON_IN_WATER_STANDING'
  | 'PERSON_IN_WATER_SWIFTWATER'
  | 'WATERCRAFT_IN_DISTRESS'
  | 'INTENTIONAL_FALSE_ALARM'
  | 'MALFUNCTIONING_ALARM'
  | 'ACCIDENTAL_ALARM'
  | 'OTHER_FALSE_CALL'
  | 'BOMB_SCARE'
  | 'NO_INCIDENT_FOUND_LOCATION_ERROR'
  | 'CONTROLLED_BURNING_AUTHORIZED'
  | 'SMOKE_FROM_NONHOSTILE_SOURCE'
  | 'INVESTIGATE_HAZARDOUS_RELEASE';
