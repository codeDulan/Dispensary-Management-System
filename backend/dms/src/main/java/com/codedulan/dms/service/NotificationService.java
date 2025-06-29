package com.codedulan.dms.service;

import com.codedulan.dms.dto.NotificationDTO;
import com.codedulan.dms.entity.InventoryItem;
import com.codedulan.dms.entity.Notification;
import com.codedulan.dms.entity.NotificationType;
import com.codedulan.dms.repository.InventoryRepository;
import com.codedulan.dms.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final InventoryRepository inventoryRepository;

    // Cache to prevent frequent notifications for the same items
    private final Map<String, LocalDateTime> lastNotificationMap = new ConcurrentHashMap<>();


    //Get all notifications
    public List<NotificationDTO> getAllNotifications() {
        return notificationRepository.findByReadFalseOrderByCreatedAtDesc().stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    //mark notification as read
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);


        String cacheKey = notification.getInventoryItemId() + "-" + notification.getType();
        lastNotificationMap.remove(cacheKey);
    }


    //mark all notifications as read
    public void markAllAsRead() {
        List<Notification> unreadNotifications = notificationRepository.findByReadFalse();
        unreadNotifications.forEach(notification -> {
            notification.setRead(true);


            String cacheKey = notification.getInventoryItemId() + "-" + notification.getType();
            lastNotificationMap.remove(cacheKey);
        });
        notificationRepository.saveAll(unreadNotifications);
    }


    //get unread notification count
    public long getUnreadCount() {
        return notificationRepository.countByReadFalse();
    }


     //scheduled job to check for low stock and expiring items
     //runs at midnight every day
    @Scheduled(cron = "0 0 0 * * ?")
    public void checkInventoryStatus() {
        log.info("Running daily inventory check for notifications...");
        checkLowStockItems();
        checkExpiringItems();
    }


    //check for low stock items
    private void checkLowStockItems() {
        List<InventoryItem> lowStockItems = inventoryRepository.findLowStockItems();

        for (InventoryItem item : lowStockItems) {
            createLowStockNotificationIfNeeded(item);
        }
    }

    //Create low stock notification if needed and not already notified recently
    private void createLowStockNotificationIfNeeded(InventoryItem item) {
        String cacheKey = item.getId() + "-" + NotificationType.LOW_STOCK;

        //check if already notified about this within the last 24 hours
        if (isRecentlyNotified(cacheKey)) {
            return;
        }

        //check if there's already an unread notification for this
        boolean notificationExists = notificationRepository.existsByInventoryItemIdAndTypeAndReadFalse(
                item.getId(), NotificationType.LOW_STOCK);

        if (!notificationExists) {
            Notification notification = Notification.builder()
                    .inventoryItemId(item.getId())
                    .medicineName(item.getMedicine().getName())
                    .message("Low stock alert: " + item.getMedicine().getName() +
                            " - Only " + item.getRemainingQuantity() + " units remaining")
                    .type(NotificationType.LOW_STOCK)
                    .read(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.save(notification);

            //update cache with current timestamp
            lastNotificationMap.put(cacheKey, LocalDateTime.now());

            log.info("Created low stock notification for: {}", item.getMedicine().getName());
        }
    }

    //check for items expiring within 30 days
    private void checkExpiringItems() {
        LocalDate expiryThreshold = LocalDate.now().plusDays(30);
        List<InventoryItem> expiringItems = inventoryRepository.findByExpiryDateBeforeOrderByExpiryDateAsc(expiryThreshold)
                .stream()
                .filter(item -> !item.getExpiryDate().isBefore(LocalDate.now()))
                .collect(Collectors.toList());

        for (InventoryItem item : expiringItems) {
            createExpiringNotificationIfNeeded(item);
        }
    }

    //create expiring notification if needed and not already notified recently
    private void createExpiringNotificationIfNeeded(InventoryItem item) {
        String cacheKey = item.getId() + "-" + NotificationType.EXPIRING_SOON;

        //check if already notified about this within the last 24 hours
        if (isRecentlyNotified(cacheKey)) {
            return;
        }

        //check if there's already an unread notification for this
        boolean notificationExists = notificationRepository.existsByInventoryItemIdAndTypeAndReadFalse(
                item.getId(), NotificationType.EXPIRING_SOON);

        if (!notificationExists) {
            Notification notification = Notification.builder()
                    .inventoryItemId(item.getId())
                    .medicineName(item.getMedicine().getName())
                    .message("Expiring soon: " + item.getMedicine().getName() +
                            " - Expires on " + item.getExpiryDate())
                    .type(NotificationType.EXPIRING_SOON)
                    .read(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.save(notification);

            // Update cache with current timestamp
            lastNotificationMap.put(cacheKey, LocalDateTime.now());

            log.info("Created expiry notification for: {}", item.getMedicine().getName());
        }
    }

    private boolean isRecentlyNotified(String cacheKey) {
        LocalDateTime lastNotified = lastNotificationMap.get(cacheKey);
        if (lastNotified == null) {
            return false;
        }

        //check if it's been less than 24 hours since the last notification
        long hoursSinceLastNotification = ChronoUnit.HOURS.between(lastNotified, LocalDateTime.now());
        return hoursSinceLastNotification < 24;
    }
}