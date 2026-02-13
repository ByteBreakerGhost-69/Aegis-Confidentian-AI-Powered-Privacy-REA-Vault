// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AegisAccessControl is AccessControl {
    bytes32 public constant AI_ORACLE_ROLE = keccak256("AI_ORACLE_ROLE");
    bytes32 public constant VAULT_MANAGER_ROLE = keccak256("VAULT_MANAGER_ROLE");
    
    bool private _paused;
    
    event Paused(address account);
    event Unpaused(address account);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    modifier whenNotPaused() {
        require(!_paused, "Contract paused");
        _;
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _paused = false;
        emit Unpaused(msg.sender);
    }
    
    function isPaused() external view returns (bool) {
        return _paused;
    }
}
