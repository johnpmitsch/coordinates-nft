import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { ethers } from "ethers";
import Coordinates from "./artifacts/contracts/Coordinates.sol/Coordinates.json";
import detectEthereumProvider from "@metamask/detect-provider";
import TopBar from "./components/TopBar";
import "./App.css";

const coordinateAddress =
  process.env.NODE_ENV === "production"
    ? "0xe034Eb1390Bd82BB03448Ca00e034ABBA3d69F2f"
    : "0x2B5FD4355bC8882a75A0c255c940D586F9CAB3f0";

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9obm1pdHNjaCIsImEiOiJja3RtZGhoaDUwOXRtMnZvNzBuaXoxb3RhIn0.5xbVwWkmOiGBdOVL5jpBgw";

function App() {
  const [map, setMap] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [loadingCoors, setLoadingCoors] = useState(false);
  const [loadingMint, setLoadingMint] = useState(false);
  const [minted, setMinted] = useState(null);
  const [limit, setLimit] = useState(null);
  const [wallet, setWallet] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const node = useRef(null);
  useEffect(() => {
    async function getWallet() {
      const windowEth = await detectEthereumProvider();
      if (windowEth) setWallet(windowEth);
    }
    getWallet();
  }, []);

  useEffect(() => {
    if (wallet?.selectedAddress) setUserAddress(wallet.selectedAddress);
  }, [wallet]);

  useEffect(() => {
    if (!wallet) return;
    wallet.on("accountsChanged", async function () {
      if (wallet.selectedAddress) setUserAddress(wallet.selectedAddress);
    });
  }, [wallet]);

  async function connectWallet() {
    if (typeof window.ethereum === "undefined") return;
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      coordinateAddress,
      Coordinates.abi,
      signer
    );
    if (contract) {
      const totalMinted = await contract.totalSupply(); // It's called total supply, but it's total minted
      const totalLimit = await contract.totalLimit(); // It's called total supply, but it's total minted
      setMinted(totalMinted.toNumber());
      setLimit(totalLimit.toNumber());
    }
  }

  useEffect(() => {
    const initMap = new mapboxgl.Map({
      container: node.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: [0, 0],
      zoom: 2,
    });
    initMap.loadImage("https://i.imgur.com/7f8sgd0.png", (error, image) => {
      if (error) return console.error(error);
      initMap.addImage("coor_pin", image);
    });

    setMap(initMap);
    return () => setMap(null) && initMap.remove();
  }, []);

  useEffect(() => {
    if (!map) return;
    if (!coordinates) return;
    // Add a GeoJSON source with a markers
    const id = "markers";
    // Remove layer and source and re add with new coordinates
    if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource(id)) map.removeSource(id);

    map.addSource(id, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: buildMarkers(coordinates),
      },
    });

    buildPolygons(map, coordinates);

    map.addLayer({
      id,
      type: "symbol",
      source: id,
      layout: {
        "icon-image": "coor_pin",
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
              <h2><strong>Coordinate #${id}</strong></h2>
              <p><strong>Latitude: </strong>${lat}</p>
              <p><strong>Longitude: </strong>${lng}</p>
            </div>
          `,
          title: `Coordinate #${id}`,
        },
      };
    });
  };

  const buildPolygons = (map, coors) => {
    coors.forEach((coor) => {
      const { id, lat, lng } = coor;
      const polygonId = `territory${id}`;
      // Remove layer and source and re add with new coordinates
      if (map.getLayer(polygonId)) map.removeLayer(polygonId);
      if (map.getSource(polygonId)) map.removeSource(polygonId);
      const lngInt = parseInt(lng);
      const latInt = parseInt(lat);
      map.addSource(polygonId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [lngInt - 0.5, latInt - 0.5],
                [lngInt + 0.5, latInt - 0.5],
                [lngInt + 0.5, latInt + 0.5],
                [lngInt - 0.5, latInt + 0.5],
                [lngInt - 0.5, latInt + 0.5],
              ],
            ],
          },
        },
      });

      map.addLayer({
        id: polygonId,
        type: "fill",
        source: polygonId, // reference the data source
        layout: {},
        paint: {
          //"fill-color": "#e2e3cb",
          "fill-color": "#37ff30",
          "fill-opacity": 0.3,
        },
      });
    });
  };

  const flyToCoor = (lat, lng) => {
    map.flyTo({ center: [lng, lat], zoom: 4 });
  };

  async function mintCoordinates() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      setLoadingMint(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          coordinateAddress,
          Coordinates.abi,
          signer
        );
        const transaction = await contract.claim();
        await transaction.wait();
      } catch (err) {
        console.error("Error: ", err);
      } finally {
        setLoadingMint(false);
      }
    } else {
      alert("Please install MetaMask wallet to use Coordinates");
    }
  }

  async function getCoordinates() {
    if (typeof window.ethereum !== "undefined") {
      setLoadingCoors(true);
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
          const uri = await contract.tokenURI(tokenId.toNumber());
          userCoordinates.push(dataToCoordinates(uri));
        }
        setCoordinates(userCoordinates);
      } catch (err) {
        console.error("Error: ", err);
      } finally {
        setLoadingCoors(false);
      }
    } else {
      alert("Please install MetaMask wallet to use Coordinates");
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
        <TopBar
          {...{
            userAddress,
            coordinates,
            mintCoordinates,
            getCoordinates,
            loadingCoors,
            loadingMint,
            minted,
            limit,
            flyToCoor,
            wallet,
            connectWallet,
            setUserAddress,
          }}
        />
      </div>
      <div>
        <div ref={node} className="mapContainer" />
      </div>
    </div>
  );
}

export default App;
