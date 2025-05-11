package com.codedulan.dms.dto;

import com.codedulan.dms.entity.PrescriptionTemplateItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionTemplateItemDTO {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private Integer medicineWeight;
    private Integer quantity;
    private String dosageInstructions;
    private Integer daysSupply;

    public static PrescriptionTemplateItemDTO fromEntity(PrescriptionTemplateItem item) {
        return PrescriptionTemplateItemDTO.builder()
                .id(item.getId())
                .medicineId(item.getMedicine().getId())
                .medicineName(item.getMedicine().getName())
                .medicineWeight(item.getMedicine().getWeight())
                .quantity(item.getQuantity())
                .dosageInstructions(item.getDosageInstructions())
                .daysSupply(item.getDaysSupply())
                .build();
    }
}