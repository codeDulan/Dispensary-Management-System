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
        // Extract token from auth header (remove "Bearer " prefix)
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

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Process each prescription item
        for (CreatePrescriptionItemDTO itemDTO : createDTO.getItems()) {
            InventoryItem inventoryItem = inventoryRepository.findById(itemDTO.getInventoryItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + itemDTO.getInventoryItemId()));

            // Check if there's enough quantity available
            if (inventoryItem.getRemainingQuantity() < itemDTO.getQuantity()) {
                throw new BusinessLogicException("Insufficient quantity available for " +
                        inventoryItem.getMedicine().getName() + ". Available: " +
                        inventoryItem.getRemainingQuantity() + ", Requested: " + itemDTO.getQuantity());
            }

            // Create prescription item
            PrescriptionItem item = PrescriptionItem.builder()
                    .prescription(savedPrescription)
                    .inventoryItem(inventoryItem)
                    .quantity(itemDTO.getQuantity())
                    .dosageInstructions(itemDTO.getDosageInstructions())
                    .daysSupply(itemDTO.getDaysSupply())
                    .build();

            savedPrescription.getPrescriptionItems().add(item);

            // Reduce inventory quantity
            inventoryService.reduceInventoryQuantity(inventoryItem.getId(), itemDTO.getQuantity());
        }

        // Save the updated prescription with items
        Prescription completePrescription = prescriptionRepository.save(savedPrescription);
        log.info("Created prescription for patient: {}", patient.getFirstName() + " " + patient.getLastName());

        return PrescriptionDTO.fromEntity(completePrescription);
    }

    public PrescriptionDTO updatePrescription(Long id, UpdatePrescriptionDTO updateDTO) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));

        // Only notes can be updated after prescription is issued
        if (updateDTO.getPrescriptionNotes() != null) {
            prescription.setPrescriptionNotes(updateDTO.getPrescriptionNotes());
        }

        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        log.info("Updated prescription with id: {}", id);

        return PrescriptionDTO.fromEntity(updatedPrescription);
    }
}