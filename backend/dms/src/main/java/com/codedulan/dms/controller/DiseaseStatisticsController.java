package com.codedulan.dms.controller;

import com.codedulan.dms.entity.Disease;
import com.codedulan.dms.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Slf4j
public class DiseaseStatisticsController {

    private final PrescriptionRepository prescriptionRepository;

    @GetMapping("/top-diseases")
    public ResponseEntity<List<Map<String, Object>>> getTopDiseases(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "5") int limit) {

        log.info("Fetching top {} diseases between dates: {} and {}", limit, startDate, endDate);

        // Set default dates if not provided
        LocalDateTime start = startDate != null ?
                startDate.atStartOfDay() :
                LocalDate.now().minusMonths(1).atStartOfDay();

        LocalDateTime end = endDate != null ?
                endDate.atTime(LocalTime.MAX) :
                LocalDate.now().atTime(LocalTime.MAX);

        // Create result list
        List<Map<String, Object>> result = new ArrayList<>();

        // Query for standard diseases
        List<Object[]> standardDiseases = prescriptionRepository.countPrescriptionsByDiseaseAndDateRange(start, end);

        for (Object[] diseaseData : standardDiseases) {
            if (diseaseData.length >= 2) {
                Disease disease = (Disease) diseaseData[0];
                Long count = (Long) diseaseData[1];

                Map<String, Object> diseaseMap = new HashMap<>();
                diseaseMap.put("id", disease.getId());
                diseaseMap.put("name", disease.getName());
                diseaseMap.put("count", count);

                result.add(diseaseMap);

                // Break if we have enough results
                if (result.size() >= limit) {
                    break;
                }
            }
        }

        // If we don't have enough results, query for custom diseases
        if (result.size() < limit) {
            int remaining = limit - result.size();

            List<Object[]> customDiseases = prescriptionRepository.countPrescriptionsByCustomDiseaseAndDateRange(start, end);

            for (Object[] diseaseData : customDiseases) {
                if (diseaseData.length >= 2) {
                    String diseaseName = (String) diseaseData[0];
                    Long count = (Long) diseaseData[1];

                    Map<String, Object> diseaseMap = new HashMap<>();
                    diseaseMap.put("id", null);
                    diseaseMap.put("name", diseaseName);
                    diseaseMap.put("count", count);

                    result.add(diseaseMap);

                    remaining--;
                    if (remaining <= 0) {
                        break;
                    }
                }
            }
        }

        return ResponseEntity.ok(result);
    }
}