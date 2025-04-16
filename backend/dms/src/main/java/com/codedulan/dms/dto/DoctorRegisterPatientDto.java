package com.codedulan.dms.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DoctorRegisterPatientDto {
    private String firstName;
    private String lastName;
    private String nic;
    private String address;
    private String contact;
    private String email;
    private String gender;
    private int age;

    @DecimalMin("0.0")
    private BigDecimal weight;
    private String medicalNotes;
}
