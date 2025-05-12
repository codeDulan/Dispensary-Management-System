package com.codedulan.dms.repository;

import com.codedulan.dms.entity.Notification;
import com.codedulan.dms.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReadFalseOrderByCreatedAtDesc();

    List<Notification> findByReadFalse();

    long countByReadFalse();

    boolean existsByInventoryItemIdAndTypeAndReadFalse(Long inventoryItemId, NotificationType type);
}