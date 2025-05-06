package com.codedulan.dms.dto;

import com.codedulan.dms.entity.Medicine;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineDTO {
    private Long id;
    private String name;
    private String description;
    private Double lethalDosagePerKg;
    private Integer weight;

    public static MedicineDTO fromEntity(Medicine medicine) {
        return MedicineDTO.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .description(medicine.getDescription())
                .lethalDosagePerKg(medicine.getLethalDosagePerKg())
                .weight(medicine.getWeight())
                .build();
    }
}

