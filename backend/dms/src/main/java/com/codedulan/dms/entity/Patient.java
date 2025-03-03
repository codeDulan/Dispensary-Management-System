package com.codedulan.dms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


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



    private String firstName;
    private String lastName;
    private String nic;
    private String address;
    private String contact;
    private String email;
    private String password;
    private String gender;
    private int age;

    @Column(precision = 5, scale = 2)
    private BigDecimal weight;
}
