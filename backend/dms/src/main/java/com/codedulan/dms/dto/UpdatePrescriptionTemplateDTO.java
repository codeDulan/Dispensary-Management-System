package com.codedulan.dms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePrescriptionTemplateDTO {
    private String templateName;
    private String conditionName;
    private String templateNotes;

    private List<UpdatePrescriptionTemplateItemDTO> updatedItems;
    private List<CreatePrescriptionTemplateItemDTO> newItems;
}
