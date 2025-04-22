package com.codedulan.dms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePrescriptionDTO {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String prescriptionNotes;

    @NotEmpty(message = "At least one medicine item is required")
    private List<@Valid CreatePrescriptionItemDTO> items;
}
