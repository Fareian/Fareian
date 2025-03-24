# Ethereum Contract Deployment Bot

This bot automatically deploys smart contracts to the Ethereum network with improved error handling and rate limiting.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- An Ethereum wallet with funds
- Access to an Ethereum node (e.g., Infura, Alchemy)

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your:
   - RPC_URL (from Infura, Alchemy, or other provider)
   - PRIVATE_KEY (your wallet's private key)

5. Compile the contract:
   ```bash
   npx hardhat compile
   ```

6. Get the contract bytecode:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   Copy the bytecode from the output and replace the placeholder in `scripts/deployBot.js`

## Usage

Run the deployment bot:
```bash
node scripts/deployBot.js
```

The bot will:
- Deploy contracts with retry logic
- Implement exponential backoff for failed deployments
- Handle network errors gracefully
- Stop after 5 consecutive failures
- Can be stopped gracefully with Ctrl+C

## Features

- Automatic retry mechanism
- Exponential backoff for failed deployments
- Balance checking before deployment
- Graceful shutdown handling
- Configurable delays between deployments
- Error logging and monitoring

## Security Notes

- Never commit your `.env` file
- Keep your private key secure
- Ensure your wallet has sufficient funds
- Monitor gas prices and adjust delays if needed

## License

MIT 