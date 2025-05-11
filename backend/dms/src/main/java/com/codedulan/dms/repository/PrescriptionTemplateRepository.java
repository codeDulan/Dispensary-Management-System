package com.codedulan.dms.repository;

import com.codedulan.dms.entity.PrescriptionTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionTemplateRepository extends JpaRepository<PrescriptionTemplate, Long> {
    List<PrescriptionTemplate> findAllByOrderByTemplateNameAsc();
}