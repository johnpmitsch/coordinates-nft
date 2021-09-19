const { expect } = require("chai");
const PromisePool = require("@supercharge/promise-pool");

const countArr = (arr) => {
  const counts = {};
  for (const num of arr) {
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  }
  return counts;
};

const promiseAllInBatches = async (task, items, batchSize) => {
  let position = 0;
  let results = [];
  while (position < items.length) {
    const itemsForBatch = items.slice(position, position + batchSize);
    results = [
      ...results,
      ...(await Promise.all(itemsForBatch.map((item) => task(item)))),
    ];
    position += batchSize;
  }
  return results;
};

describe("Coordinates check", () => {
  it("check the numbers returned for the coordinates", async function () {
    const Coordinates = await hre.ethers.getContractFactory("Coordinates");
    const coordinates = await Coordinates.deploy();
    await coordinates.deployed();
    const allLats = [];
    const allLons = [];
    const allIds = [];

    const total = 65340;
    //const total = 1000;

    //console.log("Minting... it may take a while");
    //  allIds.push(i);
    //}

    //console.time("claim");
    //await promiseAllInBatches(coordinates.claim, allIds, 100);
    //console.timeEnd("claim");

    //console.time("tokenURI");
    //const uris = await promiseAllInBatches(coordinates.tokenURI, allIds, 100);
    //console.timeEnd("tokenURI");

    for (let i = 1; i <= total; i++) {
      //b64json = uri.split("base64,")[1];
      //jsonString = Buffer.from(b64json, "base64").toString();
      //const { latitude, longitude } = JSON.parse(jsonString);
      // Need to change getCoordinatesFromId to public function
      const coor = await coordinates.getCoordinatesFromId(i);
      const longitude = coor.longitude.toNumber();
      const latitude = coor.latitude.toNumber();
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
