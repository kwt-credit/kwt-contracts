import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const KoreanWonToken = await ethers.getContractFactory("KoreanWonToken");

  console.log("Deploying KoreanWonToken...");
  const proxy = await upgrades.deployProxy(KoreanWonToken,
    [deployer.address, deployer.address], // [recipient, initialOwner]
    {
      kind: 'uups',
      initializer: 'initialize'
    }
  );
  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  console.log("KoreanWonToken proxy deployed to:", proxyAddress);

  // 구현체 컨트랙트 주소 가져오기
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("KoreanWonToken implementation deployed to:", implementationAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});