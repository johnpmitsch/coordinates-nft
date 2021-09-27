import React, { useEffect, useRef, useState } from "react";
import { Button, Stack, Center } from "@chakra-ui/react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { ethers } from "ethers";
import Coordinates from "./artifacts/contracts/Coordinates.sol/Coordinates.json";
import canvaPin from "./images/canva_pin.png";
import pulsingDot from "./pulsingDot";
import "./App.css";

const coordinateAddress = "0xEc77fF6f35de5dDC4755da6d41B4673f8b9800e1";

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9obm1pdHNjaCIsImEiOiJja3RtZGhoaDUwOXRtMnZvNzBuaXoxb3RhIn0.5xbVwWkmOiGBdOVL5jpBgw";

function App() {
  const [map, setMap] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const node = useRef(null);

  useEffect(() => {
    const initMap = new mapboxgl.Map({
      container: node.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: [0, 0],
      zoom: 2,
    });
    const pin = new Image(40, 40);
    pin.src = canvaPin;
    console.log(pin);
    initMap.addImage("custom-marker", pin);

    setMap(initMap);
    return () => setMap(null) && initMap.remove();
  }, []);

  useEffect(() => {
    if (!map) return;
    if (!coordinates) return;
    // Add a GeoJSON source with a markers
    const id = "markers";
    const markersSource = map.getSource("dot-point");
    const markersLayer = map.getLayer("layer-with-pulsing-dot");
    // Remove layer and source and re add with new coordinates
    if (map.hasImage("pulsing-dot")) map.removeImage("pulsing-dot");
    if (markersSource) map.removeSource("dot-point");
    if (markersLayer) map.removeLayer("layer-with-pulsing-dot");
    const size = 100;
    const dot = pulsingDot(map, size);
    map.addImage("pulsing-dot", dot, { pixelRatio: 2 });

    map.addSource("dot-point", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: buildMarkers(coordinates),
      },
    });

    // Add a symbol layer
    map.addLayer({
      id: "layer-with-pulsing-dot",
      type: "symbol",
      source: "dot-point",
      layout: {
        "icon-image": "pulsing-dot",
        "icon-ignore-placement": true,
        "icon-allow-overlap": true,
        "icon-size": 0.9,
      },
    });

    map.flyTo({ center: [0, 0], zoom: 1 });

    // location of the feature, with description HTML from its properties.
    map.on("click", id, (e) => {
      // Copy coordinates array.
      const coors = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.description;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coors[0]) > 180) {
        coors[0] += e.lngLat.lng > coors[0] ? 360 : -360;
      }

      new mapboxgl.Popup().setLngLat(coors).setHTML(description).addTo(map);
    });

    map.on("mouseenter", id, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", id, () => {
      map.getCanvas().style.cursor = "";
    });
  }, [coordinates]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildMarkers = (coors) => {
    return coors.map((coor) => {
      const { id, lat, lng } = coor;

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        properties: {
          description: `
            <div class="coor-marker">
              <h3>Coordinate #${id}</h3>
              <p><strong>Latitude: </strong>${lat}</p>
              <p><strong>Longitude: </strong>${lng}</p>
            </div>
          `,
          title: `Coordinate #${id}`,
        },
      };
    });
  };

  async function mintCoordinates() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        coordinateAddress,
        Coordinates.abi,
        signer
      );
      const transaction = await contract.claim();
      await transaction.wait();
    }
  }

  async function getCoordinates() {
    if (typeof window.ethereum !== "undefined") {
      setLoading(true);
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(
        coordinateAddress,
        Coordinates.abi,
        provider
      );
      try {
        const userCoordinates = [];
        const balance = await contract.balanceOf(userAddress);
        for (let i = 0; i < balance; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
          const uri = await contract.tokenURI(tokenId);
          userCoordinates.push(dataToCoordinates(uri));
        }
        setCoordinates(userCoordinates);
      } catch (err) {
        console.log("Error: ", err);
      } finally {
        setLoading(false);
      }
    }
  }

  const dataToCoordinates = (data) => {
    const b64json = data.split("base64,")[1];
    const jsonString = Buffer.from(b64json, "base64").toString();
    const { id, latitude: lat, longitude: lng } = JSON.parse(jsonString);
    return { id, lat, lng };
  };

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  return (
    <div className="App">
      <div className="App-header">
        <Center style={{ height: "100%" }}>
          <Stack spacing={4} direction="row" align="center">
            <Button
              colorScheme="coorsGreen"
              size="md"
              onClick={mintCoordinates}
            >
              Mint Coordinates
            </Button>
            <Button
              isLoading={loading}
              colorScheme="coorsGreen"
              size="md"
              onClick={getCoordinates}
            >
              Show My Coordinates
            </Button>
          </Stack>
        </Center>
      </div>
      <div>
        <div ref={node} className="mapContainer" />
      </div>
    </div>
  );
}

export default App;
