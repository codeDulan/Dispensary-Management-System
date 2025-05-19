package com.codedulan.dms.controller;

import com.codedulan.dms.dto.DiseaseDTO;
import com.codedulan.dms.service.DiseaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diseases")
@RequiredArgsConstructor
@Slf4j
public class DiseaseController {

    private final DiseaseService diseaseService;

    @GetMapping
    public ResponseEntity<List<DiseaseDTO>> getAllDiseases() {
        log.info("Fetching all diseases");
        return ResponseEntity.ok(diseaseService.getAllDiseases());
    }

    @GetMapping("/common")
    public ResponseEntity<List<DiseaseDTO>> getCommonDiseases() {
        log.info("Fetching common diseases");
        return ResponseEntity.ok(diseaseService.getCommonDiseases());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiseaseDTO> getDiseaseById(@PathVariable Long id) {
        log.info("Fetching disease with id: {}", id);
        return ResponseEntity.ok(diseaseService.getDiseaseById(id));
    }
}