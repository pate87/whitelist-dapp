const { ethers } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Whitelist", () => {

    /**
     * @dev Set up initial variables
     */
    let owner, otherAccount, maxWhitelistedAddresses, whitelistContract
    async function deployWhitelist() {

        /**
        * @dev set the constructor variables
        */
        maxWhitelistedAddresses = 10;

        [owner, otherAccount] = await ethers.getSigners();

        /**
        * @dev deploys the contract with the initial variables
        */
        whitelistContract = await ethers.deployContract("Whitelist", [maxWhitelistedAddresses]);
        await whitelistContract.waitForDeployment();
        console.log("Contract deployed to address", await whitelistContract.getAddress());

        /**
        * @dev return values for later use
        */
        return { whitelistContract, maxWhitelistedAddresses, owner, otherAccount }
    }

    /**
     * @dev Avoiding Redundancy 
     */
    beforeEach(async () => {
        /**
         * @dev loadFixture will reset the state of the contract and reset the initial values of constructor
         * @dev { whitelistContract, maxWhitelistedAddresses, owner, otherAccount } calls the object from the deploy function
         */
        ({ whitelistContract, owner, otherAccount, maxWhitelistedAddresses } = await loadFixture(deployWhitelist));
    });


    describe("Deployment", () => {

        it("Should set the max amount of addresses for whitelist", async () => {

            expect(await whitelistContract.maxWhitelistedAddresses()).to.equal(maxWhitelistedAddresses);

        });

        it("Should set the right owner", async () => {

            expect(await whitelistContract.owner()).to.equal(owner.address);

        });
    });

    describe("Add address to whitelist", () => {

        describe("Validations", () => {

            it("Should revert if not owner account", async () => {

                await expect(whitelistContract.connect(otherAccount).addAddressToWhitelist(otherAccount.address)).to.be.revertedWith(
                    "Only owner can call this function"
                );
            });

            it("Should revert if address is already in whitelist", async () => {

                /**
                 * @dev First, pushes the otherAccount address in the whitelistedAddresses map
                 */
                await whitelistContract.addAddressToWhitelist(otherAccount.address);

                /**
                 * @dev Checks whether the address is already in the whitelistedAddresses map
                 */
                await expect(whitelistContract.addAddressToWhitelist(otherAccount.address)).to.be.revertedWith(
                    "The address has already been white listed"
                );
            });


            it("Should revert if whitelist is already full", async () => {

                /**
                 * @dev Creates a loop that adds random addresses to the whitelistedAddresses map
                 */
                for (let i = 0; i < maxWhitelistedAddresses; i++) {
                    /**
                     * @dev Creates the random wallet addresses
                     */
                    const newAccount = ethers.Wallet.createRandom();
                    /**
                     * @dev Pushes the randome wallet addresses to the whitelistedAddresses map
                     */
                    await whitelistContract.addAddressToWhitelist(newAccount.address);
                }

                /**
                 * @dev Tests whether the address is already in the whitelistedAddresses map
                 */
                await expect(whitelistContract.addAddressToWhitelist(otherAccount.address)).to.be.revertedWith(
                    "The whitelist is already full"
                );
            });

        });

        it("Should add the address to the whitelist", async () => {

            await whitelistContract.addAddressToWhitelist(otherAccount.address);

            /**
             * @dev Checks whether the wallet address was added to the whitelistedAddresses map
             */
            expect(await whitelistContract.whitelistedAddresses(otherAccount.address)).to.equal(true);

            /**
             * @dev Test the numAddressesWhitelisted array to increased by the number of added addresses
             */
            expect(await whitelistContract.numAddressesWhitelisted()).to.equal(1);

        });
    });

    describe("Events", () => {

        it("Should emit an event if address is successfully added to the whitelist", async () => {

            await expect(whitelistContract.addAddressToWhitelist(otherAccount.address))
                .to.emit(whitelistContract, "AddAddressToWhitelist")
                .withArgs(otherAccount.address);
        });
    });
});