package com.codedulan.dms.dto;

import com.codedulan.dms.entity.Prescription;
import jakarta.validation.Valid;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long diseaseId;
    private String diseaseName;
    private String customDisease;
    private LocalDateTime issueDate;
    private String prescriptionNotes;
    private List<PrescriptionItemDTO> items = new ArrayList<>();

    public static PrescriptionDTO fromEntity(Prescription prescription) {
        List<PrescriptionItemDTO> itemDTOs = prescription.getPrescriptionItems().stream()
                .map(PrescriptionItemDTO::fromEntity)
                .collect(Collectors.toList());

        PrescriptionDTO dto = PrescriptionDTO.builder()
                .id(prescription.getId())
                .patientId(prescription.getPatient().getPatientId())
                .patientName(prescription.getPatient().getFirstName() + " " + prescription.getPatient().getLastName())
                .issueDate(prescription.getIssueDate())
                .prescriptionNotes(prescription.getPrescriptionNotes())
                .items(itemDTOs)
                .build();

        if (prescription.getDisease() != null) {
            dto.setDiseaseId(prescription.getDisease().getId());
            dto.setDiseaseName(prescription.getDisease().getName());
        }

        if (prescription.getCustomDisease() != null) {
            dto.setCustomDisease(prescription.getCustomDisease());
        }

        return dto;
    }
}