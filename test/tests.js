const { assert, expect } = require("chai")
const { deployments, ethers } = require("hardhat")

describe("Nft Marketplace Unit Tests", function () {
    let nftMarketplace, nftMarketplaceContract, nftCollection, nftCollectionContract, nftCollectionContractFactory, nftMarketplaceContractFactory
    const PRICE = ethers.utils.parseEther("0.1")
    const TOKEN_ID = 1

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user = accounts[1]
        nftCollectionContractFactory = await ethers.getContractFactory("NFTCollection")
        constructor_args = ["Super Mario World", "SUPM",
        "https://ipfs.io/ipfs/Qmb6tWBDLd9j2oSnvSNhE314WFL7SRpQNtfwjFWsStXp5A/",8]
        nftCollectionContract = await nftCollectionContractFactory.deploy(...constructor_args)
        nftCollection = await nftCollectionContract.connect(deployer)

        nftMarketplaceContractFactory = await ethers.getContractFactory("NFTMarketPlace");
        nftMarketplaceContract = await nftMarketplaceContractFactory.deploy(ethers.constants.AddressZero);
        nftMarketplace = nftMarketplaceContract.connect(deployer)
        
        await nftCollection.mint()
        await nftCollection.approve(nftMarketplaceContract.address, TOKEN_ID)
    })

    describe("listItem", function () {
        it("adds a listing struct in mapping after listing an item", async function () {
            await nftMarketplace.listItem(nftCollection.address, TOKEN_ID, PRICE)
            const listing = await nftMarketplace.getListing(nftCollection.address, TOKEN_ID)
            assert(listing.price.toString() === PRICE.toString())
            assert(listing.seller.toString()===deployer.address)
        })

        it("exclusively items that haven't been listed", async function () {
            await nftMarketplace.listItem(nftCollection.address, TOKEN_ID, PRICE)
            const error = `AlreadyListed("${nftCollection.address}", ${TOKEN_ID})`
            await expect(
                nftMarketplace.listItem(nftCollection.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith(error)
        })
        it("exclusively allows owners to list", async function () {
            nftMarketplace = nftMarketplaceContract.connect(user)
            await nftCollection.approve(user.address, TOKEN_ID)
            await expect(
                nftMarketplace.listItem(nftCollection.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith("NotOwner")
        })
        it("needs approvals to list item", async function () {
            await nftCollection.approve(ethers.constants.AddressZero, TOKEN_ID)
            await expect(
                nftMarketplace.listItem(nftCollection.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith("NotApprovedForMarketplace")
        })
    })
    describe("cancelListing", function () {
        it("reverts if there is no listing", async function () {
            const error = `NotListed("${nftCollection.address}", ${TOKEN_ID})`
            await expect(
                nftMarketplace.cancelListing(nftCollection.address, TOKEN_ID)
            ).to.be.revertedWith(error)
        })
        it("reverts if anyone but the owner tries to call", async function () {
            await nftMarketplace.listItem(nftCollection.address, TOKEN_ID, PRICE)
            nftMarketplace = nftMarketplaceContract.connect(user)
            await nftCollection.approve(user.address, TOKEN_ID)
            await expect(
                nftMarketplace.cancelListing(nftCollection.address, TOKEN_ID)
            ).to.be.revertedWith("NotOwner")
        })
        it("emoves listing", async function () {
            await nftMarketplace.listItem(nftCollection.address, TOKEN_ID, PRICE)
            await nftMarketplace.cancelListing(nftCollection.address, TOKEN_ID)
            const listing = await nftMarketplace.getListing(nftCollection.address, TOKEN_ID)
            assert(listing.price.toString() === "0")
        })
    })
    describe("buyItem", function () {
        it("reverts if the item isnt listed", async function () {
            await expect(
                nftMarketplace.buyItem(nftCollection.address, TOKEN_ID)
            ).to.be.revertedWith("NotListed")
        })
        it("reverts if the price is not met", async function () {
            await nftMarketplace.listItem(nftCollection.address, TOKEN_ID, PRICE)
            await expect(
                nftMarketplace.buyItem(nftCollection.address, TOKEN_ID, { value: PRICE.div(10) })
            ).to.be.revertedWith("PriceNotMet")
        })
        it("transfers the nft to the buyer and transfer the proceeds to seller", async function () {
            await nftMarketplace.listItem(nftCollection.address, TOKEN_ID, PRICE)
            const balance_seller_before = await ethers.provider.getBalance(deployer.address)
            nftMarketplace = nftMarketplaceContract.connect(user)
            await nftMarketplace.buyItem(nftCollection.address, TOKEN_ID, { value: PRICE })
            const newOwner = await nftCollection.ownerOf(TOKEN_ID)
            const balance_seller_after = await ethers.provider.getBalance(deployer.address)
            const balance_diff = balance_seller_after.sub(balance_seller_before)

            assert(newOwner.toString() === user.address)
            assert(balance_diff.toString() === PRICE.toString())
        })
    })
    describe("updateListing", function () {
        it("must be owner and listed", async function () {
            await expect(
                nftMarketplace.updateListing(nftCollection.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith("NotListed")
            await nftMarketplace.listItem(nftCollection.address, TOKEN_ID, PRICE)
            nftMarketplace = nftMarketplaceContract.connect(user)
            await expect(
                nftMarketplace.updateListing(nftCollection.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith("NotOwner")
        })
        it("updates the price of the item", async function () {
            const updatedPrice = ethers.utils.parseEther("0.2")
            await nftMarketplace.listItem(nftCollection.address, TOKEN_ID, PRICE)
            await nftMarketplace.updateListing(nftCollection.address, TOKEN_ID, updatedPrice)
            const listing = await nftMarketplace.getListing(nftCollection.address, TOKEN_ID)
            assert(listing.price.toString() === updatedPrice.toString())
        })
    })
})