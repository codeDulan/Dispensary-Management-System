package com.codedulan.dms.controller;

import com.codedulan.dms.dto.CreateMedicineDTO;
import com.codedulan.dms.dto.MedicineDTO;
import com.codedulan.dms.dto.UpdateMedicineDTO;
import com.codedulan.dms.service.MedicineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
@Slf4j
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<List<MedicineDTO>> getAllMedicines() {
        log.info("Fetching all medicines");
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineDTO> getMedicineById(@PathVariable Long id) {
        log.info("Fetching medicine with id: {}", id);
        return ResponseEntity.ok(medicineService.getMedicineById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MedicineDTO>> searchMedicines(@RequestParam String query) {
        log.info("Searching medicines with query: {}", query);
        return ResponseEntity.ok(medicineService.searchMedicines(query));
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader)")
    @PostMapping
    public ResponseEntity<MedicineDTO> createMedicine(
            @Valid @RequestBody CreateMedicineDTO createDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Creating new medicine: {}", createDTO.getName());
        MedicineDTO createdMedicine = medicineService.createMedicine(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMedicine);
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader)")
    @PutMapping("/{id}")
    public ResponseEntity<MedicineDTO> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMedicineDTO updateDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Updating medicine with id: {}", id);
        return ResponseEntity.ok(medicineService.updateMedicine(id, updateDTO));
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Deleting medicine with id: {}", id);
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }
}