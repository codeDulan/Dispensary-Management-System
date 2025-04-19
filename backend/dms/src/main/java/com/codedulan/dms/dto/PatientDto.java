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
public class PatientDto {

    private Long id;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String nic;

    private String address;

    @NotBlank
    @Pattern(regexp = "^\\d{10}$")
    private String contact;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    private String gender;

    @Min(0) @Max(120)
    private Integer age;

    @DecimalMin("0.0")
    private BigDecimal weight;

    private String medicalNotes;
}
