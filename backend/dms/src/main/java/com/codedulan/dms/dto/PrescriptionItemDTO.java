package com.codedulan.dms.dto;

import com.codedulan.dms.entity.PrescriptionItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItemDTO {
    private Long id;
    private Long inventoryItemId;
    private String medicineName;
    private Integer quantity;
    private String dosageInstructions;
    private Integer daysSupply;

    public static PrescriptionItemDTO fromEntity(PrescriptionItem item) {
        return PrescriptionItemDTO.builder()
                .id(item.getId())
                .inventoryItemId(item.getInventoryItem().getId())
                .medicineName(item.getInventoryItem().getMedicine().getName())
                .quantity(item.getQuantity())
                .dosageInstructions(item.getDosageInstructions())
                .daysSupply(item.getDaysSupply())
                .build();
    }
}
