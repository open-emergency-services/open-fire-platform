// AUTO-GENERATED from the NERIS data framework. DO NOT EDIT BY HAND.
// Re-run: NERIS_FRAMEWORK_PATH=... node scripts/generate.mjs
// Source: github.com/ulfsri/neris-framework

export interface GeoJsonPoint { type: 'Point'; coordinates: [number, number]; }
export interface GeoJsonMultiPolygon { type: 'MultiPolygon'; coordinates: number[][][][]; }

/** NERIS module `mod_parcel` (10 fields). */
export interface NerisParcel {
  /** Assessed Land Value (before exemptions, if any) as provided by the county or local taxing/assessment authority. */
  parcel_value_assessed_land?: number;
  /** Assessed Improvement Values (before exemptions, if any) as provided by the county or local taxing/assessment authority. */
  parcel_value_assessed_imprv?: number;
  /** Local/Municipal Use Code of a property. */
  parcel_use_code?: string;
  /** Year the primary structure on the property was built. */
  parcel_year_built?: number;
  /** Total number of buildings or structures on a single parcel as reported on the assessment roll. */
  parcel_building_number?: number;
  /** Building area of the primary structure on the property. If there are multiple residential units this is primarily the area of the largest residential structure. */
  parcel_building_sqft?: number;
  /** Number of stories of the main structure on the property. */
  parcel_stories?: number;
  /** Type of basement found in the building. */
  parcel_basement_desc?: string;
  /** Number of units on the property. */
  parcel_unit_count?: number;
  /** Size of the property in square feet, derived from the assessment record when possible, otherwise calculated from associated parcel geometry. */
  parcel_land_sqft?: number;
}

/** NERIS module `mod_weather` (12 fields). */
export interface NerisWeather {
  /** National Weather Service Station ID. */
  weather_id?: string;
  /** Standard NWS codes for weather type. */
  weather_condition?: string;
  /** Temperature during incident (degrees F). */
  weather_temperature?: number;
  /** Humidity during incident (%). */
  weather_humidity?: number;
  /** Cloudiness as a percentage (%). */
  weather_cloudiness?: number;
  /** Atmospheric pressure on the sea level, hPa. */
  weather_pressure?: number;
  /** Average visibility, in miles. */
  weather_visibility?: number;
  /** Rain precipitation, inches/hour. */
  precipitation_rain?: number;
  /** Snow precipitation, inches/hour. */
  precipitation_snow?: number;
  /** Velocity of wind in miles per hour. */
  wind_speed?: number;
  /** Wind direction, degrees (meteorological). */
  wind_degree?: number;
  /** Velocity of wind gusts in miles per hour. */
  wind_gust?: number;
}

/** NERIS module `core_mod_dispatch` (20 fields). */
export interface NerisDispatch {
  /** Unique identifier in NERIS for the incident that requires dispatch. [neris_core] */
  incident_neris_id: string;
  /** Department's internal unique identifier for the dispatch. [neris_core] */
  dispatch_internal_id: string;
  /** Unique identifier for the agency in NERIS.  Entity type plus state and county FIPS plus with random trailing characters. [neris_core] */
  fd_neris_id: string;
  /** This 4 digit ID is a unique identifier for each PSAP dispatch center. [neris_core] */
  dispatch_center_id: string;
  /** Location, generally an address, of the incident. Consists of the fields of mod_civic_location. [neris_core] */
  dispatch_location: NerisCivicLocation;
  /** WGS84 latitude and longitude of the incident. If a latitude and longitude are not submitted but a location is, the location geocoding result (if successful) will be used. [neris_core] */
  dispatch_point: GeoJsonPoint;
  /** Free text or canned remark comments from dispatcher throughout duration of call. [neris_core] */
  dispatch_comment: string[];
  /** Timestamp of the comment. [neris_core] */
  dispatch_comment_timestamp: string[];
  /** Output code from dispatch protocol based on the call specifics. [neris_core] */
  dispatch_determinate_code: string;
  /** Department-specific incident code pulled from CAD; should map to a type_incident for ETL in NERIS. [neris_core] */
  dispatch_incident_code: string;
  /** Closing disposition of call set by dispatcher if call changes from initial dispatch. [neris_core] */
  dispatch_final_disposition: string;
  /** Identifies if the call is an automatic alarm. [neris_core] */
  dispatch_automatic_alarm: boolean;
  /** Timestamp at which call arrives at PSAP or department dispatch center. [neris_core] */
  dispatch_time_call_arrival: string;
  /** Timestamp at which call is answered at PSAP or department dispatch center. [neris_core] */
  dispatch_time_call_answering: string;
  /** Timestamp at which call was created. [neris_core] */
  dispatch_time_call_create: string;
  /** Time between call being opened and when call was answered. */
  dispatch_time_alarm_answering?: string;
  /** Time between call open time and first unit dispatch. */
  dispatch_time_alarm_processing?: string;
  /** Shared module for unit response information. [neris_core] */
  dispatch_unit_response: NerisUnitResponse[];
  /** Timestamp when dispatch closes incident. */
  time_incident_clear?: string;
  /** Timestamps for fire tactic employed. [neris_core] */
  dispatch_tactic_timestamps: NerisTacticTimestamps;
}

