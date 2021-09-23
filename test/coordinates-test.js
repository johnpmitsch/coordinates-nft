const { expect } = require("chai");

const countArr = (arr) => {
  const counts = {};
  for (const num of arr) {
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  }
  return counts;
};

describe("Coordinates check", () => {
  it.skip("check the numbers returned for the coordinates", async function () {
    const Coordinates = await hre.ethers.getContractFactory("Coordinates");
    const coordinates = await Coordinates.deploy();
    await coordinates.deployed();
    const allLats = [];
    const allLons = [];

    const total = 65341;

    for (let i = 1; i <= total; i++) {
      // Need to change this to a public method to test
      const coor = await coordinates.getCoordinatesFromId(i);
      const lon = coor.latitude.toNumber();
      const lat = coor.longitude.toNumber();
      allLats.push(lat);
      allLons.push(lon);
    }

    console.table(countArr(allLats.sort((a, b) => b - a)));
    console.table(countArr(allLons.sort((a, b) => b - a)));

    expect(true).to.equal(true);
  });

  it("Deploy and mint tokens", async function () {
    const Coordinates = await hre.ethers.getContractFactory("Coordinates");
    const coordinates = await Coordinates.deploy();
    await coordinates.deployed();
    const allLats = [];
    const allLons = [];

    // test all, takes a while and likely OOMs
    //const total = 65341;
    const total = 100;
    console.log("Minting... it may take a while");
    for (let i = 1; i <= total; i++) {
      await coordinates.claim(i);
      const uri = await coordinates.tokenURI(i);
      b64json = uri.split("base64,")[1];
      jsonString = Buffer.from(b64json, "base64").toString();
      console.log(jsonString);

      const { id, latitude: lat, longitude: lon } = JSON.parse(jsonString);
      console.log({ id, lat, lon });
      allLats.push(Number(lat));
      allLons.push(Number(lon));
    }

    console.table(countArr(allLats.sort((a, b) => b - a)));
    console.table(countArr(allLons.sort((a, b) => b - a)));

    expect(true).to.equal(true);
  });
});
