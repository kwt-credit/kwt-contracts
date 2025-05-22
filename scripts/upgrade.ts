import { ethers, upgrades } from "hardhat";

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  if (!proxyAddress) {
    throw new Error("PROXY_ADDRESS environment variable is required");
  }

  console.log("Upgrading KoreanWonToken...");

  const KoreanWonToken = await ethers.getContractFactory("KoreanWonToken");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, KoreanWonToken);
  await upgraded.waitForDeployment();

  console.log("KoreanWonToken upgraded");

  // 새로운 구현체 컨트랙트 주소 가져오기
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("New implementation deployed to:", implementationAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
