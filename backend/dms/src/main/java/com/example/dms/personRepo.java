package com.example.dms;

import org.springframework.data.jpa.repository.JpaRepository;


public interface personRepo extends JpaRepository<person, Long> {
}
