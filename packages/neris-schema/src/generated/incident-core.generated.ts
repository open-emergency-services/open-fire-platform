// AUTO-GENERATED from the NERIS data framework. DO NOT EDIT BY HAND.
// Re-run: node scripts/generate.mjs
// Source: github.com/ulfsri/neris-framework

export interface GeoJsonPoint { type: 'Point'; coordinates: [number, number]; }
export interface GeoJsonMultiPolygon { type: 'MultiPolygon'; coordinates: number[][][][]; }

/** Core NERIS incident record (non-computed fields). */
export interface NerisIncidentCore {
  /** Unique identifier in NERIS for the incident. */
  incident_neris_id: string;
  /** Department's internal unique identifier for the incident. */
  incident_internal_id: string;
  /** Disposition or final incident type as assessed on scene. */
  incident_final_type: string[][];
  /** Flag for the primary incident type. Only one type can be `True`. */
  incident_final_type_primary: boolean[];
  /** Incident modifier(s) that can help describe the magnitude or class of the incident. */
  incident_special_modifier?: string[];
  /** Specific fields for incident types that include fire type. */
  fire: Record<string, unknown>;
  /** Specific fields for incident types that include medical. */
  medical: Record<string, unknown>[];
  /** Specific fields for incident types that include hazsit. */
  hazsit: Record<string, unknown>;
  /** Information on emerging hazard(s). Consists of the fields of one or more group from mod_emerging_hazard. */
  emerging_hazard: Record<string, unknown>[];
  /** Timestamps for fire tactic employed. */
  tactic_timestamps: Record<string, unknown>;
  /** WGS84 latitude and longitude of the incident. If a latitude and longitude are not submitted but a location is, the location geocoding result (if successful) will be used. */
  incident_point: GeoJsonPoint;
  /** WGS84 polygon of the footprint of the incident. */
  incident_polygon?: GeoJsonMultiPolygon;
  /** Location, generally an address, of the incident. Consists of the fields of mod_civic_location. */
  incident_location: Record<string, unknown>;
  /** How the location is being used. Consists of the fields of mod_location_use. */
  incident_location_use: Record<string, unknown>;
  /** Whether people were present at the time of the incident. */
  incident_people_present: boolean;
  /** Cause for displacement. */
  incident_displaced_cause: string[];
  /** Exposure details. */
  exposure: Record<string, unknown>[];
  /** Firefighter rescue and/or casualty module. Consists of the fields of mod_rescue_ff. */
  rescue_ff: Record<string, unknown>[];
  /** Non firefighter rescue and/or casualty module. Consists of the fields of mod_rescue_civ. */
  rescue_nonff: Record<string, unknown>[];
  /** Total number of animals rescued. */
  incident_rescue_animal: number;
  /** Actions taken by the fire department on the scene of the incident. */
  incident_actions_taken: string[][];
  /** Reason no action taken by the fire department on the scene of the incident. */
  incident_noaction: string;
  /** Shared module for unit response information. */
  unit_response: Record<string, unknown>[];
  /** Specific fields for alarms, suppression systems, and their performance. */
  risk_reduction: Record<string, unknown>;
  /** Whether aid was given or received. */
  incident_aid_direction: string;
  /** Type of aid given or received. */
  incident_aid_type: string;
  /** Name of the Fire Department to which aid was given/received. */
  incident_aid_department_name: string[];
  /** Type of non-fire department entities from which aid was received. */
  incident_aid_nonfd: string[];
  /** Description of any obstacles that impacted the incident. */
  incident_narrative_impediment: string;
  /** Description of the final disposition of the incident. */
  incident_narrative_outcome: string;
  /** Characteristics of the parcel at which the incident occurred. Consists of the fields of mod_parcel. */
  parcel?: Record<string, unknown>;
  /** Characteristics of the weather at the location and time of the incident. Consists of the fields of mod_weather. */
  weather?: Record<string, unknown>;
}
