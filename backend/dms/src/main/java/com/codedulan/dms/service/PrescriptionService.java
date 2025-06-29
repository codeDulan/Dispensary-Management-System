package com.codedulan.dms.service;

import com.codedulan.dms.dto.*;
import com.codedulan.dms.entity.*;
import com.codedulan.dms.exception.BusinessLogicException;
import com.codedulan.dms.exception.ResourceNotFoundException;
import com.codedulan.dms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;

    private final DiseaseRepository diseaseRepository;
    private final JWTUtils jwtUtils;

    public List<PrescriptionDTO> getAllPrescriptions() {
        return prescriptionRepository.findAll().stream()
                .map(PrescriptionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public PrescriptionDTO getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));
        return PrescriptionDTO.fromEntity(prescription);
    }

    public List<PrescriptionDTO> getPrescriptionsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        return prescriptionRepository.findByPatient(patient).stream()
                .map(PrescriptionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getPrescriptionsByDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        return prescriptionRepository.findByIssueDateBetweenOrderByIssueDateDesc(startOfDay, endOfDay).stream()
                .map(PrescriptionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getPrescriptionsByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusMonths(1).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDate.now().atTime(LocalTime.MAX);

        return prescriptionRepository.findByIssueDateBetweenOrderByIssueDateDesc(start, end).stream()
                .map(PrescriptionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getMyPrescriptions(String authHeader) {

        String token = authHeader.substring(7).trim();

        String email = jwtUtils.extractEmail(token);
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with email: " + email));

        return prescriptionRepository.findByPatient(patient).stream()
                .map(PrescriptionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getMyPrescriptionsByDateRange(LocalDate startDate, LocalDate endDate, String token) {
        String email = jwtUtils.extractEmail(token);
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with email: " + email));

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusMonths(1).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDate.now().atTime(LocalTime.MAX);

        return prescriptionRepository.findByPatientAndIssueDateBetweenOrderByIssueDateDesc(patient, start, end).stream()
                .map(PrescriptionDTO::fromEntity)
                .collect(Collectors.toList());
    }


    private int calculateTotalQuantity(String dosageInstructions, int quantityPerDose, int daysSupply) {
        // Default to 1 dose per day if no instructions
        int dosesPerDay = 1;

        if (dosageInstructions != null) {
            String instruction = dosageInstructions.toUpperCase();

            if (instruction.contains("OD") || instruction.contains("ONCE DAILY") ||
                    instruction.contains("MANE") || instruction.contains("NOCTE")) {
                dosesPerDay = 1;
            } else if (instruction.contains("BD") || instruction.contains("TWICE DAILY")) {
                dosesPerDay = 2;
            } else if (instruction.contains("TDS") || instruction.contains("THREE TIMES DAILY")) {
                dosesPerDay = 3;
            } else if (instruction.contains("QDS") || instruction.contains("QID") ||
                    instruction.contains("FOUR TIMES DAILY")) {
                dosesPerDay = 4;
            }
        }

        // Calculate total: quantity per dose * doses per day * days
        return quantityPerDose * dosesPerDay * daysSupply;
    }

    @Transactional
    public PrescriptionDTO createPrescription(CreatePrescriptionDTO createDTO) {
        Patient patient = patientRepository.findById(createDTO.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + createDTO.getPatientId()));

        // Create the prescription entity
        Prescription prescription = Prescription.builder()
                .patient(patient)
                .issueDate(LocalDateTime.now())
                .prescriptionNotes(createDTO.getPrescriptionNotes())
                .prescriptionItems(new ArrayList<>())
                .build();

        // Handle disease type
        if (createDTO.getDiseaseId() != null) {
            Disease disease = diseaseRepository.findById(createDTO.getDiseaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Disease not found with id: " + createDTO.getDiseaseId()));
            prescription.setDisease(disease);
        } else if (createDTO.getCustomDisease() != null && !createDTO.getCustomDisease().trim().isEmpty()) {
            prescription.setCustomDisease(createDTO.getCustomDisease().trim());
        }

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Process each prescription item
        for (CreatePrescriptionItemDTO itemDTO : createDTO.getItems()) {
            InventoryItem inventoryItem = inventoryRepository.findById(itemDTO.getInventoryItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + itemDTO.getInventoryItemId()));

            // Calculate total quantity based on dosage instructions and days supply
            int quantityPerDose = itemDTO.getQuantity();
            int daysSupply = itemDTO.getDaysSupply();
            String dosageInstructions = itemDTO.getDosageInstructions();

            int totalQuantityNeeded = calculateTotalQuantity(dosageInstructions, quantityPerDose, daysSupply);

            // Check if there is enough quantity available
            if (inventoryItem.getRemainingQuantity() < totalQuantityNeeded) {
                throw new BusinessLogicException("Insufficient quantity available for " +
                        inventoryItem.getMedicine().getName() + ". Available: " +
                        inventoryItem.getRemainingQuantity() + ", Requested total: " + totalQuantityNeeded +
                        " (Qty per dose: " + quantityPerDose +
                        ", Dosage: " + dosageInstructions +
                        ", Days: " + daysSupply + ")");
            }

            // Create prescription item
            PrescriptionItem item = PrescriptionItem.builder()
                    .prescription(savedPrescription)
                    .inventoryItem(inventoryItem)
                    .quantity(quantityPerDose)
                    .dosageInstructions(dosageInstructions)
                    .daysSupply(daysSupply)
                    .build();

            savedPrescription.getPrescriptionItems().add(item);

            // Reduce inventory quantity using the TOTAL quantity needed
            inventoryService.reduceInventoryQuantity(inventoryItem.getId(), totalQuantityNeeded);

            log.info("Prescribed {} of {} for {} days (total: {})",
                    quantityPerDose,
                    inventoryItem.getMedicine().getName(),
                    daysSupply,
                    totalQuantityNeeded);
        }

        // Save the updated prescription with items
        Prescription completePrescription = prescriptionRepository.save(savedPrescription);
        log.info("Created prescription for patient: {}", patient.getFirstName() + " " + patient.getLastName());

        return PrescriptionDTO.fromEntity(completePrescription);
    }

    @Transactional
    public PrescriptionDTO updatePrescription(Long id, UpdatePrescriptionDTO updateDTO) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));

        // Update notes if provided
        if (updateDTO.getPrescriptionNotes() != null) {
            prescription.setPrescriptionNotes(updateDTO.getPrescriptionNotes());
        }

        // Handle updated items
        if (updateDTO.getUpdatedItems() != null) {
            for (UpdatePrescriptionItemDTO itemDTO : updateDTO.getUpdatedItems()) {
                // Find existing prescription item
                PrescriptionItem item = prescription.getPrescriptionItems().stream()
                        .filter(pi -> pi.getId().equals(itemDTO.getId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Prescription item not found: " + itemDTO.getId()));

                // Calculate inventory adjustment
                int oldTotalQty = calculateTotalQuantity(
                        itemDTO.getOldDosageInstructions(),
                        itemDTO.getOldQuantity(),
                        itemDTO.getOldDaysSupply()
                );

                int newTotalQty = calculateTotalQuantity(
                        itemDTO.getDosageInstructions(),
                        itemDTO.getQuantity(),
                        itemDTO.getDaysSupply()
                );

                // Update the item
                item.setQuantity(itemDTO.getQuantity());
                item.setDosageInstructions(itemDTO.getDosageInstructions());
                item.setDaysSupply(itemDTO.getDaysSupply());

                // Adjust inventory if needed
                if (newTotalQty != oldTotalQty) {
                    InventoryItem inventoryItem = item.getInventoryItem();

                    if (newTotalQty > oldTotalQty) {
                        // Need more inventory
                        int additionalQty = newTotalQty - oldTotalQty;

                        // Check if there's enough
                        if (inventoryItem.getRemainingQuantity() < additionalQty) {
                            throw new BusinessLogicException("Not enough inventory for " +
                                    inventoryItem.getMedicine().getName() + ". Available: " +
                                    inventoryItem.getRemainingQuantity() + ", Additional needed: " + additionalQty);
                        }

                        // Reduce additional inventory
                        inventoryService.reduceInventoryQuantity(inventoryItem.getId(), additionalQty);
                    } else if (newTotalQty < oldTotalQty) {
                        // Return inventory
                        int returnQty = oldTotalQty - newTotalQty;
                        inventoryItem.setRemainingQuantity(inventoryItem.getRemainingQuantity() + returnQty);
                        inventoryRepository.save(inventoryItem);
                    }
                }
            }
        }

        // Handle new items (similar to createPrescription logic)
        if (updateDTO.getNewItems() != null && !updateDTO.getNewItems().isEmpty()) {
            for (CreatePrescriptionItemDTO itemDTO : updateDTO.getNewItems()) {
                InventoryItem inventoryItem = inventoryRepository.findById(itemDTO.getInventoryItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found: " + itemDTO.getInventoryItemId()));

                // Calculate total quantity
                int totalQtyNeeded = calculateTotalQuantity(
                        itemDTO.getDosageInstructions(),
                        itemDTO.getQuantity(),
                        itemDTO.getDaysSupply()
                );

                // Check if there is enough inventory
                if (inventoryItem.getRemainingQuantity() < totalQtyNeeded) {
                    throw new BusinessLogicException("Not enough inventory for " +
                            inventoryItem.getMedicine().getName() + ". Available: " +
                            inventoryItem.getRemainingQuantity() + ", Needed: " + totalQtyNeeded);
                }

                // Create new prescription item
                PrescriptionItem newItem = PrescriptionItem.builder()
                        .prescription(prescription)
                        .inventoryItem(inventoryItem)
                        .quantity(itemDTO.getQuantity())
                        .dosageInstructions(itemDTO.getDosageInstructions())
                        .daysSupply(itemDTO.getDaysSupply())
                        .build();

                prescription.getPrescriptionItems().add(newItem);

                // Reduce inventory
                inventoryService.reduceInventoryQuantity(inventoryItem.getId(), totalQtyNeeded);
            }
        }

        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        log.info("Updated prescription with id: {}", id);

        return PrescriptionDTO.fromEntity(updatedPrescription);
    }

    

}