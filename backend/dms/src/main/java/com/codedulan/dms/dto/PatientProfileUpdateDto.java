package com.codedulan.dms.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientProfileUpdateDto {
    private String firstName;
    private String lastName;
    private String nic;
    private String address;

    @Pattern(regexp = "^\\d{10}$", message = "Contact number must be 10 digits")
    private String contact;

    private String gender;

    @Min(0) @Max(120)
    private Integer age;

    @DecimalMin("0.0")
    private BigDecimal weight;

    private String medicalNotes;
}



