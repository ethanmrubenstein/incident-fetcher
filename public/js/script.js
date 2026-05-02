// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Map Stuff --------------------------------
let alreadyRun = false;

const initializeMap = async (map, USER_LATITUDE, USER_LONGITUDE) => {
  let markers = L.markerClusterGroup();

  L.control
    .Legend({
      position: "bottomleft",
      legends: [
        {
          label: "Vehicle Crash",
          type: "image",
          url: "images/vehicle-crash.png",
        },
        {
          label: "Vehicle Fire",
          type: "image",
          url: "images/vehicle-fire.png",
        },
        {
          label: "Disabled Vehicle",
          type: "image",
          url: "images/vehicle-disabled.png",
        },
        {
          label: "Road Obstruction",
          type: "image",
          url: "images/traffic-barricade.png",
        },
        {
          label: "Fire",
          type: "image",
          url: "images/fire.png",
        },
        {
          label: "Miscellaneous Incident",
          type: "image",
          url: "images/yellow-triangle.png",
        },
        {
          label: "Critical Incident",
          type: "image",
          url: "images/red-triangle.png",
        },
      ],
    })
    .addTo(map);

  map.on("moveend", () => {
    localStorage.setItem("zoom", map.getZoom());

    const center = map.getCenter();
    localStorage.setItem("latitude", center.lat);
    localStorage.setItem("longitude", center.lng);
  });

  const OPEN_STREET_MAP_TILES =
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  L.tileLayer(OPEN_STREET_MAP_TILES, {
    maxZoom: 19,
    attribution:
      '<a href="https://patrolwave.com" target="_blank"><img src="images/patrolwave.png" width="77" height="9"></a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  if (USER_LATITUDE && USER_LONGITUDE) {
    L.marker([USER_LATITUDE, USER_LONGITUDE])
      .addTo(map)
      .bindTooltip("Your Location");
  }

  L.marker([TALLAHASSEE_LATITUDE, TALLAHASSEE_LONGITUDE], {
    icon: L.icon({
      iconUrl: "images/florida-highway-patrol.png",

      iconSize: [34, 34],
    }),
  })
    .addTo(map)
    .bindPopup("2900 Apalachee Parkway, Tallahassee, Florida 32399-0500")
    .bindTooltip("Florida Highway Patrol Headquarters");

  await pollIncidents(markers);

  mapElement.style.backgroundImage = "";

  setInterval(async () => {
    await pollIncidents(markers);
  }, 60000);
  map.addLayer(markers);
};

const pollIncidents = async (markers) => {
  const INCIDENTS_URL = "/incidents";

  try {
    const response = await fetch(INCIDENTS_URL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    const stringified_result = JSON.stringify(result);

    const SAVED_INCIDENTS = localStorage.getItem("incidents");

    if (stringified_result === SAVED_INCIDENTS) {
      if (!alreadyRun) {
        loadIncidentsOnMap(JSON.parse(SAVED_INCIDENTS), markers);
        alreadyRun = true;
      } else {
        return;
      }
    } else {
      localStorage.setItem("incidents", stringified_result);

      loadIncidentsOnMap(result, markers);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const loadIncidentsOnMap = (incidents, markers) => {
  const markersList = {
    yellowTriangle: L.icon({
      iconUrl: "images/yellow-triangle.png",

      iconSize: [34, 34],
    }),
    vehicleFire: L.icon({
      iconUrl: "images/vehicle-fire.png",

      iconSize: [34, 34],
    }),
    vehicleDisabled: L.icon({
      iconUrl: "images/vehicle-disabled.png",

      iconSize: [34, 34],
    }),
    vehicleCrash: L.icon({
      iconUrl: "images/vehicle-crash.png",

      iconSize: [34, 34],
    }),
    trafficBarricade: L.icon({
      iconUrl: "images/traffic-barricade.png",

      iconSize: [34, 34],
    }),
    redTriangle: L.icon({
      iconUrl: "images/red-triangle.png",

      iconSize: [34, 34],
    }),
    fire: L.icon({
      iconUrl: "images/fire.png",

      iconSize: [34, 34],
    }),
  };

  const VEHICLE_CRASH_SIGNALS = [
    "S4",
    "S4I",
    "S4IR",
    "S4P",
    "S4R",
    "S3",
    "S3I",
    "S3IR",
    "S3P",
    "S3R",
  ];

  const VEHICLE_FIRE_SIGNAL = "S25V";

  const VEHICLE_DISABLED_SIGNALS = ["S76", "S76P", "S76R"];

  const ROAD_OBSTRUCTION_SIGNALS = [
    "S16",
    "S16C",
    "S16D",
    "S16F",
    "S16I",
    "S16O",
    "S16S",
    "S16T",
    "S16W",
    "S38",
    "S38X",
  ];

  const FIRE_SIGNALS = [
    "S25",
    "S25A",
    "S25C",
    "S25D",
    "S25P",
    "S25F",
    "S25I",
    "S25S",
  ];

  const CRITICAL_INCIDENT_SIGNALS = [
    "S5",
    "S7",
    "S7B",
    "S7P",
    "S30",
    "S45",
    "S47",
    "S47D",
    "S48",
    "S55A",
    "S55B",
    "S55D",
    "S55S",
  ];

  markers.clearLayers();

  incidents.forEach((item) => {
    let marker;
    if (VEHICLE_CRASH_SIGNALS.includes(item.incidentType)) {
      marker = markersList.vehicleCrash;
    } else if (item.incidentType === VEHICLE_FIRE_SIGNAL) {
      marker = markersList.vehicleFire;
    } else if (VEHICLE_DISABLED_SIGNALS.includes(item.incidentType)) {
      marker = markersList.vehicleDisabled;
    } else if (ROAD_OBSTRUCTION_SIGNALS.includes(item.incidentType)) {
      marker = markersList.trafficBarricade;
    } else if (FIRE_SIGNALS.includes(item.incidentType)) {
      marker = markersList.fire;
    } else if (CRITICAL_INCIDENT_SIGNALS.includes(item.incidentType)) {
      marker = markersList.redTriangle;
    }

    markers.addLayer(
      L.marker([item.latitude, item.longitude], {
        icon: marker || markersList.yellowTriangle,
      })
        .bindPopup(
          `
          <strong>${item.incidentName || "No Incident Name"}</strong><br>${item.county || "No County"}<br>${item.location || "No Location"}<br>${item.remarks || "No Remarks"}
          `,
        )
        .bindTooltip(item.incidentType || "No Incident Type"),
    );
  });
};

const TALLAHASSEE_LATITUDE = 30.4468;
const TALLAHASSEE_LONGITUDE = -84.2157;
const ZOOM_LEVEL = 13;

const mapElement = document.getElementById("map");
mapElement.style.backgroundImage = "url('images/loader.gif')";
mapElement.style.backgroundRepeat = "no-repeat";
mapElement.style.backgroundPosition = "center";

const SAVED_LATITUDE = localStorage.getItem("latitude");
const SAVED_LONGITUDE = localStorage.getItem("longitude");
const SAVED_ZOOM = localStorage.getItem("zoom");

const GEOLOCATION_IS_AVAILABLE = "geolocation" in navigator;
const LOCAL_STORAGE_IS_SET = SAVED_LATITUDE || SAVED_LONGITUDE || SAVED_ZOOM;

if (GEOLOCATION_IS_AVAILABLE) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const USER_LATITUDE = position.coords.latitude;
      const USER_LONGITUDE = position.coords.longitude;

      const LATITUDE = SAVED_LATITUDE ? SAVED_LATITUDE : USER_LATITUDE;
      const LONGITUDE = SAVED_LONGITUDE ? SAVED_LONGITUDE : USER_LONGITUDE;
      const ZOOM = SAVED_ZOOM ? SAVED_ZOOM : ZOOM_LEVEL;

      const map = L.map("map").setView(
        [LATITUDE || TALLAHASSEE_LATITUDE, LONGITUDE || TALLAHASSEE_LONGITUDE],
        ZOOM,
      );
      initializeMap(map, USER_LATITUDE, USER_LONGITUDE);
    },
    (error) => {
      const map = L.map("map").setView(
        [TALLAHASSEE_LATITUDE, TALLAHASSEE_LONGITUDE],
        ZOOM_LEVEL,
      );
      initializeMap(map);
    },
  );
} else {
  const map = L.map("map").setView(
    [TALLAHASSEE_LATITUDE, TALLAHASSEE_LONGITUDE],
    ZOOM_LEVEL,
  );
  initializeMap(map);
}
