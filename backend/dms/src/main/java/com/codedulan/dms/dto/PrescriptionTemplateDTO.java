package com.codedulan.dms.dto;

import com.codedulan.dms.entity.PrescriptionTemplate;
import com.codedulan.dms.entity.PrescriptionTemplateItem;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionTemplateDTO {
    private Long id;
    private String templateName;
    private String conditionName;
    private String templateNotes;
    private List<PrescriptionTemplateItemDTO> items = new ArrayList<>();

    public static PrescriptionTemplateDTO fromEntity(PrescriptionTemplate template) {
        List<PrescriptionTemplateItemDTO> itemDTOs = template.getTemplateItems().stream()
                .map(PrescriptionTemplateItemDTO::fromEntity)
                .collect(Collectors.toList());

        return PrescriptionTemplateDTO.builder()
                .id(template.getId())
                .templateName(template.getTemplateName())
                .conditionName(template.getConditionName())
                .templateNotes(template.getTemplateNotes())
                .items(itemDTOs)
                .build();
    }
}