/** NERIS module `core_mod_entity_fd` (76 fields). */
export interface NerisEntityFd {
  /** Unique identifier for the agency in NERIS.  Entity type plus state and county FIPS plus with random trailing characters. [neris_core] */
  fd_neris_id: string;
  /** Legacy FDID for linkage to other data sets. */
  fd_id_legacy?: string;
  /** Name of the agency. [neris_core] */
  fd_name: string;
  /** Department's parent department's name. */
  fd_parent_name?: string;
  /** Names of departments which are children of the department. */
  fd_child_name?: string[];
  /** Name of department with which the department has an aid relationship. */
  fd_aid_name?: string[];
  /** Type of aid. */
  fd_aid_type?: string[];
  /** Physical address of agency HQ. [neris_core] */
  fd_address_1: string;
  /** Additional address information. */
  fd_address_2?: string;
  /** City in which agency is located. [neris_core] */
  fd_city: string;
  /** State in which agency is located. [neris_core] */
  fd_state: string;
  /** Zip Code in which agency is located. [neris_core] */
  fd_zip: string;
  /** Agency mailing address. [neris_core] */
  fd_mailing_address_1: string;
  /** Additional mailing address information. */
  fd_mailing_address_2?: string;
  /** City of agency mailing address. [neris_core] */
  fd_mailing_city: string;
  /** City of agency mailing address. [neris_core] */
  fd_mailing_state: string;
  /** Zip Code of agency mailing address. [neris_core] */
  fd_mailing_zip: string;
  /** Coordinates of the agency headquarters. [neris_core] */
  fd_point: GeoJsonPoint;
  /** Website of the agency. */
  fd_website?: string;
  /** Contact phone number of the agency. */
  fd_telephone?: string;
  /** Staffing type of the agency. [neris_core] */
  fd_type: string;
  /** Category which describes the entity  of the agency. [neris_core] */
  fd_entity: string;
  /** Multipolygon of the agency's coverage area. */
  fd_jurisiction_set?: GeoJsonMultiPolygon[];
  /** Type of the agency's jurisdiction. */
  fd_jurisdiction_type?: string;
  /** Multipolygon of the district-based supervision of the agency. */
  fd_primary_division_set?: GeoJsonMultiPolygon[];
  /** Type of the agency's primary geographic division. */
  fd_primary_division_type?: string;
  /** Multipolygon of the district-based supervision of the agency. */
  fd_coverage_set?: GeoJsonMultiPolygon[];
  /** Type of the agency's primary geographic division. */
  fd_coverage_type?: string;
  /** Estimated number of people protected within the agency's coverage area. Agency provided. If left blank, calculated if boundary is provided. */
  fd_population_protected?: number;
  /** Data source from which the population count was pulled. */
  fd_population_protected_source?: string;
  /** Number of stations in the agency. [neris_core] */
  fd_station_count: number;
  /** Set of fire department services the agency offers. [neris_core] */
  fd_fire_services: string[];
  /** Set of types of EMS services offered. [neris_core] */
  fd_ems_services: string[];
  /** Set of types of investigation services offered. [neris_core] */
  fd_investigation_services: string[];
  /** Whether the agency has a continuing education/training policy. [neris_core] */
  fd_continue_education: boolean;
  /** Number of shifts the agency utilizes. [neris_core] */
  fd_shift_count: number;
  /** Duration of a shift in hours. [neris_core] */
  fd_shift_duration: number;
  /** Current shift schedule upon NERIS activation. [neris_core] */
  fd_shift_signup: number;
  /** 4-digit unique identifier for each PSAP dispatch center being requested to respond to an incident. [neris_core] */
  dispatch_center_id: string;
  /** Type of dispatch center being requested. [neris_core] */
  dispatch_psap_type: string;
  /** Aggregation level of dispatch center. [neris_core] */
  dispatch_psap_jurisdiction: string;
  /** Whether dispatch is single entity or multiple entity. [neris_core] */
  dispatch_psap_discipline: string;
  /** Whether PSAP follows most recent NENA standards. [neris_core] */
  dispatch_psap_capability: string;
  /** Manufacturer of the CAD system being used by the agency. [neris_core] */
  dispatch_cad_software: string;
  /** Procedure/protocol followed for triage of emergency fire calls. */
  dispatch_protocol_fire?: string;
  /** Procedure/protocol followed for triage of emergency medical calls. */
  dispatch_protocol_medical?: string;
  /** Describes whether the CAD utilizes AVL technology. [neris_core] */
  dispatch_avl_usage: boolean;
  /** Manufacturer of the RMS Software being used by the agency. [neris_core] */
  rms_software: string;
  /** Name of the station. [neris_core] */
  station_id: string;
  /** Physical address of station. [neris_core] */
  station_address_1: string;
  /** Additional address information. */
  station_address_2?: string;
  /** City in which station is located. [neris_core] */
  station_city: string;
  /** State in which station is located. [neris_core] */
  station_state: string;
  /** Zip Code in which station is located. [neris_core] */
  station_zip: string;
  /** WGS84 latitude and longitude of the incident. If a latitude and longitude are not submitted but a location is, the location geocoding result (if successful) will be used. [neris_core] */
  station_point: GeoJsonPoint[];
  /** Name and id of the primary division region in which the station falls. */
  station_primary_division?: string;
  /** Name and id of the coverage area region in which the station falls. */
  station_coverage?: string[];
  /** Minimum staffing assigned to the station. [neris_core] */
  station_staffing: number;
  /** Unit's first designation in CAD. [neris_core] */
  station_unit_id_1: string;
  /** Unit's second designation in CAD. [neris_core] */
  station_unit_id_2: string;
  /** Type of unit housed at the station. [neris_core] */
  station_unit_capability: string;
  /** Minimum staffing required for this unit to be dispatched to an incident. [neris_core] */
  station_unit_staffing: number;
  /** Whether the unit has dedicated staffing. */
  station_unit_dedicated?: boolean;
  /** Number of total staff within department. [neris_core] */
  staff_total: number;
  /** Total number of active full-time career firefighters in agency. [neris_core] */
  staff_active_ff_career_ft: number;
  /** Total number of active part-time career firefighters in agency. [neris_core] */
  staff_active_ff_career_pt: number;
  /** Total number of active volunteer firefighters in agency. [neris_core] */
  staff_active_ff_volunteer: number;
  /** Total number of active full-time career ems only staff in agency. [neris_core] */
  staff_active_ems_only_career_ft: number;
  /** Total number of active part-time career ems only staff in agency. [neris_core] */
  staff_active_ems_only_career_pt: number;
  /** Total number of active volunteer ems only staff in agency. [neris_core] */
  staff_active_ems_only_volunteer: number;
  /** Total number of active full-time career civilians in agency. [neris_core] */
  staff_active_civilians_career_ft: number;
  /** Total number of active part-time career civilians in agency. [neris_core] */
  staff_active_civilians_career_pt: number;
  /** Total number of active volunteer civilians in agency. [neris_core] */
  staff_active_civilians_volunteer: number;
  /** Current ISO rating (1- 10) of the agency, if applicable. */
  assess_iso_rating?: number;
  /** Whether the agency is accredited through CPSE. */
  assess_cpse_acredit?: boolean;
  /** Whether the agency is accredited through CAAS. */
  assess_caas_acredit?: boolean;
}

