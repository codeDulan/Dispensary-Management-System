package com.codedulan.dms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePrescriptionTemplateItemDTO {
    private Long id;
    private Integer quantity;
    private String dosageInstructions;
    private Integer daysSupply;
}