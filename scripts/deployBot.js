const { ethers } = require("ethers");
require("dotenv").config();

// Load environment variables
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MAX_RETRIES = 3;
const MAX_DELAY = 10000; // 10 seconds
const MIN_DELAY = 3000;  // 3 seconds
const GAS_LIMIT = 3000000; // Adjust based on your contract
const MAX_GAS_PRICE = ethers.parseUnits("50", "gwei"); // 50 gwei

if (!RPC_URL || !PRIVATE_KEY) {
    throw new Error("Please set RPC_URL and PRIVATE_KEY in your .env file");
}

// Set up provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Contract ABI & Bytecode (replace with actual values after compilation)
const ABI = [
    "function store(uint256 x) public",
    "function retrieve() public view returns (uint256)",
    "event DataStored(uint256 newValue)"
];
const BYTECODE = "0x..."; // Replace with actual bytecode after compilation

// Improved random delay function with exponential backoff
const getDelay = (retryCount) => {
    const baseDelay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;
    return baseDelay * Math.pow(2, retryCount);
};

// Get current gas price with safety check
const getGasPrice = async () => {
    const gasPrice = await provider.getFeeData();
    return gasPrice.gasPrice ? Math.min(gasPrice.gasPrice, MAX_GAS_PRICE) : MAX_GAS_PRICE;
};

// Deploy contract function with retry logic
const deployContract = async (retryCount = 0) => {
    try {
        console.log(`Starting deployment (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        
        // Check wallet balance
        const balance = await provider.getBalance(wallet.address);
        if (balance === 0n) {
            throw new Error("Insufficient funds for deployment");
        }

        // Get current gas price
        const gasPrice = await getGasPrice();
        console.log(`Current gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);

        const factory = new ethers.ContractFactory(ABI, BYTECODE, wallet);
        const contract = await factory.deploy({
            gasLimit: GAS_LIMIT,
            gasPrice: gasPrice
        });
        
        console.log("Waiting for transaction confirmation...");
        const receipt = await contract.deploymentTransaction().wait();
        console.log(`Gas used: ${receipt.gasUsed}`);
        console.log(`Contract deployed successfully at: ${contract.target}`);
        return contract;
    } catch (error) {
        console.error(`Deployment attempt ${retryCount + 1} failed:`, error.message);
        
        if (retryCount < MAX_RETRIES - 1) {
            const delay = getDelay(retryCount);
            console.log(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return deployContract(retryCount + 1);
        }
        
        throw error;
    }
};

// Periodic deployment loop with improved error handling
const main = async () => {
    let consecutiveFailures = 0;
    const MAX_CONSECUTIVE_FAILURES = 5;

    while (true) {
        try {
            await deployContract();
            consecutiveFailures = 0;
            
            // Random delay between successful deployments
            const delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;
            console.log(`Waiting ${delay/1000} seconds before next deployment...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error) {
            consecutiveFailures++;
            console.error(`Failed to deploy contract: ${error.message}`);
            
            if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                console.error("Too many consecutive failures. Stopping bot.");
                process.exit(1);
            }
            
            // Longer delay after failures
            const delay = getDelay(consecutiveFailures);
            console.log(`Waiting ${delay/1000} seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    process.exit(0);
});

// Run the bot
main().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
}); 