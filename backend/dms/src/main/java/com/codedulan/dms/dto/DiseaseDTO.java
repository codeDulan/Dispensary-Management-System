package com.codedulan.dms.dto;

import com.codedulan.dms.entity.Disease;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseDTO {
    private Long id;
    private String name;
    private String description;
    private Boolean isCommon;

    public static DiseaseDTO fromEntity(Disease disease) {
        return DiseaseDTO.builder()
                .id(disease.getId())
                .name(disease.getName())
                .description(disease.getDescription())
                .isCommon(disease.getIsCommon())
                .build();
    }
}