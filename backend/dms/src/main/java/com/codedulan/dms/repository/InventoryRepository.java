package com.codedulan.dms.repository;

import com.codedulan.dms.entity.InventoryItem;
import com.codedulan.dms.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByMedicine(Medicine medicine);

    List<InventoryItem> findByMedicineAndRemainingQuantityGreaterThanOrderByExpiryDateAsc(Medicine medicine, Integer minQuantity);

    List<InventoryItem> findByRemainingQuantityGreaterThanOrderByExpiryDateAsc(Integer minQuantity);

    List<InventoryItem> findByExpiryDateBeforeOrderByExpiryDateAsc(LocalDate date);

    @Query("SELECT i FROM InventoryItem i WHERE i.remainingQuantity < i.quantity * 0.2")
    List<InventoryItem> findLowStockItems();
}