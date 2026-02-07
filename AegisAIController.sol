// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "./AegisVault.sol";

/**
 * @title AegisAIController
 * @dev Mengelola logika AI dan instruksi otomatis untuk investasi Vault secara privat.
 */
contract AegisAIController is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    AegisVault public vault;
    bytes32 public latestRequestId;
    bytes public latestResponse;
    bytes public latestError;

    // Event untuk memantau aktivitas AI
    event AIAnalysisRequested(bytes32 indexed requestId);
    event AIInstructionReceived(bytes32 indexed requestId, string instruction);

    constructor(
        address _vault,
        address _router // Alamat Router Chainlink Functions (sesuai network)
    ) FunctionsClient(_router) ConfirmedOwner(msg.sender) {
        vault = AegisVault(_vault);
    }

    /**
     * @notice Meminta analisis pasar dari AI Agent secara privat.
     * @param source Kode JavaScript (ai_market_analyst.js) yang akan dijalankan node.
     * @param secrets Data terenkripsi (API Keys/Private Strategy).
     * @param subscriptionId ID Langganan Chainlink Functions kamu.
     */
    function requestMarketAnalysis(
        string calldata source,
        bytes calldata secrets,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donID
    ) external onlyOwner returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        
        if (secrets.length > 0) {
            req.addSecretsReference(secrets); // Menjaga privasi API Key
        }

        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        latestRequestId = requestId;
        emit AIAnalysisRequested(requestId);
    }

    /**
     * @notice Callback otomatis dari Chainlink Functions setelah AI selesai menghitung.
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        latestResponse = response;
        latestError = err;

        // Logika: Jika AI mengembalikan sinyal "BUY_GOLD", maka panggil fungsi allocate di Vault
        // Ini adalah tempat eksekusi otomatis berdasarkan kecerdasan buatan
        
        emit AIInstructionReceived(requestId, string(response));
    }

    /**
     * @dev Fungsi darurat untuk update Vault jika diperlukan.
     */
    function updateVault(address _newVault) external onlyOwner {
        vault = AegisVault(_newVault);
    }
}

