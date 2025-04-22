package com.codedulan.dms.repository;

import com.codedulan.dms.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByName(String name);
    List<Medicine> findByNameContainingIgnoreCase(String name);
    boolean existsByName(String name);
}