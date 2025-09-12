# Ethereum Wallet Setup Guide

## Overview
This guide walks you through setting up and testing the Ethereum wallet with hybrid post-quantum signatures using Hardhat local network.

## Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Hardhat** (installed via npm)

### Project Structure
\`\`\`
project/
├── hardhat/                 # Hardhat configuration and scripts
│   ├── scripts/
│   │   ├── fund-wallet.js   # Fund wallets with test ETH
│   │   └── check-balance.js # Check wallet balances
│   └── hardhat.config.js
└── nextjs/                  # Next.js application
    ├── components/
    │   └── ethereum-wallet.tsx
    └── lib/
        └── ethereum-utils.ts
\`\`\`

## Setup Instructions

### 1. Start Local Ethereum Network

Navigate to your Hardhat directory and start the local network:

\`\`\`bash
cd hardhat
npx hardhat node
\`\`\`

This will:
- Start a local Ethereum network on `http://localhost:8545`
- Create 20 test accounts with 10,000 ETH each
- Display account addresses and private keys
- Keep the network running for testing

### 2. Fund Your Generated Wallet

After generating a wallet in the Next.js UI, fund it with test ETH:

\`\`\`bash
# Fund specific wallet with custom amount
RECEIVER=0x91064ec806bf90af1f5157ed1b03686fe1a5d434 AMOUNT=500.0 node scripts/fund-wallet.js

# Fund with default amount (5 ETH)
RECEIVER=0x91064ec806bf90af1f5157ed1b03686fe1a5d434 node scripts/fund-wallet.js
\`\`\`

### 3. Verify Balances

Check wallet balances on the network:

\`\`\`bash
# Check specific wallet balance
node scripts/check-balance.js 0x91064ec806bf90af1f5157ed1b03686fe1a5d434

# Check all Hardhat account balances
node scripts/check-balance.js
\`\`\`

## Complete Testing Flow

### Step 1: Generate Wallet
1. Open the Next.js application
2. Go to **Network** tab → Connect to Local Network
3. Go to **Wallet** tab → Generate New Wallet
4. Note the wallet address (starts with 0 ETH)

### Step 2: Fund Wallet
\`\`\`bash
# Replace with your generated wallet address
RECEIVER=0xYourWalletAddress AMOUNT=10.0 node scripts/fund-wallet.js
\`\`\`

### Step 3: Verify Funding
1. In the UI, click the refresh button (🔄) next to wallet balance
2. Or run: `node scripts/check-balance.js 0xYourWalletAddress`
3. Balance should now show 10.0 ETH

### Step 4: Send Transaction
1. Go to **Transaction** tab
2. Enter receiver address (use another Hardhat account)
3. Set amount (e.g., 2.0 ETH)
4. Click **Sign Transaction**
5. Click **Broadcast to Network**

### Step 5: Verify Transaction
1. Click refresh (🔄) on both sender and receiver balances
2. Or use: `node scripts/check-balance.js <address>`
3. Verify ETH was transferred correctly

## Available Scripts

### fund-wallet.js
Transfers ETH from Hardhat accounts to any wallet address.

\`\`\`bash
# Usage with environment variables
RECEIVER=0x... AMOUNT=5.0 node scripts/fund-wallet.js

# Usage with command line arguments  
node scripts/fund-wallet.js 0x... 5.0
\`\`\`

### check-balance.js
Checks ETH balance of wallet addresses.

\`\`\`bash
# Check specific address
node scripts/check-balance.js 0x...

# Check all Hardhat accounts
node scripts/check-balance.js
\`\`\`

## Troubleshooting

### Network Connection Issues
- Ensure Hardhat node is running on `http://localhost:8545`
- Check firewall settings
- Verify no other services are using port 8545

### Balance Not Updating
- Click the refresh button (🔄) in the UI
- Wait a few seconds for network confirmation
- Use `check-balance.js` script to verify network state

### Transaction Failures
- Ensure wallet has sufficient ETH for gas fees
- Check that receiver address is valid (42 characters, starts with 0x)
- Verify network connection is active

### "Unknown Account" Errors
- This is expected for generated wallets (not managed by Hardhat)
- The system automatically uses Hardhat accounts for broadcasting
- Transactions will still complete successfully

## Security Notes

⚠️ **Important**: This setup is for testing only!

- Private keys are displayed in the UI for testing purposes
- Never use these wallets or keys on mainnet
- All ETH is test ETH with no real value
- Hardhat accounts have well-known private keys

## Next Steps

Once comfortable with the basic flow:
1. Test different transaction amounts
2. Experiment with multiple wallet addresses
3. Analyze hybrid signature components in the **Keys & Signatures** tab
4. Compare performance with traditional ECDSA signatures
