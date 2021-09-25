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
    const { lon = 0, lat = 0 } = coordinates;
    const map = new mapboxgl.Map({
      container: node.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [lon, lat],
      zoom: zoom,
    });
  }, []);

  function dataToCoordinates(data) {
    const b64json = data.split("base64,")[1];
    const jsonString = Buffer.from(b64json, "base64").toString();
    const { id, latitude: lat, longitude: lon } = JSON.parse(jsonString);

    return { id, lat, lon };
  }

  return (
    <div className="App">
      <div>
        <div ref={node} className="mapContainer" />
      </div>
    </div>
  );
}
export default App;

/**

import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import Coordinates from "./artifacts/contracts/Coordinates.sol/Coordinates.json";
import "./App.css";

const coordinateAddress = "0xEc77fF6f35de5dDC4755da6d41B4673f8b9800e1";
mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9obm1pdHNjaCIsImEiOiJja3RtZGhoaDUwOXRtMnZvNzBuaXoxb3RhIn0.5xbVwWkmOiGBdOVL5jpBgw";

function App() {
  const mapContainer = useRef(null);
  const [map, setMap] = useState({});
  const [coordinates, setCoordinates] = useState({});
  const [zoom, setZoom] = useState(9);

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
    console.log("Hi");
    if (map && map.current) return; // initialize map only once
    const initializeMap = () => {
      const { lat, lon } = coordinates;
      if (mapContainer.current) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/satellite-v9",
          center: [lon, lat],
          zoom: 13,
        });
      }
      if (map) {
        setMap(map);
        map.resize();
      }
    };

    if (!map) initializeMap({ setMap, mapContainer });
  }, [map]);

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  function dataToCoordinates(data) {
    const b64json = data.split("base64,")[1];
    const jsonString = Buffer.from(b64json, "base64").toString();
    const { id, latitude: lat, longitude: lon } = JSON.parse(jsonString);

    return { id, lat, lon };
  }

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

  const { lat, lon } = coordinates;
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={mintCoordinates}>Mint Coordinates</button>
        {lat && lon && (
          <>
            <div>
              <div>{`latitude: ${lat}`}</div>
              <div>{`longitude: ${lon}`}</div>
            </div>
            <div>
              <div
                ref={(el) => (mapContainer.current = el)}
                className={"map-container"}
              />
              ;
            </div>
          </>
        )}
        <br />
      </header>
    </div>
  );
}

export default App;

*/
