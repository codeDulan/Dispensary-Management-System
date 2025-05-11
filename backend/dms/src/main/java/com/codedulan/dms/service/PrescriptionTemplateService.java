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

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PrescriptionTemplateService {

    private final PrescriptionTemplateRepository templateRepository;
    private final PrescriptionTemplateItemRepository templateItemRepository;
    private final MedicineRepository medicineRepository;

    public List<PrescriptionTemplateDTO> getAllTemplates() {
        return templateRepository.findAllByOrderByTemplateNameAsc().stream()
                .map(PrescriptionTemplateDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public PrescriptionTemplateDTO getTemplateById(Long id) {
        PrescriptionTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription template not found with id: " + id));
        return PrescriptionTemplateDTO.fromEntity(template);
    }

    @Transactional
    public PrescriptionTemplateDTO createTemplate(CreatePrescriptionTemplateDTO createDTO) {
        // Create the prescription template entity
        PrescriptionTemplate template = PrescriptionTemplate.builder()
                .templateName(createDTO.getTemplateName())
                .conditionName(createDTO.getConditionName())
                .templateNotes(createDTO.getTemplateNotes())
                .templateItems(new ArrayList<>())
                .build();

        PrescriptionTemplate savedTemplate = templateRepository.save(template);

        // Process each template item
        for (CreatePrescriptionTemplateItemDTO itemDTO : createDTO.getItems()) {
            Medicine medicine = medicineRepository.findById(itemDTO.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + itemDTO.getMedicineId()));

            // Create template item
            PrescriptionTemplateItem item = PrescriptionTemplateItem.builder()
                    .prescriptionTemplate(savedTemplate)
                    .medicine(medicine)
                    .quantity(itemDTO.getQuantity())
                    .dosageInstructions(itemDTO.getDosageInstructions())
                    .daysSupply(itemDTO.getDaysSupply())
                    .build();

            savedTemplate.getTemplateItems().add(item);
        }

        // Save the updated template with items
        PrescriptionTemplate completeTemplate = templateRepository.save(savedTemplate);
        log.info("Created prescription template: {}", createDTO.getTemplateName());

        return PrescriptionTemplateDTO.fromEntity(completeTemplate);
    }

    @Transactional
    public PrescriptionTemplateDTO updateTemplate(Long id, UpdatePrescriptionTemplateDTO updateDTO) {
        PrescriptionTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription template not found with id: " + id));

        // Update template details if provided
        if (updateDTO.getTemplateName() != null) {
            template.setTemplateName(updateDTO.getTemplateName());
        }
        if (updateDTO.getConditionName() != null) {
            template.setConditionName(updateDTO.getConditionName());
        }
        if (updateDTO.getTemplateNotes() != null) {
            template.setTemplateNotes(updateDTO.getTemplateNotes());
        }

        // Update existing items
        if (updateDTO.getUpdatedItems() != null) {
            for (UpdatePrescriptionTemplateItemDTO itemDTO : updateDTO.getUpdatedItems()) {
                PrescriptionTemplateItem item = template.getTemplateItems().stream()
                        .filter(i -> i.getId().equals(itemDTO.getId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Template item not found with id: " + itemDTO.getId()));

                if (itemDTO.getQuantity() != null) {
                    item.setQuantity(itemDTO.getQuantity());
                }
                if (itemDTO.getDosageInstructions() != null) {
                    item.setDosageInstructions(itemDTO.getDosageInstructions());
                }
                if (itemDTO.getDaysSupply() != null) {
                    item.setDaysSupply(itemDTO.getDaysSupply());
                }
            }
        }

        // Add new items
        if (updateDTO.getNewItems() != null) {
            for (CreatePrescriptionTemplateItemDTO itemDTO : updateDTO.getNewItems()) {
                Medicine medicine = medicineRepository.findById(itemDTO.getMedicineId())
                        .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + itemDTO.getMedicineId()));

                PrescriptionTemplateItem newItem = PrescriptionTemplateItem.builder()
                        .prescriptionTemplate(template)
                        .medicine(medicine)
                        .quantity(itemDTO.getQuantity())
                        .dosageInstructions(itemDTO.getDosageInstructions())
                        .daysSupply(itemDTO.getDaysSupply())
                        .build();

                template.getTemplateItems().add(newItem);
            }
        }

        PrescriptionTemplate updatedTemplate = templateRepository.save(template);
        log.info("Updated prescription template with id: {}", id);

        return PrescriptionTemplateDTO.fromEntity(updatedTemplate);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        PrescriptionTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription template not found with id: " + id));

        templateRepository.delete(template);
        log.info("Deleted prescription template with id: {}", id);
    }

    // Method to convert a template to a CreatePrescriptionDTO
    public CreatePrescriptionDTO convertTemplateToCreatePrescriptionDTO(Long templateId) {
        PrescriptionTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription template not found with id: " + templateId));

        // Collect all items and convert to CreatePrescriptionItemDTO
        List<CreatePrescriptionItemDTO> items = template.getTemplateItems().stream()
                .map(item -> {
                    // Find latest inventory item for this medicine - would need to be adjusted based on your inventory system
                    // This is a simplified version
                    CreatePrescriptionItemDTO prescriptionItem = new CreatePrescriptionItemDTO();
                    // Note: In a real implementation, you would need to find the appropriate inventory item for this medicine
                    // Simplified placeholder for demonstration:
                    // prescriptionItem.setInventoryItemId(inventoryRepository.findTopByMedicineOrderByExpiryDateDesc(item.getMedicine()).getId());
                    prescriptionItem.setQuantity(item.getQuantity());
                    prescriptionItem.setDosageInstructions(item.getDosageInstructions());
                    prescriptionItem.setDaysSupply(item.getDaysSupply());
                    return prescriptionItem;
                })
                .collect(Collectors.toList());

        // Create the prescription DTO
        CreatePrescriptionDTO prescriptionDTO = new CreatePrescriptionDTO();
        prescriptionDTO.setItems(items);

        // Add notes about the condition from the template if available
        String notes = "";
        if (template.getConditionName() != null && !template.getConditionName().isEmpty()) {
            notes += "Condition: " + template.getConditionName() + "\n\n";
        }
        notes += template.getTemplateNotes() != null ? template.getTemplateNotes() : "";
        prescriptionDTO.setPrescriptionNotes(notes);

        return prescriptionDTO;
    }
}