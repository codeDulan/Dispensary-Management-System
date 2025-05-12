package com.codedulan.dms.dto;

import com.codedulan.dms.entity.Notification;
import com.codedulan.dms.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private Long inventoryItemId;
    private String medicineName;
    private String message;
    private NotificationType type;
    private boolean read;
    private LocalDateTime createdAt;

    public static NotificationDTO fromEntity(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .inventoryItemId(notification.getInventoryItemId())
                .medicineName(notification.getMedicineName())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}