const { expect } = require("chai");
const { ethers } = require("hardhat");
const PromisePool = require("@supercharge/promise-pool");

const countArr = (arr) => {
  const counts = {};
  for (const num of arr) {
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  }
  return counts;
};

describe("Coordinates", () => {
  it("Deploy and mint all tokens", async function () {
    const Coordinates = await hre.ethers.getContractFactory("Coordinates");
    const coordinates = await Coordinates.deploy();
    await coordinates.deployed();
    const allLats = [];
    const allLons = [];

    //const total = 65340;
    const total = 10000;
    console.log("Minting... it may take a while");
    for (let i = 1; i <= total; i++) {
      await coordinates.claim(i);
      const uri = await coordinates.tokenURI(i);
      b64json = uri.split("base64,")[1];
      jsonString = Buffer.from(b64json, "base64").toString();
      const { latitude, longitude } = JSON.parse(jsonString);
      //actual latitude is lat - 91;
      const lat = latitude - 90;
      //actual lon is 180;
      const lon = longitude - 180;
      allLats.push(lat);
      allLons.push(lon);
    }

    console.table(countArr(allLats.sort((a, b) => b - a)));
    console.table(countArr(allLons.sort((a, b) => b - a)));

    expect(true).to.equal(true);
  });
});
