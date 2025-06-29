package com.codedulan.dms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePrescriptionDTO {
    private String prescriptionNotes;

    private List<UpdatePrescriptionItemDTO> updatedItems;
    private List<CreatePrescriptionItemDTO> newItems;
}