/** NERIS module `core_mod_incident` (33 fields). */
export interface NerisIncidentCore {
  /** Unique identifier in NERIS for the incident. [neris_core] */
  incident_neris_id: string;
  /** Department's internal unique identifier for the incident. [neris_core] */
  incident_internal_id: string;
  /** Disposition or final incident type as assessed on scene. [neris_core] */
  incident_final_type: string[][];
  /** Flag for the primary incident type. Only one type can be `True`. [neris_core] */
  incident_final_type_primary: boolean[];
  /** Incident modifier(s) that can help describe the magnitude or class of the incident. */
  incident_special_modifier?: string[];
  /** Specific fields for incident types that include fire type. [neris_core] */
  fire: NerisFire;
  /** Specific fields for incident types that include medical. [neris_core] */
  medical: NerisMedical[];
  /** Specific fields for incident types that include hazsit. [neris_core] */
  hazsit: NerisHazard;
  /** Information on emerging hazard(s). Consists of the fields of one or more group from mod_emerging_hazard. [neris_core] */
  emerging_hazard: NerisEmergingHazard[];
  /** Timestamps for fire tactic employed. [neris_core] */
  tactic_timestamps: NerisTacticTimestamps;
  /** WGS84 latitude and longitude of the incident. If a latitude and longitude are not submitted but a location is, the location geocoding result (if successful) will be used. [neris_core] */
  incident_point: GeoJsonPoint;
  /** WGS84 polygon of the footprint of the incident. */
  incident_polygon?: GeoJsonMultiPolygon;
  /** Location, generally an address, of the incident. Consists of the fields of mod_civic_location. [neris_core] */
  incident_location: NerisCivicLocation;
  /** How the location is being used. Consists of the fields of mod_location_use. [neris_core] */
  incident_location_use: NerisLocationUse;
  /** Whether people were present at the time of the incident. [neris_core] */
  incident_people_present: boolean;
  /** Number of people displaced. */
  incident_displaced_number?: number;
  /** Cause for displacement. [neris_core] */
  incident_displaced_cause: string[];
  /** Exposure details. [neris_core] */
  exposure: NerisExposure[];
  /** Firefighter rescue and/or casualty module. Consists of the fields of mod_rescue_ff. [neris_core] */
  rescue_ff: NerisRescueFf[];
  /** Non firefighter rescue and/or casualty module. Consists of the fields of mod_rescue_civ. [neris_core] */
  rescue_nonff: NerisRescueNonff[];
  /** Total number of animals rescued. [neris_core] */
  incident_rescue_animal: number;
  /** Actions taken by the fire department on the scene of the incident. [neris_core] */
  incident_actions_taken: string[][];
  /** Reason no action taken by the fire department on the scene of the incident. [neris_core] */
  incident_noaction: string;
  /** Shared module for unit response information. [neris_core] */
  unit_response: NerisUnitResponse[];
  /** Specific fields for alarms, suppression systems, and their performance. [neris_core] */
  risk_reduction: NerisRiskReduction;
  /** Whether aid was given or received. [neris_core] */
  incident_aid_direction: string;
  /** Type of aid given or received. [neris_core] */
  incident_aid_type: string;
  /** Name of the Fire Department to which aid was given/received. [neris_core] */
  incident_aid_department_name: string[];
  /** Type of non-fire department entities from which aid was received. [neris_core] */
  incident_aid_nonfd: string[];
  /** Description of any obstacles that impacted the incident. [neris_core] */
  incident_narrative_impediment: string;
  /** Description of the final disposition of the incident. [neris_core] */
  incident_narrative_outcome: string;
  /** Characteristics of the parcel at which the incident occurred. Consists of the fields of mod_parcel. */
  parcel?: NerisParcel;
  /** Characteristics of the weather at the location and time of the incident. Consists of the fields of mod_weather. */
  weather?: NerisWeather;
}

/** NERIS module `mod_emerging_hazard` (13 fields). */
export interface NerisEmergingHazard {
  /** Category of the battery powered / stored energy emerging hazard. [neris_core] */
  elec_category: string;
  /** Additional specificity on the battery powered / stored energy emerging hazard. [neris_core] */
  elec_type: string;
  /** Subtype of the emerging hazard. [neris_core] */
  elec_subtype: string;
  /** Whether the battery was the source or target. [neris_core] */
  elec_target: string;
  /** Suppression approach. [neris_core] */
  elec_suppress: string[];
  /** Whether there was a re-ignition. [neris_core] */
  elec_reignition: boolean;
  /** Whether the electric vehicle was involved in crash. [neris_core] */
  elec_vehicle_status: boolean;
  /** Whether power generation hardware was involved in the incident. [neris_core] */
  powergen_hardware_type: string[];
  /** Whether photovoltaics were the source of ignition or target. [neris_core] */
  powergen_pv_ignition: string;
  /** Type of photovoltaics were involved in the incident. [neris_core] */
  powergen_pv_type: string;
  /** Whether corrugated stainless steel tubing was a suspected ignition source. [neris_core] */
  csst_ignition_source: boolean;
  /** Whether lightening was suspected as cause of ignition. [neris_core] */
  csst_lightning: string;
  /** Whether the CSST was grounded. [neris_core] */
  csst_grounded: string;
}

/** NERIS module `mod_exposure` (11 fields). */
export interface NerisExposure {
  /** Type exposure being reported. [neris_core] */
  exposure_type: string;
  /** Type of property damaged or destroyed from the originating source of the hazard. [neris_core] */
  exposure_item: string;
  /** WGS84 latitude and longitude of the exposure. If a latitude and longitude are not submitted but a location is, the location geocoding result (if successful) will be used. [neris_core] */
  exposure_point: GeoJsonPoint;
  /** WGS84 polygon of the footprint of the incident. */
  exposure_polygon?: GeoJsonMultiPolygon;
  /** Location, generally an address, of the incident. Consists of the fields of mod_civic_location. [neris_core] */
  exposure_location: NerisCivicLocation;
  /** How the location is being used. Consists of the fields of mod_location_use. [neris_core] */
  exposure_location_use: NerisLocationUse;
  /** Whether people were present at the time of the incident. [neris_core] */
  exposure_people_present: boolean;
  /** Characteristics of the parcel at which the exposure occurred. Consists of the fields of mod_parcel. */
  exposure_parcel?: NerisParcel;
  /** Rating of damage to the exposure. [neris_core] */
  exposure_damage: string;
  /** Number of people displaced. */
  exposure_displaced_number?: number;
  /** Cause for displacement. [neris_core] */
  exposure_displaced_cause: string[];
}

