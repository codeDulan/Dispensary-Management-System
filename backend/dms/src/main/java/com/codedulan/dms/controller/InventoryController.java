package com.codedulan.dms.controller;

import com.codedulan.dms.dto.CreateInventoryItemDTO;
import com.codedulan.dms.dto.InventoryItemDTO;
import com.codedulan.dms.dto.UpdateInventoryItemDTO;
import com.codedulan.dms.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryItemDTO>> getAllInventoryItems() {
        log.info("Fetching all inventory items");
        return ResponseEntity.ok(inventoryService.getAllInventoryItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> getInventoryItemById(@PathVariable Long id) {
        log.info("Fetching inventory item with id: {}", id);
        return ResponseEntity.ok(inventoryService.getInventoryItemById(id));
    }

    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<List<InventoryItemDTO>> getInventoryItemsByMedicine(@PathVariable Long medicineId) {
        log.info("Fetching inventory items for medicine with id: {}", medicineId);
        return ResponseEntity.ok(inventoryService.getInventoryItemsByMedicine(medicineId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<InventoryItemDTO>> getAvailableInventoryItems() {
        log.info("Fetching available inventory items");
        return ResponseEntity.ok(inventoryService.getAvailableInventoryItems());
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<InventoryItemDTO>> getExpiringItems(
            @RequestParam(defaultValue = "30") int days) {
        log.info("Fetching inventory items expiring in the next {} days", days);
        return ResponseEntity.ok(inventoryService.getExpiringItems(days));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryItemDTO>> getLowStockItems() {
        log.info("Fetching low stock inventory items");
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader) or @accessControl.isDispenser(#authHeader)")
    @PostMapping
    public ResponseEntity<InventoryItemDTO> createInventoryItem(
            @Valid @RequestBody CreateInventoryItemDTO createDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Creating new inventory item for medicine with id: {}", createDTO.getMedicineId());
        InventoryItemDTO createdItem = inventoryService.createInventoryItem(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader) or @accessControl.isDispenser(#authHeader)")
    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> updateInventoryItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInventoryItemDTO updateDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Updating inventory item with id: {}", id);
        return ResponseEntity.ok(inventoryService.updateInventoryItem(id, updateDTO));
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader) or @accessControl.isDispenser(#authHeader)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventoryItem(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Deleting inventory item with id: {}", id);
        inventoryService.deleteInventoryItem(id);
        return ResponseEntity.noContent().build();
    }
}