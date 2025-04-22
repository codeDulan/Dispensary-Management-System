package com.codedulan.dms.service;

import com.codedulan.dms.dto.CreateInventoryItemDTO;
import com.codedulan.dms.dto.InventoryItemDTO;
import com.codedulan.dms.dto.UpdateInventoryItemDTO;
import com.codedulan.dms.entity.InventoryItem;
import com.codedulan.dms.entity.Medicine;
import com.codedulan.dms.exception.BusinessLogicException;
import com.codedulan.dms.exception.ResourceNotFoundException;
import com.codedulan.dms.repository.InventoryRepository;
import com.codedulan.dms.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;

    public List<InventoryItemDTO> getAllInventoryItems() {
        return inventoryRepository.findAll().stream()
                .map(InventoryItemDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public InventoryItemDTO getInventoryItemById(Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        return InventoryItemDTO.fromEntity(item);
    }

    public List<InventoryItemDTO> getInventoryItemsByMedicine(Long medicineId) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));

        return inventoryRepository.findByMedicine(medicine).stream()
                .map(InventoryItemDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<InventoryItemDTO> getAvailableInventoryItems() {
        return inventoryRepository.findByRemainingQuantityGreaterThanOrderByExpiryDateAsc(0).stream()
                .map(InventoryItemDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<InventoryItemDTO> getExpiringItems(int daysToExpiry) {
        LocalDate expiryThreshold = LocalDate.now().plusDays(daysToExpiry);
        return inventoryRepository.findByExpiryDateBeforeOrderByExpiryDateAsc(expiryThreshold).stream()
                .map(InventoryItemDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<InventoryItemDTO> getLowStockItems() {
        return inventoryRepository.findLowStockItems().stream()
                .map(InventoryItemDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public InventoryItemDTO createInventoryItem(CreateInventoryItemDTO createDTO) {
        Medicine medicine = medicineRepository.findById(createDTO.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + createDTO.getMedicineId()));

        if (createDTO.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessLogicException("Cannot add expired medicine to inventory");
        }

        LocalDate receivedDate = createDTO.getReceivedDate() != null ?
                createDTO.getReceivedDate() : LocalDate.now();

        InventoryItem item = InventoryItem.builder()
                .medicine(medicine)
                .batchNumber(createDTO.getBatchNumber())
                .expiryDate(createDTO.getExpiryDate())
                .quantity(createDTO.getQuantity())
                .remainingQuantity(createDTO.getQuantity()) // Initially, remaining = total
                .buyPrice(createDTO.getBuyPrice())
                .sellPrice(createDTO.getSellPrice())
                .receivedDate(receivedDate)
                .build();

        InventoryItem savedItem = inventoryRepository.save(item);
        log.info("New inventory item created for medicine: {}, quantity: {}",
                medicine.getName(), createDTO.getQuantity());
        return InventoryItemDTO.fromEntity(savedItem);
    }

    public InventoryItemDTO updateInventoryItem(Long id, UpdateInventoryItemDTO updateDTO) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        if (updateDTO.getBatchNumber() != null) {
            item.setBatchNumber(updateDTO.getBatchNumber());
        }

        if (updateDTO.getExpiryDate() != null) {
            if (updateDTO.getExpiryDate().isBefore(LocalDate.now())) {
                throw new BusinessLogicException("Expiry date cannot be in the past");
            }
            item.setExpiryDate(updateDTO.getExpiryDate());
        }

        if (updateDTO.getAdditionalQuantity() != null && updateDTO.getAdditionalQuantity() > 0) {
            item.setQuantity(item.getQuantity() + updateDTO.getAdditionalQuantity());
            item.setRemainingQuantity(item.getRemainingQuantity() + updateDTO.getAdditionalQuantity());
            log.info("Added {} units to inventory item for medicine: {}",
                    updateDTO.getAdditionalQuantity(), item.getMedicine().getName());
        }

        if (updateDTO.getBuyPrice() != null) {
            item.setBuyPrice(updateDTO.getBuyPrice());
        }

        if (updateDTO.getSellPrice() != null) {
            item.setSellPrice(updateDTO.getSellPrice());
        }

        InventoryItem updatedItem = inventoryRepository.save(item);
        return InventoryItemDTO.fromEntity(updatedItem);
    }

    public void deleteInventoryItem(Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        if (!item.getPrescriptionItems().isEmpty()) {
            throw new BusinessLogicException("Cannot delete inventory item that is referenced in prescriptions");
        }

        inventoryRepository.deleteById(id);
        log.info("Inventory item deleted for medicine: {}", item.getMedicine().getName());
    }

    // Method to reduce quantity when prescriptions are issued
    public void reduceInventoryQuantity(Long inventoryItemId, int quantityToReduce) {
        InventoryItem item = inventoryRepository.findById(inventoryItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + inventoryItemId));

        if (item.getRemainingQuantity() < quantityToReduce) {
            throw new BusinessLogicException("Not enough quantity available. Requested: " +
                    quantityToReduce + ", Available: " + item.getRemainingQuantity());
        }

        item.setRemainingQuantity(item.getRemainingQuantity() - quantityToReduce);
        inventoryRepository.save(item);
        log.info("Reduced {} units from inventory for medicine: {}",
                quantityToReduce, item.getMedicine().getName());
    }
}