/** NERIS module `mod_fire` (12 fields). */
export interface NerisFire {
  /** Describes the appliances used for suppression. [neris_core] */
  fire_suppression_appliance: string[];
  /** Describes the type of water supply utilized for the incident. [neris_core] */
  fire_water_supply: string;
  /** Assessment by incident commander and/or officer in charge of the incident as to whether the fire necessitated a formal fire investigation. [neris_core] */
  fire_investigation_need: string;
  /** Categorizes the general type of investigation completed at the structure fire incident. [neris_core] */
  fire_investigation_type: string[];
  /** Fire conditions upon arriving on the scene of the incident. [neris_core] */
  structure_arrival_conditions: string;
  /** Whether the fire extended beyond the conditions found upon arrival. [neris_core] */
  structure_progression_conditions: boolean;
  /** Rating of damage to the fire building of origin as selected from a list of values. [neris_core] */
  structure_damage: string;
  /** Story above or below ground of fire origin. [neris_core] */
  structure_floor_of_origin: number;
  /** Room of origin of the fire. [neris_core] */
  structure_room_of_origin: string;
  /** General categorization of the cause (or likely cause) of the structure fire. [neris_core] */
  structure_fire_cause: string;
  /** General categorization of the cause (or likely cause) of the outdoor fire. */
  outside_fire_cause: string;
  /** Estimated number of acres burned during the incident. [neris_core] */
  outside_fire_acres_burned: number;
}

/** NERIS module `mod_hazard` (10 fields). */
export interface NerisHazard {
  /** Outcome of the hazmat incident. [neris_core] */
  hazsit_disposition: string;
  /** Number of occupants/businesses evacuated during the incident response. [neris_core] */
  hazsit_evacuated: number;
  /** Department of Transportation Hazard Classification. [neris_core] */
  chemical_dot_class: string[];
  /** Name of the chemical/material involved in the incident. [neris_core] */
  chemical_name: string[];
  /** Whether the chemical was released. [neris_core] */
  chemical_release_occurred: boolean[];
  /** Estimated amount released by volume or weight. [neris_core] */
  chemical_amount_est: number[];
  /** Unit of measurement of the estimated amount released. [neris_core] */
  chemical_amount_est_units: string[];
  /** Physical state of the chemical. [neris_core] */
  chemical_physical_state: string[];
  /** Environment which was contaminated. [neris_core] */
  chemical_release_into: string[];
  /** Cause of the hazmat release. [neris_core] */
  chemical_release_cause: string[];
}

/** NERIS module `mod_medical` (4 fields). */
export interface NerisMedical {
  /** Patient care report identification number. Correlates to NEMSIS eRecord.01. */
  patient_care_report?: string;
  /** Status of patient care needs based on evaluation. */
  patient_evaluation_care: string;
  /** Status of the patient after FD arrival and intervention. */
  patient_improved_status?: string;
  /** Transport outcome of the incident. */
  medical_disposition?: string;
}

/** NERIS module `mod_rescue_ff` (27 fields). */
export interface NerisRescueFf {
  /** Date of birth of the person(s) injured or rescued. [neris_core] */
  ff_rescue_birth_month_year: string;
  /** Gender of the person(s) injured or rescued. [neris_core] */
  ff_rescue_gender: string;
  /** Race of the person(s) injured or rescued. [neris_core] */
  ff_rescue_race: string;
  /** Rank of firefighter. [neris_core] */
  ff_casualty_rank: string;
  /** Years of service. [neris_core] */
  ff_casualty_service: number;
  /** Whether there was a rescue, non-rescue, assist, or self evacuation. [neris_core] */
  ff_rescue_type: string;
  /** Primary mode for rescue. [neris_core] */
  ff_rescue_primary_mode: string;
  /** Actions taken to support the rescue. [neris_core] */
  ff_rescue_actions: string[];
  /** Whether conditions impacted the ability of rescue. [neris_core] */
  ff_rescue_impediment_type: string[];
  /** Whether there was a mayday called to indicate a firefighter needed assistance during the incident. [neris_core] */
  ff_rescue_mayday: boolean;
  /** Relative to suppression, when the mayday was called. [neris_core] */
  ff_rescue_mayday_relative_time: string;
  /** Whether a RIT team was activated following a mayday declaration. [neris_core] */
  ff_rescue_rit_activated: boolean;
  /** Type of room/space from which the occupant was rescued. [neris_core] */
  ff_rescue_room_type: string;
  /** Elevation at which the occupant was found. [neris_core] */
  ff_rescue_elevation_type: string;
  /** Whether the space was isolated from the flow of heat and/or toxic gases. [neris_core] */
  ff_rescue_gas_isolation: boolean;
  /** How the firefighter was removed from the structure. [neris_core] */
  ff_rescue_removal_path_type: string;
  /** Relative to suppression, when the firefighter was removed from the structure. [neris_core] */
  ff_rescue_fire_relative_time: string;
  /** Whether the person was uninjured, injured nonfatally, injured fatally. [neris_core] */
  ff_casualty_type: string;
  /** Job classification of firefighter. [neris_core] */
  ff_casualty_classification: string;
  /** Name of the unit responding to the incident in FD Spec. */
  ff_casualty_linked_unit_id: string;
  /** Name of the unit responding to the incident if neris id not yet in FD Spec. */
  ff_casualty_reported_unit_id?: string;
  /** Duty state of the firefighter at the time of the incident. [neris_core] */
  ff_casualty_duty_type: string;
  /** Apparent cause of the injury or fatality. [neris_core] */
  ff_casualty_cause: string;
  /** Action that occurred during the time of the incident. [neris_core] */
  ff_casualty_action: string;
  /** PPE worn during time of incident. */
  ff_casualty_ppe?: string[];
  /** Whether an incident command structure was in place during incident. [neris_core] */
  ff_casualty_incident_command: boolean;
  /** Stage of the incident when the injury occurred. [neris_core] */
  ff_casualty_incident_timeline: string;
}

