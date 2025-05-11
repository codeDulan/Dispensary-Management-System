package com.codedulan.dms.repository;

import com.codedulan.dms.entity.PrescriptionTemplate;
import com.codedulan.dms.entity.PrescriptionTemplateItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionTemplateItemRepository extends JpaRepository<PrescriptionTemplateItem, Long> {
    List<PrescriptionTemplateItem> findByPrescriptionTemplate(PrescriptionTemplate template);
}