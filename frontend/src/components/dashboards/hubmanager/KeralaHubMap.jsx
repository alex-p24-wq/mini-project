import React, { useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";

// Accurate Kerala map rendered from district GeoJSON via react-simple-maps
// Clicking a marker calls onSelectDistrict(district)
export default function KeralaHubMap({ onSelectDistrict }) {
  // Public GeoJSON of Kerala districts (GeoHacker repo)
  const KERALA_GEOJSON_URL =
    "https://raw.githubusercontent.com/geohacker/kerala/master/geojsons/district.geojson";

  // Districts to show as markers (14 total)
  const districtNames = useMemo(
    () => [
      "Kasaragod",
      "Kannur",
      "Wayanad",
      "Kozhikode",
      "Malappuram",
      "Palakkad",
      "Thrissur",
      "Ernakulam",
      "Idukki",
      "Kottayam",
      "Alappuzha",
      "Pathanamthitta",
      "Kollam",
      "Thiruvananthapuram",
    ],
    []
  );

  const handleMarkerClick = (name) => {
    if (typeof onSelectDistrict === "function") onSelectDistrict(name);
  };

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ margin: 0 }}>Kerala Hub Network Map</h4>
        <div style={{ fontSize: 12, color: "#666" }}>Click a district marker to view hubs</div>
      </div>

      <div style={{ background: "#f7fbff", border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [76.6, 10.4], scale: 9000 }}
          style={{ width: "100%", height: "680px" }}
        >
          <Geographies geography={KERALA_GEOJSON_URL}>
            {({ geographies }) => (
              <>
                {geographies
                  .filter((g) => g.properties?.ST_NM === "Kerala")
                  .map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: { fill: "#e6f0fb", stroke: "#bcd4f6", strokeWidth: 0.8 },
                        hover: { fill: "#d7e9fd", stroke: "#90b9f7", strokeWidth: 1 },
                        pressed: { fill: "#cfe3fd" },
                      }}
                    />
                  ))}

                {/* Markers at district centroids */}
                {geographies
                  .filter((g) => g.properties?.ST_NM === "Kerala")
                  .map((geo) => {
                    const name = geo.properties?.DISTRICT;
                    if (!districtNames.includes(name)) return null;
                    const [lon, lat] = geoCentroid(geo);
                    return (
                      <Marker key={`m-${name}`} coordinates={[lon, lat]}>
                        <g
                          onClick={() => handleMarkerClick(name)}
                          style={{ cursor: "pointer" }}
                          transform="translate(0,0)"
                        >
                          <circle r={5} fill="#2196F3" stroke="#fff" strokeWidth={2} />
                          <text
                            textAnchor="middle"
                            y={-10}
                            style={{ fontFamily: "system-ui, sans-serif", fill: "#0d47a1", fontSize: 10, fontWeight: 600 }}
                          >
                            {name}
                          </text>
                        </g>
                      </Marker>
                    );
                  })}
              </>
            )}
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
}
