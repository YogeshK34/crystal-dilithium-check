const hre = require("hardhat")

async function main() {
  const [deployer] = await hre.ethers.getSigners()

  // Get the wallet address you want to fund (replace with your generated address)
  const walletAddress = process.argv[2]
  const amount = process.argv[3] || "10.0"

  if (!walletAddress) {
    console.log("Usage: npx hardhat run scripts/fund-wallet.js --network localhost <wallet_address> [amount]")
    console.log(
      "Example: npx hardhat run scripts/fund-wallet.js --network localhost 0x2a919c9cd6f4128a854259ecdfccba7c651d0034 5.0",
    )
    return
  }

  console.log("Funding wallet:", walletAddress)
  console.log("Amount:", amount, "ETH")
  console.log("From account:", deployer.address)

  // Check deployer balance
  const deployerBalance = await hre.ethers.provider.getBalance(deployer.address)
  console.log("Deployer balance:", hre.ethers.formatEther(deployerBalance), "ETH")

  // Check wallet balance before
  const balanceBefore = await hre.ethers.provider.getBalance(walletAddress)
  console.log("Wallet balance before:", hre.ethers.formatEther(balanceBefore), "ETH")

  // Send transaction
  const tx = await deployer.sendTransaction({
    to: walletAddress,
    value: hre.ethers.parseEther(amount),
  })

  console.log("Transaction hash:", tx.hash)
  await tx.wait()

  // Check wallet balance after
  const balanceAfter = await hre.ethers.provider.getBalance(walletAddress)
  console.log("Wallet balance after:", hre.ethers.formatEther(balanceAfter), "ETH")

  console.log("✅ Funding complete!")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
