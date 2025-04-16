package com.codedulan.dms.repository;

import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByEmail(String email);

}
