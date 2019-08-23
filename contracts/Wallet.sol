pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

import './libs/ECTools.sol';

/// @title  Wallet
/// @author Nico Vergauwen <vergauwennico@gmail.com>
/// @notice Wallet contract that can execute meta transactions on behalf of authorized signers
contract Wallet {

    /// @notice master owner 
    address payable master;

    /// @dev Access modifier that requires 'msg.sender' to be 'master'
    modifier onlyMaster() {
        require(msg.sender == master, "Unauthorized");
        _;
    }

    /// @dev Access modifier that checks whether meta transactions are signed by authorized EOA's
    modifier onlyMasterOrActor(address[] memory target, uint256[] memory value, bytes[] memory data, bytes[] memory dataHashSignature) {
		for(uint i=0; i< target.length; i++) {
            require(isValidSignature(target[i], value[i], data[i], dataHashSignature[i]));
		}
		_;
	}

    /// @notice Sets the master address upon deployment
    /// @param _master (address) Ethereum address for the master 
    constructor(address payable _master) public {
        master = _master;
    }

    /// @notice Fallback 
    function() external payable {}

    /// @notice Get the signer of a transaction through ecrecover
    /// @param _raw (bytes32) keccak256 hash of the ABI encoded transaction data 
    /// @param _sig (bytes) the signature resulting from signing 'raw'
    /// @return signer (address) the EOA that signed the data 
    function getSigner(bytes32 _raw, bytes memory _sig) public pure returns(address signer) {
		return ECTools.prefixedRecover(_raw, _sig);
	}

    /// @notice Checks whether the signer is an authorized EOA
    /// @param _target (address) contract target address 
    /// @param _value (uint256) Wei amount being send in the transaction 
    /// @param _data (bytes) data being send in the transaction 
    /// @param _sig (bytes) the signature of the transaction data 
    /// @return isValid (bool) true/false based on whether the signer is master or an actor that has access rights to the method at 'target'
    function isValidSignature(address _target, uint256 _value, bytes memory _data, bytes memory _sig) public view returns (bool isValid) {
        bytes32 dataHash = keccak256(abi.encodePacked(_target, _value, _data));
        address signer = getSigner(dataHash, _sig);
        bytes4 method;
        assembly {
            method := mload(add(_data, 0x20))
        }
        return (signer == master);
    }

    /// @notice Execute a batch of meta transactions atomically
    /// @dev Anyone can execute this but only transactions signed by master or actor (if valid method) are accepted 
    /// @param _target (address[]) Array of contract addresses
    /// @param _value (uint256[]) Array of wei amounts being sent in the respective transactions 
    /// @param _data (bytes[]) Array of ABI encoded transaction data 
    /// @param _dataHashSignature (bytes[]) Array of transaction signatures for the respective transaction data
    /// @return (bool) returns true if all transactions in the batch succeeded
	function execute(address[] memory _target, uint256[] memory _value, bytes[] memory _data, bytes[] memory _dataHashSignature) public onlyMasterOrActor(_target, _value, _data, _dataHashSignature) returns (bool) {
		require(_target.length <= 8, 'Too many batched transactions');
        for(uint i=0; i< _target.length; i++) {
			(bool success,) = _target[i].call.value(_value[i])(_data[i]);
			require(success, 'Excuting MetaTx Failed');
		}
		return true;
    }
}