/** NERIS module `mod_rescue_nonff` (15 fields). */
export interface NerisRescueNonff {
  /** The MM/YYYY of birth of the person(s) injured or rescued. [neris_core] */
  nonff_rescue_birth_month_year: string;
  /** The gender of the person(s) injured or rescued. [neris_core] */
  nonff_rescue_gender: string;
  /** The race of the person(s) injured or rescued. [neris_core] */
  nonff_rescue_race: string;
  /** Whether there was a rescue, non-rescue, assist, or self evacuation [neris_core] */
  nonff_rescue_type: string;
  /** Whether the presence of an occupant in need of rescue was known [neris_core] */
  nonff_rescue_presence_known: string;
  /** The primary mode for rescue [neris_core] */
  nonff_rescue_primary_mode: string;
  /** Actions taken to support the rescue [neris_core] */
  nonff_rescue_actions: string[];
  /** Whether conditions impacted the ability of rescue [neris_core] */
  nonff_rescue_impediment_type: string[];
  /** The type of room/space from which the occupant was rescued [neris_core] */
  nonff_rescue_room_type: string;
  /** The elevation at which the occupant was found [neris_core] */
  nonff_rescue_elevation_type: string;
  /** Whether the space was isolated from the flow of heat and/or toxic gases [neris_core] */
  nonff_rescue_gas_isolation: boolean;
  /** Route along which removal from the structure occurred [neris_core] */
  nonff_rescue_removal_path_type: string;
  /** Relative to suppression, when the occupant was removed from the structure [neris_core] */
  nonff_rescue_fire_relative_time: string;
  /** Whether the person was uninjured, injured nonfatally, injured fatally [neris_core] */
  nonff_casualty_casualty_type: string;
  /** The apparent cause of the injury or fatality [neris_core] */
  nonff_casualty_casualty_cause: string;
}

/** NERIS module `mod_risk_reduction` (19 fields). */
export interface NerisRiskReduction {
  /** Whether at least one smoke alarm was present at the incident location. */
  smoke_alarm_presence?: string;
  /** Type of alarm [neris_core] */
  smoke_alarm_type: string[];
  /** Whether there was at least one working or successfully tested smoke alarm in the structure. */
  smoke_alarm_working?: boolean;
  /** Whether the alarm operated as intended during the incident. [neris_core] */
  smoke_alarm_operation: string;
  /** Reason for alarm failure. [neris_core] */
  smoke_alarm_operation_fail: string;
  /** If the alarm operated, describes the occupant reaction or inaction that resulted from the alarm signal. [neris_core] */
  smoke_alarm_operation_action: string;
  /** Whether at least one fire alarm was present at the incident location. */
  fire_alarm_presence?: string;
  /** Type of alarm [neris_core] */
  fire_alarm_type: string[];
  /** Whether the fire alarm system operated as designed, intended, or expected. [neris_core] */
  fire_alarm_operation: string;
  /** Whether at least one other alarm was present at the incident location. */
  other_alarm_presence?: string;
  /** Type of alarm [neris_core] */
  other_alarm_type: string[];
  /** Whether at least one other alarm was present at the incident location. */
  fire_suppression_presence?: string;
  /** Type of fire suppression system [neris_core] */
  fire_suppression_type: string[];
  /** Whether the fire suppression system was full or partial. [neris_core] */
  fire_suppression_full_partial: string[];
  /** Whether the fire suppression system operated as designed, intended, or expected. [neris_core] */
  fire_suppression_operation: string;
  /** Number of sprinkler heads activated. [neris_core] */
  fire_suppression_operation_sprinkler: number;
  /** Reason for the failure. [neris_core] */
  fire_suppression_operation_failure: string;
  /** Whether at least one cooking fire suppression system was present at the incident location. */
  cooking_fire_suppression_presence?: string;
  /** Type of cooking fire suppression system [neris_core] */
  cooking_fire_suppression_type: string[];
}

/** NERIS module `mod_civic_location` (40 fields). */
export interface NerisCivicLocation {
  /** A built feature which has a vertical dimension, including both conventional buildings which have walls, doors, and a roof, and other kinds of infrastructure such as cell towers, transformer stations, fuel tanks, and so on. */
  nl_structure?: string;
  /** Name of a sub-area within a larger area specified either by site name, by a thoroughfare address, or both. */
  nl_subsite?: string;
  /** Name of an exterior area which is publicly known and unique within a given place. A site may contain one or more structures and/or sub-sites. */
  nl_site?: string;
  /** Identifier in the portion of the complete address number that precedes the integer Address Number in order to further specify a location along a thoroughfare or within a defined area. */
  an_prefix?: string;
  /** Integer identifier of a location along a thoroughfare or within a defined community. */
  an_number?: number;
  /** Identifier in the portion of the complete address number that follows the integer Address Number in order to further specify a location along a thoroughfare or within a defined area. */
  an_suffix?: string;
  /** Address Number Complete includes the Address Number Prefix (if any), the Address Number, Address Number Suffix (if any), and any formatting or separator characters needed to display the official version of the complete address number. The Address Number Complete precedes the complete street name to identify a location along a thoroughfare or within a defined area. */
  an_complete?: string;
  /** Distance travelled along a route such as a road or highway, indicated by a distance marker sign, typically a post or other marker indicating the distance in miles/kilometers from or to a given point. */
  an_distance_marker?: string;
  /** Word or phrase that precedes and modifies the Street Name element but is separated from it by a Street Name Pre Type or a Street Name Pre Directional or both. */
  sn_pre_modifier?: string;
  /** Word preceding the Street Name element that indicates the direction taken by the street from an arbitrary starting point or line, or the sector where it is located. */
  sn_pre_directional?: string;
  /** Word or phrase that precedes the Street Name element and identifies a type of thoroughfare in a complete street name. */
  sn_pre_type?: string;
  /** Preposition or prepositional phrase between the Street Name Pre Type and the Street Name. */
  sn_pre_type_separator?: string;
  /** Element of the complete street name that identifies the particular street (as opposed to any street types, directionals, and modifiers). */
  sn_street_name?: string;
  /** Word or phrase that follows the Street Name element and identifies a type of thoroughfare in a complete street name. */
  sn_post_type?: string;
  /** Word following the Street Name element that indicates the direction taken by the street from an arbitrary starting point or line, or the sector where it is located. */
  sn_post_directional?: string;
  /** Word or phrase that follows and modifies the Street Name element and is either separated from it by a Street Name Post Type and/or a Street Name Post Directional. */
  sn_post_modifier?: string;
  /** Word which follows all other street name elements and is used only as needed to indicate direction of travel on a divided roadway and associated frontage roads. */
  sn_dir_of_travel?: string;
  /** Designated part of a structure which spans one or many floors, typically including more than one unit or room and representing a significant portion of the structure floor area. */
  nl_wing?: string;
  /** Standardized identifier for a story or level within a structure, wing, or unit. */
  nl_floor?: string;
  /** Part of the complete unit identifier that precedes the Unit Value and indicates the kind of unit. */
  nl_unit_pre_type?: string;
  /** Part of the complete unit identifier that uniquely identifies a particular unit. */
  nl_unit_value?: string;
  /** Single, distinctly identified, enclosed space within a structure. */
  nl_room?: string;
  /** Identified, unenclosed area within a structure, wing, unit, or room. */
  nl_section?: string;
  /** Identified linear feature, such as a linear arrangement of seats, workstations, equipment, or storage, within a structure, wing, unit, or room. */
  nl_row?: string;
  /** Identified seat, desk, workstation, or similar precise location within a structure, wing, unit, room, section, or row. */
  nl_seat?: string;
  /** Information that relates to location but does not meet the definition of any other named location elements. */
  nl_additional_info?: string;
  /** Uniquely identified and indivisible infrastructure component, smaller than a structure, which exists either within a structure or exterior to any structure, such as an alarm box, a utility pole, a callbox, or other similar feature. */
  nl_marker?: string;
  /** City name for the ZIP Code of an address, as given in the USPS City State file. */
  csop_postal_comm?: string;
  /** Name of an unincorporated neighborhood, subdivision or area, either within an incorporated municipality, or in an unincorporated portion of a county or both, where the address is located. */
  csop_neighborhood_comm?: string;
  /** Name of an unincorporated community, either within an incorporated municipality or in an unincorporated portion of a county, or both, where the address is located. */
  csop_unincorporated_comm?: string;
  /** Name of the incorporated municipality or other general-purpose local governmental unit (if any) where the address is located. */
  csop_incorporated_muni?: string;
  /** Name of the county or county-equivalent where the address is located. A county (or its equivalent) is the primary legal division of a state or territory. */
  csop_county?: string;
  /** Name of a state or state equivalent, represented by the two- letter UPPER CASE abbreviation given in USPS Publication 28 [15], Appendix B. A state is a primary governmental division of the United States. */
  csop_state?: string;
  /** System of 5-digit codes that identifies the individual USPS Post Office or metropolitan area delivery station associated with an address. */
  csop_postal_code?: string;
  /** System of 4-digit codes that are used after the 5-digit ZIP Code to specify a range of USPS delivery addresses. */
  csop_postal_code_ext?: string;
  /** Name of a country represented by its two-letter ISO 3166-1[14] English country alpha-2 code elements in UPPER CASE letters. */
  csop_country?: string;
  /** Type of feature identified by the address. */
  place?: string;
  /** JSON string of structure address elements which the transmitter wishes to include. */
  additional_attributes?: Record<string, unknown>;
  /** Array of (Street name + optional address number) for the nearest intersection. */
  cross_street?: unknown[];
  /** Modifier of the cross street, such as 'nearest' or 'second nearest' */
  type_cross_street?: string[];
}

