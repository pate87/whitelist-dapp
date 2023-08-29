// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Whitelist {

    address public owner;

    // Max number of whitelisted addresses allowed
    uint8 public maxWhitelistedAddresses;

    event AddAddressToWhitelist(address indexed _address);

    // Create a mapping of whitelistedAddresses
    // if an address is whitelisted, we would set it to true, it is false by default for all other addresses.
    mapping(address => bool) public whitelistedAddresses;

    // numAddressesWhitelisted would be used to keep track of how many addresses have been whitelisted
    uint8 public numAddressesWhitelisted;

    // Setting the Max number of whitelisted addresses
    // User will put the value at the time of deployment
    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
        owner = msg.sender;
    }

    /**
        addAddressToWhitelist - This function adds the address of the sender to the
        whitelist
     */
    function addAddressToWhitelist(address _address) public {
        require(owner == msg.sender, "Only owner can call this function");

        // check if the user has already been whitelisted
        require(!whitelistedAddresses[_address], "The address has already been white listed");

        // check if the numAddressesWhitelisted < maxWhitelistedAddresses, if not then throw an error.
        require(
            numAddressesWhitelisted < maxWhitelistedAddresses,
            "The whitelist is already full"
        );

        // Add the address which called the function to the whitelistedAddress array
        whitelistedAddresses[_address] = true;

        // Increase the number of whitelisted addresses
        numAddressesWhitelisted++;

        emit AddAddressToWhitelist(_address);
    }
}