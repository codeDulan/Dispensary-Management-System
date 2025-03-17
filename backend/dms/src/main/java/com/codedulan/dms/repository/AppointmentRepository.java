package com.codedulan.dms.repository;

import com.codedulan.dms.entity.Appoinment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appoinment, Long> {
}
