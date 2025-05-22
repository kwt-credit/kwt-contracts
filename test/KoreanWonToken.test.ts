import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { KoreanWonToken, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("KoreanWonToken", function () {
  let koreanWonToken: KoreanWonToken;
  let mockToken: MockERC20;
  let owner: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  const DECIMALS = 6n;
  const INITIAL_SUPPLY = 100000000000n * (10n ** DECIMALS);

  beforeEach(async function () {
    [owner, recipient, addr1, addr2] = await ethers.getSigners();

    const KoreanWonToken = await ethers.getContractFactory("KoreanWonToken");
    koreanWonToken = await upgrades.deployProxy(
      KoreanWonToken,
      [recipient.address, owner.address],
      {
        initializer: 'initialize',
        kind: 'uups'
      }
    );
    await koreanWonToken.waitForDeployment();

    // Deploy Mock ERC20 Token for testing
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MTK");
    await mockToken.mint(await koreanWonToken.getAddress(), ethers.parseEther("1000")); // Mint 1000 tokens to KoreanWonToken contract
  });

  describe("Deployment", function () {
    it("should have correct name and symbol", async function () {
      expect(await koreanWonToken.name()).to.equal("Korean Won Token");
      expect(await koreanWonToken.symbol()).to.equal("KWT");
    });

    it("should set the correct initial supply", async function () {
      const recipientBalance = await koreanWonToken.balanceOf(recipient.address);
      expect(recipientBalance).to.equal(INITIAL_SUPPLY);
    });

    it("should set the correct owner", async function () {
      expect(await koreanWonToken.owner()).to.equal(owner.address);
    });

    it("should have correct decimals", async function () {
      expect(await koreanWonToken.decimals()).to.equal(DECIMALS);
    });
  });

  describe("Token Transfer", function () {
    it("should transfer tokens correctly", async function () {
      const transferAmount = 1000n * (10n ** DECIMALS);
      await koreanWonToken.connect(recipient).transfer(addr1.address, transferAmount);

      expect(await koreanWonToken.balanceOf(addr1.address)).to.equal(transferAmount);
      expect(await koreanWonToken.balanceOf(recipient.address)).to.equal(INITIAL_SUPPLY - transferAmount);
    });

    it("should fail when trying to transfer with insufficient balance", async function () {
      const transferAmount = INITIAL_SUPPLY + 1n;
      await expect(
        koreanWonToken.connect(addr1).transfer(addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(koreanWonToken, "ERC20InsufficientBalance");
    });
  });

  describe("Pausable", function () {
    it("should allow owner to pause the contract", async function () {
      await koreanWonToken.connect(owner).pause();
      expect(await koreanWonToken.paused()).to.be.true;
    });

    it("should not allow transfers when paused", async function () {
      await koreanWonToken.connect(owner).pause();
      const transferAmount = 1000n * (10n ** DECIMALS);

      await expect(
        koreanWonToken.connect(recipient).transfer(addr1.address, transferAmount)
      ).to.be.revertedWithCustomError(koreanWonToken, "EnforcedPause");
    });

    it("should allow owner to unpause the contract", async function () {
      await koreanWonToken.connect(owner).pause();
      await koreanWonToken.connect(owner).unpause();
      expect(await koreanWonToken.paused()).to.be.false;
    });

    it("should not allow non-owner to pause", async function () {
      await expect(
        koreanWonToken.connect(addr1).pause()
      ).to.be.revertedWithCustomError(koreanWonToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Minting", function () {
    it("should allow owner to mint new tokens", async function () {
      const mintAmount = 1000n * (10n ** DECIMALS);
      await koreanWonToken.connect(owner).mint(addr1.address, mintAmount);

      expect(await koreanWonToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("should not allow non-owner to mint tokens", async function () {
      const mintAmount = 1000n * (10n ** DECIMALS);
      await expect(
        koreanWonToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWithCustomError(koreanWonToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Burning", function () {
    it("should allow token holders to burn their tokens", async function () {
      const burnAmount = 1000n * (10n ** DECIMALS);
      await koreanWonToken.connect(recipient).burn(burnAmount);

      expect(await koreanWonToken.balanceOf(recipient.address)).to.equal(INITIAL_SUPPLY - burnAmount);
    });

    it("should not allow burning more tokens than balance", async function () {
      const burnAmount = INITIAL_SUPPLY + 1n;
      await expect(
        koreanWonToken.connect(recipient).burn(burnAmount)
      ).to.be.revertedWithCustomError(koreanWonToken, "ERC20InsufficientBalance");
    });
  });

  describe("Upgradeability", function () {
    it("should allow owner to upgrade the contract", async function () {
      const KoreanWonToken = await ethers.getContractFactory("KoreanWonToken");
      await upgrades.upgradeProxy(await koreanWonToken.getAddress(), KoreanWonToken);

      // Verify state is maintained after upgrade
      expect(await koreanWonToken.name()).to.equal("Korean Won Token");
      expect(await koreanWonToken.balanceOf(recipient.address)).to.equal(INITIAL_SUPPLY);
    });

    it("should not allow non-owner to upgrade", async function () {
      const KoreanWonToken = await ethers.getContractFactory("KoreanWonToken", addr1);
      await expect(
        upgrades.upgradeProxy(await koreanWonToken.getAddress(), KoreanWonToken)
      ).to.be.rejected;
    });
  });

  describe("Token Recovery", function () {
    describe("withdrawToken", function () {
      it("should allow owner to withdraw tokens", async function () {
        const amount = ethers.parseEther("100");
        const initialBalance = await mockToken.balanceOf(owner.address);

        await koreanWonToken.connect(owner).withdrawToken(await mockToken.getAddress(), amount);

        const finalBalance = await mockToken.balanceOf(owner.address);
        expect(finalBalance - initialBalance).to.equal(amount);
      });

      it("should revert if caller is not owner", async function () {
        const amount = ethers.parseEther("100");
        await expect(
          koreanWonToken.connect(addr1).withdrawToken(await mockToken.getAddress(), amount)
        ).to.be.revertedWithCustomError(koreanWonToken, "OwnableUnauthorizedAccount")
          .withArgs(addr1.address);
      });

      it("should revert if token address is zero address", async function () {
        const amount = ethers.parseEther("100");
        await expect(
          koreanWonToken.connect(owner).withdrawToken(ethers.ZeroAddress, amount)
        ).to.be.revertedWith("Invalid token address");
      });

      it("should revert if amount is zero", async function () {
        await expect(
          koreanWonToken.connect(owner).withdrawToken(await mockToken.getAddress(), 0)
        ).to.be.revertedWith("Amount must be greater than zero");
      });
    });

    describe("withdrawTokenAll", function () {
      it("should allow owner to withdraw all tokens", async function () {
        const initialBalance = await mockToken.balanceOf(owner.address);
        const contractBalance = await mockToken.balanceOf(await koreanWonToken.getAddress());

        await koreanWonToken.connect(owner).withdrawTokenAll(await mockToken.getAddress());

        const finalBalance = await mockToken.balanceOf(owner.address);
        expect(finalBalance - initialBalance).to.equal(contractBalance);
        expect(await mockToken.balanceOf(await koreanWonToken.getAddress())).to.equal(0);
      });

      it("should revert if caller is not owner", async function () {
        await expect(
          koreanWonToken.connect(addr1).withdrawTokenAll(await mockToken.getAddress())
        ).to.be.revertedWithCustomError(koreanWonToken, "OwnableUnauthorizedAccount")
          .withArgs(addr1.address);
      });

      it("should revert if token address is zero address", async function () {
        await expect(
          koreanWonToken.connect(owner).withdrawTokenAll(ethers.ZeroAddress)
        ).to.be.revertedWith("Invalid token address");
      });

      it("should revert if contract has no balance", async function () {
        // First withdraw all tokens
        await koreanWonToken.connect(owner).withdrawTokenAll(await mockToken.getAddress());

        // Try to withdraw again
        await expect(
          koreanWonToken.connect(owner).withdrawTokenAll(await mockToken.getAddress())
        ).to.be.revertedWith("No balance to withdraw");
      });
    });
  });
});