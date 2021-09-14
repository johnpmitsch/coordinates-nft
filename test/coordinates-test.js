const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Coordinates", function () {
  it("Deploy", async function () {
    const Coordinates = await hre.ethers.getContractFactory("Coordinates");
    const coordinates = await Coordinates.deploy();
    await coordinates.deployed();
    await coordinates.claim(1)
    await coordinates.claim(2)
    const uri = await coordinates.tokenURI(1)
    const uri2 = await coordinates.tokenURI(2)
    const uri3 = await coordinates.tokenURI(3)
    console.log(uri, uri2, uri3);

    //const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    //await setGreetingTx.wait();

    expect(true).to.equal(true);
  });
});
