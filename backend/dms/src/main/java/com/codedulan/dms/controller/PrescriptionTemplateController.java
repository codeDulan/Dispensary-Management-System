package com.codedulan.dms.controller;

import com.codedulan.dms.dto.*;
import com.codedulan.dms.service.PrescriptionTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/prescription-templates")
@RequiredArgsConstructor
@Slf4j
public class PrescriptionTemplateController {

    private final PrescriptionTemplateService templateService;

    @PreAuthorize("@accessControl.isDoctor(#authHeader)")
    @GetMapping
    public ResponseEntity<List<PrescriptionTemplateDTO>> getAllTemplates(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Fetching all prescription templates");
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader)")
    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionTemplateDTO> getTemplateById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Fetching prescription template with id: {}", id);
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader)")
    @PostMapping
    public ResponseEntity<PrescriptionTemplateDTO> createTemplate(
            @Valid @RequestBody CreatePrescriptionTemplateDTO createDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Creating new prescription template: {}", createDTO.getTemplateName());
        PrescriptionTemplateDTO createdTemplate = templateService.createTemplate(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTemplate);
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader)")
    @PutMapping("/{id}")
    public ResponseEntity<PrescriptionTemplateDTO> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePrescriptionTemplateDTO updateDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Updating prescription template with id: {}", id);
        return ResponseEntity.ok(templateService.updateTemplate(id, updateDTO));
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Deleting prescription template with id: {}", id);
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader)")
    @GetMapping("/{id}/to-prescription")
    public ResponseEntity<CreatePrescriptionDTO> convertTemplateToPrescription(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Converting prescription template with id {} to prescription", id);
        CreatePrescriptionDTO prescriptionDTO = templateService.convertTemplateToCreatePrescriptionDTO(id);
        return ResponseEntity.ok(prescriptionDTO);
    }
}