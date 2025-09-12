const hre = require("hardhat")

async function main() {
  const args = process.argv.slice(2)
  const walletAddress = args[0]
  const amount = args[1] || "10.0"

  if (!walletAddress) {
    console.log("Usage: npx hardhat run scripts/fund-wallet.js --network localhost -- <wallet_address> [amount]")
    console.log(
      "Example: npx hardhat run scripts/fund-wallet.js --network localhost -- 0x2a919c9cd6f4128a854259ecdfccba7c651d0034 5.0",
    )
    console.log("\nNote: Use '--' before arguments to separate them from Hardhat flags")
    return
  }

  if (!hre.ethers.isAddress(walletAddress)) {
    console.error("❌ Invalid Ethereum address:", walletAddress)
    return
  }

  const [deployer] = await hre.ethers.getSigners()

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
