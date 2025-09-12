const { ethers } = require("hardhat")

async function main() {
  const [deployer] = await ethers.getSigners()
  const balance = await ethers.provider.getBalance(deployer.address)

  console.log("Account balance:", ethers.formatEther(balance), "ETH")
  console.log("Account address:", deployer.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
