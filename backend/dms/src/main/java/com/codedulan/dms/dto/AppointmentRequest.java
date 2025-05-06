package com.codedulan.dms.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {
    private LocalDate date;
    private LocalTime time;
    private String appointmentType;
    private String notes;
}