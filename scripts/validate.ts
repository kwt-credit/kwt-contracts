import { ethers, upgrades } from "hardhat";

async function main(): Promise<void> {
  const proxyAddress = process.env.PROXY_ADDRESS;
  if (!proxyAddress) {
    throw new Error("PROXY_ADDRESS environment variable is required");
  }

  console.log("🔍 Validating upgrade for proxy:", proxyAddress);

  const KoreanWonToken = await ethers.getContractFactory("KoreanWonToken");

  await upgrades.validateUpgrade(proxyAddress, KoreanWonToken, {
    kind: "uups",
  });

  console.log("✅ Upgrade validation passed.");
}

main().catch((error) => {
  console.error("❌ Upgrade validation failed:", error);
  process.exit(1);
});
