import "./App.css";
import { useState } from "react";
import { ethers } from "ethers";
import Coordinates from "../artifacts/contracts/Coordinates.sol/Coordinates.json";

const coordinateAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [greeting, setCoordinatesValue] = useState();

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function fetchCoordinates() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log({ provider });
      const contract = new ethers.Contract(
        coordinateAddress,
        Coordinates.abi,
        provider
      );
      try {
        const data = await contract.claim(1);
        console.log("data: ", data);
        console.log({ provider });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async function setCoordinates() {
    if (!greeting) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log({ provider });
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        coordinateAddress,
        Greeter.abi,
        signer
      );
      const transaction = await contract.setCoordinates(greeting);
      await transaction.wait();
      fetchCoordinates();
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={fetchCoordinates}>Fetch Coordinates</button>
        <button onClick={setCoordinates}>Set Coordinates</button>
        <br />
      </header>
    </div>
  );
}

export default App;
