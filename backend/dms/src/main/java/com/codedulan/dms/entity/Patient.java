package com.codedulan.dms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;



@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "tbl_patient")
public class Patient {

    @Id
    @SequenceGenerator(
            name = "patient_sequence",
            sequenceName = "patient_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "patient_sequence"
    )
    private Long patientId;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name cannot exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name cannot exceed 100 characters")
    private String lastName;

    @Size(max = 20, message = "NIC cannot exceed 20 characters")
    private String nic;

    private String address;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Contact number must be 10 digits")
    private String contact;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String gender;

    private Integer age;

    @Column(precision = 5, scale = 2)
    private BigDecimal weight;

    private String barcode;

    @Column(length = 1000)
    private String medicalNotes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;


    @JsonIgnore
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Appointment> appointments = new ArrayList<>();


}