/** NERIS module `mod_location_use` (8 fields). */
export interface NerisLocationUse {
  /** Location type. [neris_core] */
  use_type: string;
  /** Specific use type of the location type selection for the incident. [neris_core] */
  use_subtype: string;
  /** Whether the location is in use. [neris_core] */
  use_status: boolean;
  /** Whether the location is being used as intended. [neris_core] */
  use_intended: boolean;
  /** Apparent reason the location is not in use. [neris_core] */
  use_vacancy: string;
  /** Whether the location had an additional use type that impacted the incident response. */
  use_secondary?: boolean;
  /** Location type. [neris_core] */
  use_type_secondary: string;
  /** Specific use type of the location type selection for the incident. [neris_core] */
  use_subtype_secondary: string;
}

/** NERIS module `mod_tactic_timestamps` (9 fields). */
export interface NerisTacticTimestamps {
  /** Timestamp at which incident command is established. [neris_core] */
  time_command_established: string;
  /** Timestamp at which initial incident sizeup is complete. [neris_core] */
  time_sizeup_completed: string;
  /** Timestamp at which suppression is complete. [neris_core] */
  time_suppression_complete: string;
  /** Timestamp at which primary search operations begin. [neris_core] */
  time_primary_search_begin: string;
  /** Timestamp at which primary search operations are complete. [neris_core] */
  time_primary_search_complete: string;
  /** Timestamp at which water is first applied to fire. [neris_core] */
  time_water_on_fire: string;
  /** Timestamp at which fire is considered contained (e.g. in a wildfire), but not yet extinguished. [neris_core] */
  time_fire_under_control: string;
  /** Timestamp at which fire is has been knocked down. [neris_core] */
  time_fire_knocked_down: string;
  /** Timestamp at which extrication (motor vehicle, technical rescue) has been completed. [neris_core] */
  time_extrication_complete: string;
}

/** NERIS module `mod_unit_response` (22 fields). */
export interface NerisUnitResponse {
  /** Name of the unit responding to the incident in FD Spec. */
  unit_id_linked?: string;
  /** Name of the unit responding to the incident if not in FD Spec. */
  unit_id_reported?: string;
  /** On-scene staffing of unit. */
  unit_staffing_reported?: number;
  /** Set to TRUE if unit is unable to dispatch. */
  unit_unable_to_dispatch?: boolean;
  /** Response mode of unit as part of the unit's response to an incident. */
  unit_response_mode?: string;
  /** WGS84 latitude and longitude of unit. */
  unit_dispatch_point?: GeoJsonPoint;
  /** Timestamp that the unit is dispatched. */
  time_dispatch?: string;
  /** Timestamp that the unit goes enroute to scene of the incident. */
  time_enroute_to_scene?: string;
  /** Timestamp that the unit arrived on scene. */
  time_on_scene?: string;
  /** Timestamp for units that were canceled prior to arrival. */
  time_canceled_enroute?: string;
  /** Timestamp that the unit stages on scene. */
  time_staging?: string;
  /** Timestamp that the provider reaches the patient's side. */
  time_at_patient?: string;
  /** Timestamp that the unit statuses enroute to the hospital. */
  time_enroute_hospital?: string;
  /** Timestamp that the unit arrives at the hospital. */
  time_arrived_hospital?: string;
  /** Name of the hospital where the patient is transported. */
  hospital_destination?: string;
  /** Timestamp that the provider transfers care to a transporting agency. */
  time_transfer_to_agency?: string;
  /** Timestamp that the provider transfers care to a hospital or facility. */
  time_transfer_to_facility?: string;
  /** Timestamp that the unit clears the hospital. */
  time_hospital_clear?: string;
  /** Timestamp that the unit clears the incident. */
  time_unit_clear?: string;
  /** Time between dispatch time and en-route time. */
  time_turnout?: string;
  /** Time between en route time and on scene time. */
  time_travel?: string;
  /** Transport mode of unit as part of the unit's response to a hospital. */
  unit_transport_mode?: string;
}

