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
public class CreatePrescriptionTemplateDTO {
    @NotNull(message = "Template name is required")
    private String templateName;

    private String conditionName;

    private String templateNotes;

    @NotEmpty(message = "At least one medicine item is required")
    private List<@Valid CreatePrescriptionTemplateItemDTO> items;
}
