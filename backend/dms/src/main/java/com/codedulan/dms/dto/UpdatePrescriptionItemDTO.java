package com.codedulan.dms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePrescriptionItemDTO {
    private Long id; // Existing item ID
    private Integer quantity;
    private String dosageInstructions;
    private Integer daysSupply;
    private Integer oldQuantity; // Original values for inventory adjustment
    private String oldDosageInstructions;
    private Integer oldDaysSupply;

    // Getters and setters
}