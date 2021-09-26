import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { ethers } from "ethers";
import Coordinates from "./artifacts/contracts/Coordinates.sol/Coordinates.json";
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
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [0, 0],
      zoom: 3,
    });
    // Clean up on unmount
    initMap.loadImage(
      "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png",
      (error, image) => {
        if (error) throw error;
        initMap.addImage("custom-marker", image);
      }
    );

    setMap(initMap);
    return () => initMap.remove();
  }, []);

  useEffect(() => {
    if (!map) return;
    if (!coordinates) return;
    // Add a GeoJSON source with a markers
    const id = "markers";
    const markersSource = map.getSource(id);
    const markersLayer = map.getLayer(id);
    // Remove layer and source and re add with new coordinates
    if (markersLayer) map.removeLayer(id);
    if (markersSource) map.removeSource(id);

    console.log(coordinates);
    console.log(buildMarkers(coordinates));
    map.addSource(id, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: buildMarkers(coordinates),
      },
    });

    console.log(map.getSource(id));
    // Add a symbol layer
    map.addLayer({
      id,
      type: "symbol",
      source: id,
      layout: {
        "icon-image": "custom-marker",
      },
    });

    map.flyTo({ center: [0, 0], zoom: 1 });
  }, [coordinates]);

  const buildMarkers = (coors) => {
    return coors.map((coor) => {
      const { id, lat, lng } = coor;

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lat, lng],
        },
        properties: {
          title: `Coordinate #${id}`,
          lng,
          lat,
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
        {loading && <div>Loading...</div>}
        <button onClick={mintCoordinates}>Mint Coordinates</button>
        <button onClick={getCoordinates}>Show My Coordinates</button>
      </div>
      <div>
        <div ref={node} className="mapContainer" />
      </div>
    </div>
  );
}
export default App;
