import "./App.css";
import { ethers } from "ethers";
import Coordinates from "./artifacts/contracts/Coordinates.sol/Coordinates.json";

const coordinateAddress = "0xEc77fF6f35de5dDC4755da6d41B4673f8b9800e1";

function App() {
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function fetchCoordinates() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(coordinateAddress);
      console.log(balance);
      const contract = new ethers.Contract(
        coordinateAddress,
        Coordinates.abi,
        provider
      );
      try {
        const data = await contract.token(2);
        console.log("data: ", data);
        console.log({ provider });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
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
      fetchCoordinates();
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={fetchCoordinates}>Fetch Coordinates</button>
        <button onClick={mintCoordinates}>Mint Coordinates</button>
        <br />
      </header>
    </div>
  );
}

export default App;
