// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library AegisAccessControl {
    struct AccessControlStorage {
        mapping(address => bool) admins;
        mapping(address => bool) subscriptions;
        bool paused;
        bool automationActive;
    }
    
    bytes32 private constant STORAGE_SLOT = 
        keccak256("aegis.access.control.storage");
    
    function getStorage() 
        private 
        pure 
        returns (AccessControlStorage storage s) 
    {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            s.slot := slot
        }
    }
    
    // Admin functions
    function isAdmin(address addr) internal view returns (bool) {
        return getStorage().admins[addr];
    }
    
    function addAdmin(address addr) internal {
        getStorage().admins[addr] = true;
    }
    
    function removeAdmin(address addr) internal {
        getStorage().admins[addr] = false;
    }
    
    // Subscription functions
    function hasSubscription(address user) internal view returns (bool) {
        return getStorage().subscriptions[user];
    }
    
    function grantSubscription(address user) internal {
        getStorage().subscriptions[user] = true;
    }
    
    function revokeSubscription(address user) internal {
        getStorage().subscriptions[user] = false;
    }
    
    // Pause functions
    function isPaused() internal view returns (bool) {
        return getStorage().paused;
    }
    
    function pause() internal {
        getStorage().paused = true;
    }
    
    function resume() internal {
        getStorage().paused = false;
    }
    
    // Automation functions
    function isAutomationActive() internal view returns (bool) {
        return getStorage().automationActive;
    }
    
    function activateAutomation() internal {
        getStorage().automationActive = true;
    }
    
    function deactivateAutomation() internal {
        getStorage().automationActive = false;
    }
}
