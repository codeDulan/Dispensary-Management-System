package com.codedulan.dms.controller;

import com.codedulan.dms.dto.NotificationDTO;
import com.codedulan.dms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAllNotifications() {
        log.info("Fetching all unread notifications");
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        log.info("Fetching unread notification count");
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        log.info("Marking notification with id: {} as read", id);
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        log.info("Marking all notifications as read");
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/check-now")
    public ResponseEntity<Void> checkNow() {
        log.info("Manually triggering inventory check");
        notificationService.checkInventoryStatus();
        return ResponseEntity.ok().build();
    }
}