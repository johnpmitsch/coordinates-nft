import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { ethers } from "ethers";
import Coordinates from "./artifacts/contracts/Coordinates.sol/Coordinates.json";
import "./App.css";

const coordinateAddress = "0xEc77fF6f35de5dDC4755da6d41B4673f8b9800e1";

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9obm1pdHNjaCIsImEiOiJja3RtZGhoaDUwOXRtMnZvNzBuaXoxb3RhIn0.5xbVwWkmOiGBdOVL5jpBgw";

function App() {
  const [zoom, setZoom] = useState(2);
  const [map, setMap] = useState(null);
  const [coordinates, setCoordinates] = useState({});
  const node = useRef(null);

  useEffect(() => {
    async function getCoordinates() {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          coordinateAddress,
          Coordinates.abi,
          provider
        );
        try {
          const data = await contract.tokenURI(2);
          setCoordinates(dataToCoordinates(data));
          console.log("data: ", dataToCoordinates(data));
        } catch (err) {
          console.log("Error: ", err);
        }
      }
    }
    getCoordinates();
  }, []);

  useEffect(() => {
    const { lng = 0, lat = 0 } = coordinates;
    const initMap = new mapboxgl.Map({
      container: node.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [lng, lat],
      zoom: zoom,
    });
    setMap(initMap);
    // Clean up on unmount
    return () => initMap.remove();
  }, []);

  useEffect(() => {
    if (!map) return;
    const { lng, lat, id } = coordinates;
    map.loadImage(
      "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png",
      (error, image) => {
        if (error) throw error;
        map.addImage("custom-marker", image);
        // Add a GeoJSON source with a points
        map.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                // feature for Mapbox DC
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [lng, lat],
                },
                properties: {
                  title: `Coordinate #${id}`,
                },
              },
            ],
          },
        });

        // Add a symbol layer
        map.addLayer({
          id: "points",
          type: "symbol",
          source: "points",
          layout: {
            "icon-image": "custom-marker",
            // get the title name from the source's "title" property
            "text-field": ["get", "title"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
          },
        });
      }
    );

    map.flyTo({
      center: { lng, lat },
      speed: 0.6,
      zoom: 9,
    });
  }, [coordinates]);

  function dataToCoordinates(data) {
    const b64json = data.split("base64,")[1];
    const jsonString = Buffer.from(b64json, "base64").toString();
    const { id, latitude: lat, longitude: lng } = JSON.parse(jsonString);
    return { id, lat, lng };
  }

  return (
    <div className="App">
      <div className="App-header"></div>
      <div>
        <div ref={node} className="mapContainer" />
      </div>
    </div>
  );
}
export default App;
