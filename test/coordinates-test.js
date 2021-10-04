const { expect, assert } = require("chai");

const uriToString = (uri) => {
  b64json = uri.split("base64,")[1];
  jsonString = Buffer.from(b64json, "base64").toString();
  return JSON.parse(jsonString);
};

const countArr = (arr) => {
  const counts = {};
  for (const num of arr) {
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  }
  return counts;
};

describe("Coordinates check", () => {
  it("Can mint COOR for non-owners and read JSON", async function () {
    const [_owner, addr1, addr2] = await ethers.getSigners();
    const Coordinates = await hre.ethers.getContractFactory("Coordinates");
    const coordinates = await Coordinates.deploy();
    await coordinates.deployed();

    await coordinates.connect(addr1).claim();
    expect(await coordinates.balanceOf(addr1.address)).to.equal(1);
    expect(await coordinates.tokenOfOwnerByIndex(addr1.address, 0)).to.equal(1);
    const uri = await coordinates.tokenURI(1);
    const { id, latitude: lat, longitude: lon } = uriToString(uri);
    assert(id);
    assert(lat);
    assert(lon);

    await coordinates.connect(addr2).claim();
    expect(await coordinates.balanceOf(addr2.address)).to.equal(1);
    expect(await coordinates.tokenOfOwnerByIndex(addr2.address, 0)).to.equal(2);
  });

  it("Can mint COOR for owner", async function () {
    const [owner] = await ethers.getSigners();
    const Coordinates = await hre.ethers.getContractFactory("Coordinates");
    const coordinates = await Coordinates.deploy();
    await coordinates.deployed();

    const mint1 = 60001;
    await coordinates.connect(owner).ownerClaim(mint1);
    const uri1 = await coordinates.tokenURI(mint1);
    const { id: id1, latitude: lat1, longitude: lon1 } = uriToString(uri1);
    expect(parseInt(id1)).to.equal(mint1);
    assert(lat1);
    assert(lon1);

    const mint2 = 65341;
    await coordinates.connect(owner).ownerClaim(mint2);
    const uri2 = await coordinates.tokenURI(mint2);
    const { id: id2, latitude: lat2, longitude: lon2 } = uriToString(uri2);
    expect(parseInt(id2)).to.equal(mint2);
    assert(lat2);
    assert(lon2);

    await expect(
      coordinates.connect(owner).ownerClaim(60001)
    ).to.be.revertedWith("ERC721: token already minted");
    await expect(
      coordinates.connect(owner).ownerClaim(60000)
    ).to.be.revertedWith("Token ID invalid");
    await expect(
      coordinates.connect(owner).ownerClaim(65342)
    ).to.be.revertedWith("Token ID invalid");
  });

  // skip as this takes forever
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

  // skip as this takes forever
  it.skip("Deploy and mint tokens", async function () {
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
      await coordinates.claim();
      const uri = await coordinates.tokenURI(i);
      const { id, latitude: lat, longitude: lon } = uriToString(uri);
      console.log({ id, lat, lon });
      allLats.push(Number(lat));
      allLons.push(Number(lon));
    }

    console.table(countArr(allLats.sort((a, b) => b - a)));
    console.table(countArr(allLons.sort((a, b) => b - a)));

    expect(true).to.equal(true);
  });
});
