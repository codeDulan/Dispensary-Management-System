package com.codedulan.dms.dto;

import com.codedulan.dms.entity.PrescriptionItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItemDTO {
    private Long id;
    private Long inventoryItemId;
    private String medicineName;
    private Integer quantity;
    private Integer medicineWeight; // Add this field
    private BigDecimal sellPrice;
    private String dosageInstructions;
    private Integer daysSupply;

    public static PrescriptionItemDTO fromEntity(PrescriptionItem item) {
        return PrescriptionItemDTO.builder()
                .id(item.getId())
                .inventoryItemId(item.getInventoryItem().getId())
                .medicineName(item.getInventoryItem().getMedicine().getName())
                .medicineWeight(item.getInventoryItem().getMedicine().getWeight())
                .sellPrice(item.getInventoryItem().getSellPrice())
                .quantity(item.getQuantity())
                .dosageInstructions(item.getDosageInstructions())
                .daysSupply(item.getDaysSupply())
                .build();
    }
}
