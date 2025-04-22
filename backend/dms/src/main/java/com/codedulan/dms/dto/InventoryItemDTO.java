package com.codedulan.dms.dto;

import com.codedulan.dms.entity.InventoryItem;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemDTO {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String batchNumber;
    private LocalDate expiryDate;
    private Integer quantity;
    private Integer remainingQuantity;
    private BigDecimal buyPrice;
    private BigDecimal sellPrice;
    private LocalDate receivedDate;

    public static InventoryItemDTO fromEntity(InventoryItem item) {
        return InventoryItemDTO.builder()
                .id(item.getId())
                .medicineId(item.getMedicine().getId())
                .medicineName(item.getMedicine().getName())
                .batchNumber(item.getBatchNumber())
                .expiryDate(item.getExpiryDate())
                .quantity(item.getQuantity())
                .remainingQuantity(item.getRemainingQuantity())
                .buyPrice(item.getBuyPrice())
                .sellPrice(item.getSellPrice())
                .receivedDate(item.getReceivedDate())
                .build();
    }
}

