// search for airports, navaids, fixes
export const SET_SEARCH_QUERY = 'SET_SEARCH_QUERY';
export const REQUEST_SEARCH_RESULTS = 'REQUEST_SEARCH_RESULTS';
export const RECEIVE_SEARCH_RESULTS = 'RECEIVE_SEARCH_RESULTS';
export const REQUEST_SEARCH_INDEX = 'REQUEST_SEARCH_INDEX';
export const RECEIVE_SEARCH_INDEX = 'RECEIVE_SEARCH_INDEX';

// geolocate a navigation item
export const LOCATE_NAV_ITEM = 'LOCATE_NAV_ITEM';
export const LOCATED_NAV_ITEM = 'LOCATED_NAV_ITEM';
export const SET_ACTIVE_NAV_ITEM = 'SET_ACTIVE_NAV_ITEM';

// geo search
export const REQUEST_GEO_SEARCH_AIRWAYS = 'REQUEST_GEO_SEARCH_AIRWAYS';
export const RECEIVE_GEO_SEARCH_AIRWAYS = 'RECEIVE_GEO_SEARCH_AIRWAYS';
export const REQUEST_GEO_SEARCH_RESULTS = 'REQUEST_GEO_SEARCH_RESULTS';
export const RECEIVE_GEO_SEARCH_RESULTS = 'RECEIVE_GEO_SEARCH_RESULTS';

// waypoints
export const CREATE_WAYPOINT = 'CREATE_WAYPOINT';
export const ADD_WAYPOINT = 'ADD_WAYPOINT';
export const ADD_WAYPOINT_AT = 'ADD_WAYPOINT_AT';
export const REMOVE_WAYPOINT = 'REMOVE_WAYPOINT';
export const SET_WAYPOINT_INDEX = 'SET_WAYPOINT_INDEX';
export const SET_WAYPOINT_ELEVATION = 'SET_WAYPOINT_ELEVATION';
export const SET_WAYPOINT_NAV_ITEM = 'SET_WAYPOINT_NAV_ITEM';
export const SET_WAYPOINT_LAT_LON = 'SET_WAYPOINT_LAT_LON';
export const SET_WAYPOINT_FLIGHT_PLAN = 'SET_WAYPOINT_FLIGHT_PLAN';

// flight plans
export const CREATE_FLIGHT_PLAN = 'CREATE_FLIGHT_PLAN';
export const ADD_FLIGHT_PLAN = 'ADD_FLIGHT_PLAN';
export const REMOVE_FLIGHT_PLAN = 'REMOVE_FLIGHT_PLAN';
export const SET_FLIGHT_PLAN_TITLE = 'SET_FLIGHT_PLAN_TITLE';
export const SET_FLIGHT_PLAN_COLOR = 'SET_FLIGHT_PLAN_COLOR';
export const SET_FLIGHT_PLAN_VISIBILITY = 'SET_FLIGHT_PLAN_VISIBILITY';
export const SET_FLIGHT_PLAN_AIRCRAFT = 'SET_FLIGHT_PLAN_AIRCRAFT';
export const SET_FLIGHT_PLAN_CRUISE_SPEED = 'SET_FLIGHT_PLAN_CRUISE_SPEED';
export const SET_FLIGHT_PLAN_FUEL_CONSUMPTION = 'SET_FLIGHT_PLAN_FUEL_CONSUMPTION';
export const SET_FLIGHT_PLAN_PAYLOAD = 'SET_FLIGHT_PLAN_PAYLOAD';
export const EXPORT_FLIGHT_PLAN_TO_FMS = 'EXPORT_FLIGHT_PLAN_TO_FMS';
export const SET_ACTIVE_FLIGHT_PLAN = 'SET_ACTIVE_FLIGHT_PLAN';

// Map
export const SET_MAP_CENTER = 'SET_MAP_CENTER';
export const SET_MAP_ZOOM = 'SET_MAP_ZOOM';
export const SET_MAP_VIEW = 'SET_MAP_VIEW';
export const SET_MAP_BASE_LAYER = 'SET_MAP_BASE_LAYER';
export const SET_MAP_OVERLAYS = 'SET_MAP_OVERLAYS';

export const MAP_BASE_LAYER_OSM = 'osm';
export const MAP_ZOOM_DEFAULT = 4;
export const MAP_ZOOM_ACTIVE_NAV_ITEM = 12;
export const MAP_CENTER_DEFAULT = [0, 0];
export const MAP_MAX_ZOOM = 20;
export const MAP_MIN_ZOOM = 2;
export const MAP_LOD_1_ZOOM = 10;
export const MAP_LOD_2_ZOOM = 8;
export const MAP_LOD_3_ZOOM = 7;
export const MAP_MIN_ZOOM_NAV_ITEMS_VISIBLE = 6;
export const MAP_MAX_CLUSTER_RADIUS = 30;
export const MAP_BASE_LAYER_DEFAULT = 'osm';
export const MAP_OVERLAYS_DEFAULT = [
  'navaids', 'fixes', 'airways', 'airports', 'flightPlans', 'waypoints', 'aircraft'
];

// sidebar
export const COLLAPSE_SIDEBAR = 'COLLAPSE_SIDEBAR';
export const EXPAND_SIDEBAR = 'EXPAND_SIDEBAR';
export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
export const SET_SIDEBAR_CONTEXT = 'SET_SIDEBAR_CONTEXT';
export const SIDEBAR_CONTEXT_WAYPOINTS = 'waypoints';
export const SIDEBAR_CONTEXT_FLIGHT_PLANS = 'flightPlans';
export const SIDEBAR_CONTEXT_FLIGHT_PLAN = 'flightPlan';

// main menu
export const COLLAPSE_MENU = 'COLLAPSE_MENU';
export const EXPAND_MENU = 'EXPAND_MENU';
export const TOGGLE_MENU = 'TOGGLE_MENU';

// flash messages
export const ADD_FLASH_MESSAGE = 'ADD_FLASH_MESSAGE';
export const POP_FLASH_MESSAGE = 'POP_FLASH_MESSAGE';
export const CLEAR_FLASH_MESSAGES = 'CLEAR_FLASH_MESSAGES';
export const FLASH_MESSAGE_DURATION = 5000;

// log / flash message types
export const INFO = 'INFO';
export const WARNING = 'WARNING';
export const DANGER = 'DANGER';
export const ERROR = 'ERROR';
export const DEBUG = 'DEBUG';

// flight plans
export const FLIGHT_PLAN_COLORS = [
  '#DDBB66','#ffa544','#91b756','#3161a4','#9b8ab6','#ae927a','#c74634','#ad5c15','#4f6f3e','#fdef5a','#4b6574','#3f3f3f'
];
export const DEFAULT_FLIGHT_PLAN_COLOR = FLIGHT_PLAN_COLORS[0];
