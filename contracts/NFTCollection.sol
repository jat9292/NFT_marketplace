// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollection is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint8 private nb_uniques;
    string private baseURI;

    constructor(string memory _name, string memory _symbol, string memory _baseUri, uint8 _nb_uniques)
    ERC721(_name, _symbol) {
        baseURI = _baseUri;
        nb_uniques = _nb_uniques;
    }

    function mint()
        public
        returns (uint256)
    {
        
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        string memory tokenURI = string(
                abi.encodePacked(
                        baseURI,
                        Strings.toString((_tokenIds._value-1) % nb_uniques + 1),
                        ".json"
                    ));

        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }


    function tokenCount() public view returns(uint256){
        return _tokenIds._value;
    }
}