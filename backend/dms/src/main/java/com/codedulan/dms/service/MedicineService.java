package com.codedulan.dms.service;

import com.codedulan.dms.dto.CreateMedicineDTO;
import com.codedulan.dms.dto.MedicineDTO;
import com.codedulan.dms.dto.UpdateMedicineDTO;
import com.codedulan.dms.entity.Medicine;
import com.codedulan.dms.exception.BusinessLogicException;
import com.codedulan.dms.exception.ResourceAlreadyExistsException;
import com.codedulan.dms.exception.ResourceNotFoundException;
import com.codedulan.dms.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public List<MedicineDTO> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(MedicineDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public MedicineDTO getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
        return MedicineDTO.fromEntity(medicine);
    }

    public List<MedicineDTO> searchMedicines(String query) {
        return medicineRepository.findByNameContainingIgnoreCase(query).stream()
                .map(MedicineDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public MedicineDTO createMedicine(CreateMedicineDTO createDTO) {
        if (medicineRepository.existsByName(createDTO.getName())) {
            throw new ResourceAlreadyExistsException("Medicine with name " + createDTO.getName() + " already exists");
        }

        Medicine medicine = Medicine.builder()
                .name(createDTO.getName())
                .description(createDTO.getDescription())
                .lethalDosagePerKg(createDTO.getLethalDosagePerKg())
                .weight(createDTO.getWeight())  // Add the weight field
                .build();

        Medicine savedMedicine = medicineRepository.save(medicine);
        return MedicineDTO.fromEntity(savedMedicine);
    }

    public MedicineDTO updateMedicine(Long id, UpdateMedicineDTO updateDTO) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));

        if (updateDTO.getDescription() != null) {
            medicine.setDescription(updateDTO.getDescription());
        }

        if (updateDTO.getLethalDosagePerKg() != null) {
            medicine.setLethalDosagePerKg(updateDTO.getLethalDosagePerKg());
        }

        // Add update for weight field
        if (updateDTO.getWeight() != null) {
            medicine.setWeight(updateDTO.getWeight());
        }

        Medicine updatedMedicine = medicineRepository.save(medicine);
        return MedicineDTO.fromEntity(updatedMedicine);
    }

    public void deleteMedicine(Long id) {
        if (!medicineRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medicine not found with id: " + id);
        }

        // Check if medicine is used in inventory before deleting
        Medicine medicine = medicineRepository.findById(id).get();
        if (!medicine.getInventoryItems().isEmpty()) {
            throw new BusinessLogicException("Cannot delete medicine that is in inventory");
        }

        medicineRepository.deleteById(id);
    }
}