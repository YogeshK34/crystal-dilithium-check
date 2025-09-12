# Hardhat Balance Check Commands

## Quick Balance Check Commands

### 1. Check All Account Balances
\`\`\`bash
npx hardhat console --network localhost
\`\`\`
Then in the console:
\`\`\`javascript
const accounts = await ethers.getSigners()
for (let i = 0; i < accounts.length; i++) {
  const balance = await ethers.provider.getBalance(accounts[i].address)
  console.log(`Account ${i}: ${accounts[i].address} - ${ethers.utils.formatEther(balance)} ETH`)
}
\`\`\`

### 2. Check Specific Address Balance
\`\`\`bash
npx hardhat console --network localhost
\`\`\`
Then:
\`\`\`javascript
const balance = await ethers.provider.getBalance("0xYourAddressHere")
console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`)
\`\`\`

### 3. One-liner Balance Check
\`\`\`bash
npx hardhat run --network localhost scripts/check-balance.js
\`\`\`

Create `scripts/check-balance.js`:
\`\`\`javascript
async function main() {
  const [deployer] = await ethers.getSigners()
  const balance = await ethers.provider.getBalance(deployer.address)
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
\`\`\`

### 4. Monitor Balance Changes
\`\`\`bash
npx hardhat console --network localhost
\`\`\`
Then:
\`\`\`javascript
const address = "0xYourReceiverAddress"
setInterval(async () => {
  const balance = await ethers.provider.getBalance(address)
  console.log(`${new Date().toISOString()}: ${ethers.utils.formatEther(balance)} ETH`)
}, 5000) // Check every 5 seconds
\`\`\`

## Default Hardhat Accounts
When you run `npx hardhat node`, you get 20 accounts each with 10,000 ETH:
- Account 0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- Account 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
- Account 2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
- ... and 17 more

Use any of these as receiver addresses for testing!
