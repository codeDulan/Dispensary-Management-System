package com.codedulan.dms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_template_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionTemplateItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "template_id", nullable = false)
    private PrescriptionTemplate prescriptionTemplate;

    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "dosage_instructions")
    private String dosageInstructions;

    @Column(name = "days_supply")
    private Integer daysSupply;
}