require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

//const pk = process.env.dapk
const pk = "ccc7e61e53eb22dad7bb268e1ffc09c4757e001c24422bd1646b20a65ab240ab";

module.exports = {
  defaultNetwork: "hardhat",
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/artifacts",
  },
  networks: {
    hardhat: {},
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/7228b494adf94a63bab07ea737183033",
      accounts: [`0x${pk}`],
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/912debd4ed80486b9644156febf8e993",
      accounts: [
        `0xccc7e61e53eb22dad7bb268e1ffc09c4757e001c24422bd1646b20a65ab240ab`,
      ],
    },
  },
  mocha: {
    timeout: 120 * 60 * 1000, // 120 minutes to allow minting
  },
};