/** NERIS module `mod_commercial_inspection` (18 fields). */
export interface NerisCommercialInspection {
  inspection_id?: number;
  entity_inspection_id?: string;
  location?: Record<string, unknown>;
  location_use?: string[];
  date?: string;
  reinspection?: boolean;
  previous_inspection_id?: number;
  building_codes_reqd?: string[];
  building_codes_violated?: string[];
  permit_id?: string[];
  structure_unit?: boolean;
  unit_number?: string;
  structure_square_feet?: number;
  unit_square_feet?: number;
  occupancy_load?: number;
  fire_doors_operable?: boolean;
  risk_reduction_alarms?: Record<string, unknown>;
  notes?: string;
}

/** NERIS module `mod_community_event` (14 fields). */
export interface NerisCommunityEvent {
  event_id?: number;
  virtual_event?: boolean;
  location?: Record<string, unknown>;
  event_start?: string;
  event_end?: string;
  date?: string;
  location_use?: string[];
  activity_category?: string[];
  activity_type?: string[];
  activity_campaign?: string[];
  target_audience?: string[];
  persons_attended?: number;
  persons_engaged?: number;
  notes?: string;
}

/** NERIS module `mod_core_CRR` (5 fields). */
export interface NerisCoreCRR {
  NERIS_ID?: string;
  home_location_visit?: boolean;
  community_event?: boolean;
  mod_parcel_data_collection?: boolean;
  hydrant_inspection?: boolean;
}

/** NERIS module `mod_home_visit` (28 fields). */
export interface NerisHomeVisit {
  event_id?: number;
  location?: Record<string, unknown>;
  date?: string;
  units?: string[];
  time_arrival?: string;
  time_departure?: string;
  not_engaged?: boolean;
  reason_not_engaged?: string[];
  location_use?: string[];
  num_alarms?: number;
  activity_type?: string[];
  activity_campaign?: string[];
  risk_reduction_alarms?: Record<string, unknown>;
  activity_category?: string[];
  health_problems?: string[];
  participation_capability?: boolean;
  alcohol_tobacco_drug_use?: string[];
  referral?: boolean;
  referral_type?: string[];
  num_residents_18_older?: number;
  num_residents_under_18?: number;
  num_residents_65_older?: number;
  num_residents_disabilities?: number;
  possible_hoarding?: boolean;
  follow_up_needed?: boolean;
  services_referred?: boolean;
  type_services_referred?: string[];
  notes?: string;
}

/** NERIS module `mod_hydrant_inspection` (13 fields). */
export interface NerisHydrantInspection {
  hydrant_id?: string;
  inspection_id?: number;
  inspection_date?: string;
  latitude?: number;
  longitude?: number;
  operable?: boolean;
  functional_impediment?: boolean;
  impediment_type?: string[];
  maintenence_referred?: boolean;
  private_hydrant?: boolean;
  main_size?: number;
  nfpa_rating_color?: string[];
  notes?: string;
}

/** NERIS module `mod_outdoor_inspection` (11 fields). */
export interface NerisOutdoorInspection {
  inspection_id?: number;
  date?: string;
  location?: Record<string, unknown>;
  location_use?: string[];
  distance_between_structures?: number;
  distance_unit?: string[];
  structures_across_parcel?: number;
  fuel_arrangement?: string[];
  fuel_size?: string[];
  fuel_distribution?: string[];
  foundation_type?: string[];
}

/** NERIS module `mod_parcel_data_collection` (24 fields). */
export interface NerisParcelDataCollection {
  inspection_id?: number;
  inspection_date?: string;
  parcel_id?: number;
  authority_parcel_id?: number;
  location?: Record<string, unknown>;
  location_use?: string[];
  zoning?: string;
  flood_plane?: boolean;
  lot_size?: number;
  lot_units?: string;
  unit_count?: number;
  structure_inspection?: boolean;
  commerical_inspection?: boolean;
  outdoor_inspection?: boolean;
  building_value?: unknown;
  land_value?: unknown;
  other_value?: unknown;
  total_value?: unknown;
  last_sale_date?: string;
  last_sale_price?: number;
  map_number?: number;
  map_parcel_id?: number;
  edit_date?: string;
  notes?: string;
}

/** NERIS module `mod_structure_inspection` (30 fields). */
export interface NerisStructureInspection {
  inspection_id?: number;
  date?: string;
  location?: Record<string, unknown>;
  location_use?: string[];
  units_in_structure?: number;
  vacant_status?: boolean;
  vacancy_type?: string[];
  year_built?: number;
  building_area?: number;
  stories?: number;
  basement?: boolean;
  construction?: string[];
  roof_material?: string[];
  solar_panels?: boolean;
  risk_reduction_alarms?: Record<string, unknown>;
  reinspection_required?: boolean;
  eaves?: string[];
  vent_screen?: string[];
  exterior_finish?: string[];
  window_panes?: string[];
  hurricane_clips?: boolean;
  tornado_safe_room?: boolean;
  outbuildings?: number;
  deck_porch_grade?: string[];
  deck_porch_material?: string[];
  attached_addition?: string[];
  attached_addition_materials?: string[];
  distance_to_nearest_structure?: number;
  distance_unit?: string[];
  assessed_value?: number;
}

/** NERIS module `core_mod_health_safety` (3 fields). */
export interface NerisHealthSafety {
  NERIS_ID?: string;
  incident_response?: boolean;
  personnel_injury?: boolean;
}

/** NERIS module `mod_incident` (8 fields). */
export interface NerisIncident {
  neris_incident_id?: string;
  incident_type?: string[];
  actions_taken?: string[];
  traumatic_event?: string;
  unit?: string[];
  on_scene_duration?: unknown;
  asleep_at_alarm?: boolean;
  exposure_type?: string[];
}

/** NERIS module `mod_personnel_injury` (13 fields). */
export interface NerisPersonnelInjury {
  injury_datetime?: string;
  assignment?: string[];
  severity?: string[];
  disposition?: string[];
  location?: Record<string, unknown>;
  activity?: string[];
  injury_type?: string[];
  body_part_injured?: string[];
  injury_cause?: string[];
  neris_id_last_incident?: string;
  hours_slept?: number;
  shift_schedule?: string[];
  shift_start_datetime?: string;
}

/** NERIS module `mod_personnel_spec` (14 fields). */
export interface NerisPersonnelSpec {
  first_name?: string;
  last_name?: string;
  last_4_ssn?: number;
  nfr_number?: number;
  dob?: string;
  race?: string[];
  gender?: string[];
  neris_entity_id?: string[];
  entity_location?: Record<string, unknown>;
  service_entry_date?: string;
  entity_start_date?: string;
  station_assignment?: string;
  shift_schedule?: string[];
  service_type?: string[];
}

