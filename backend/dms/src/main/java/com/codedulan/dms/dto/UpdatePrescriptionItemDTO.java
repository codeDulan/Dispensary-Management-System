package com.codedulan.dms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePrescriptionItemDTO {
    private Long id;
    private Integer quantity;
    private String dosageInstructions;
    private Integer daysSupply;
    private Integer oldQuantity;
    private String oldDosageInstructions;
    private Integer oldDaysSupply;


}