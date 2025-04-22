package com.codedulan.dms.repository;

import com.codedulan.dms.entity.Prescription;
import com.codedulan.dms.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, Long> {
    List<PrescriptionItem> findByPrescription(Prescription prescription);
}