/** NERIS module `core_mod_analysis` (14 fields). */
export interface NerisAnalysis {
  NERIS_ID?: string;
  incident_number?: string;
  incident_type?: string[];
  human_factors?: string[];
  consumer_product_involved?: boolean;
  analysis_start_date?: string;
  analysis_end_date?: unknown;
  casualties_ff?: Record<string, unknown>[];
  casualties_nonff?: Record<string, unknown>[];
  property_value?: number;
  contents_value?: number;
  property_value_loss?: number;
  contents_value_loss?: number;
  location_use?: NerisLocationUse;
}

/** NERIS module `mod_battery_incident` (18 fields). */
export interface NerisBatteryIncident {
  product_type?: string[];
  original_battery?: boolean;
  installation_status?: boolean;
  safety_listed?: boolean;
  vehicle_battery?: boolean;
  charging_at_ignition?: boolean;
  incident_indoor_outdoor?: string[];
  in_direct_sunlight?: boolean;
  primary_indoor_outdoor?: string[];
  impacted_from_source?: boolean;
  thermal_runaway?: boolean;
  fd_suppression?: string[];
  battery_cell?: string[];
  battery_chemistry?: string[];
  battery_size_voltage?: number;
  battery_size_amp_hour?: number;
  battery_size_watt_hour?: number;
  battery_charge?: number;
}

/** NERIS module `mod_casualty_ff` (16 fields). */
export interface NerisCasualtyFf {
  ff_rescue_birth_month_year?: string;
  ff_rescue_gender?: string;
  ff_rescue_race?: string;
  ff_casualty_type?: string;
  ff_casualty_rank?: string;
  ff_casualty_service?: number;
  ff_casualty_classification?: string;
  ff_casualty_linked_unit_id?: string;
  ff_casualty_unit_cont?: boolean;
  ff_casualty_duty_type?: string;
  ff_casualty_cause?: string;
  ff_casualty_action?: string;
  ff_casualty_ppe?: string[];
  ff_casualty_incident_command?: boolean;
  ff_casualty_incident_timeline?: string;
  ff_casualty_room?: string[];
}

/** NERIS module `mod_casualty_nonff` (6 fields). */
export interface NerisCasualtyNonff {
  nonff_rescue_birth_month_year?: string;
  nonff_rescue_gender?: string;
  nonff_rescue_race?: string;
  nonff_casualty_casualty_type?: string;
  nonff_casualty_casualty_cause?: string;
  nonff_casualty_room?: string[];
}

/** NERIS module `mod_consumer_products` (6 fields). */
export interface NerisConsumerProducts {
  consumer_product_type?: string[];
  product_contribution?: string[];
  consumer_product_manufacturer?: string;
  consumer_product_description?: string;
  consumer_product_model_number?: string;
  notes?: unknown;
}

/** NERIS module `mod_dins_structure` (29 fields). */
export interface NerisDinsStructure {
  address?: string;
  structure_number?: number[];
  date?: string;
  incident_name?: string;
  vacant_status?: boolean;
  vacancy_type?: string[];
  multi_unit?: boolean;
  units_in_structure?: number;
  construction?: string[];
  roof_material?: string[];
  eaves?: string[];
  year_built?: number;
  vent_screen?: string[];
  exterior_finish?: string[];
  window_panes?: string[];
  outbuildings?: number;
  deck_porch_grade?: string[];
  deck_porch_material?: string[];
  attached_addition?: string[];
  attached_addition_materials?: string[];
  distance_to_nearest_structure?: number;
  distance_unit?: string[];
  window_damage?: string[];
  impacted_additions?: string[];
  fire_origin_location?: string[];
  damage_assessment?: string[];
  displacement?: boolean;
  displace_number?: number;
  displace_cause?: string[];
}

/** NERIS module `mod_hazsit` (14 fields). */
export interface NerisHazsit {
  material_released?: string;
  hazardous_class?: string[];
  electrification?: boolean;
  hazard_physical_state?: string[];
  hazsit_type?: string[];
  quantity_released?: number;
  quantity_units?: string[];
  cause_of_release?: string[];
  release_factors?: string[];
  evacuation_count?: number;
  transportation_impact?: boolean;
  hazmat_disposition?: string[];
  description_of_events?: string;
  recommendations?: string;
}

/** NERIS module `mod_outdoor_fire` (21 fields). */
export interface NerisOutdoorFire {
  incident_name?: string;
  cause_category?: string[];
  general_cause?: string[];
  specific_cause?: string[];
  cause_certainty?: string[];
  permit_issued?: boolean;
  contributing_activity?: string[];
  structures_involved?: number;
  minor_involved?: boolean;
  fire_perimeter?: GeoJsonMultiPolygon;
  acres_burned?: number;
  fuel_arrangment?: string[];
  fuel_size?: string[];
  fuel_distribution?: string[];
  elevation?: number;
  relative_position?: string[];
  aspect?: string[];
  flame_length?: number;
  rate_of_spread?: string[];
  description_of_events?: string;
  recommendations?: string;
}

/** NERIS module `mod_structure_fire` (25 fields). */
export interface NerisStructureFire {
  occupant_count?: unknown;
  parcel_details?: Record<string, unknown>;
  inspection_required?: boolean;
  inspection_date?: unknown;
  inspection_findings?: string;
  non_permitted_modifcations?: boolean;
  structure_unstable?: boolean;
  room_of_origin?: string[];
  intersectional_space?: boolean;
  intersectional_space_origin?: string[];
  level_of_origin?: number;
  cause_category?: string[];
  general_cause?: string[];
  specific_cause?: string[];
  initial_detection?: string[];
  risk_reduction?: NerisRiskReduction;
  occupants_displaced?: boolean;
  interior_doors?: boolean;
  exterior_doors?: boolean;
  windows?: boolean;
  spread?: string[];
  contributing_hazards?: string[];
  minor_involved?: boolean;
  description_of_events?: string;
  recommendations?: string;
}

/** NERIS module `mod_transportation_fire` (9 fields). */
export interface NerisTransportationFire {
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_type?: string;
  auto_body_style?: string;
  vehicle_vin?: string;
  vehicle_year?: number;
  vehicle_powertrain?: string;
  vehicle_state?: string[];
  additional_description?: string;
}
