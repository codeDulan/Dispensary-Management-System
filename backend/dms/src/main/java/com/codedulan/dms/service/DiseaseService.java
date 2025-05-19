package com.codedulan.dms.service;

import com.codedulan.dms.dto.DiseaseDTO;
import com.codedulan.dms.entity.Disease;
import com.codedulan.dms.exception.ResourceNotFoundException;
import com.codedulan.dms.repository.DiseaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiseaseService {

    private final DiseaseRepository diseaseRepository;

    public List<DiseaseDTO> getAllDiseases() {
        return diseaseRepository.findAll().stream()
                .map(DiseaseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<DiseaseDTO> getCommonDiseases() {
        return diseaseRepository.findByIsCommonTrue().stream()
                .map(DiseaseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public DiseaseDTO getDiseaseById(Long id) {
        Disease disease = diseaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disease not found with id: " + id));
        return DiseaseDTO.fromEntity(disease);
    }

    public Disease findOrCreateDisease(String diseaseName) {
        return diseaseRepository
                .findByName(diseaseName)
                .orElseGet(() -> {
                    Disease newDisease = Disease.builder()
                            .name(diseaseName)
                            .isCommon(false)
                            .build();
                    return diseaseRepository.save(newDisease);
                });
    }
}