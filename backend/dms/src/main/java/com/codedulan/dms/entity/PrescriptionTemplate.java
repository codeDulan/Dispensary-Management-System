package com.codedulan.dms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescription_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Column(name = "condition_name")
    private String conditionName;

    @Column(name = "template_notes")
    private String templateNotes;

    // Relationships
    @OneToMany(mappedBy = "prescriptionTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<PrescriptionTemplateItem> templateItems = new ArrayList<>();
}