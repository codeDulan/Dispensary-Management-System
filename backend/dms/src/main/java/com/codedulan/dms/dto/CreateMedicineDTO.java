package com.codedulan.dms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMedicineDTO {
    @NotBlank(message = "Medicine name is required")
    private String name;

    private String description;

    private Double lethalDosagePerKg;

    private Integer weight;
}
