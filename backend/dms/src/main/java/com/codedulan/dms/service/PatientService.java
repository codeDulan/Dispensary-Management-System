package com.codedulan.dms.service;

import com.codedulan.dms.dto.DoctorRegisterPatientDto;
import com.codedulan.dms.dto.PatientDto;
import com.codedulan.dms.dto.PatientLoginDto;
import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.entity.Users;
import com.codedulan.dms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final BarcodeService barcodeService;

    private final JWTUtils jwtUtils;

    @Transactional
    public Patient registerPatient(PatientDto request) {
        if (patientRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalStateException("Email already taken");
        }

        // Generate barcode from email
        String barcodeBase64 = barcodeService.generateBarcode(request.getEmail());

        Patient patient = Patient.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .nic(request.getNic())
                .address(request.getAddress())
                .contact(request.getContact())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .gender(request.getGender())
                .age(request.getAge())
                .weight(request.getWeight())
                .medicalNotes(request.getMedicalNotes())
                .barcode(barcodeBase64)
                .build();

        Patient savedPatient = patientRepository.save(patient);

        // Send barcode as email
        sendBarcodeEmail(savedPatient.getEmail(), barcodeBase64);

        return savedPatient;
    }





    @Transactional
    public Patient doctorRegisterPatient(DoctorRegisterPatientDto request) {
        if (patientRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalStateException("Email already taken");
        }

        // 1. Generate random password
        String tempPassword = RandomStringUtils.randomAlphanumeric(8);

        // 2. Generate barcode from email
        String barcodeBase64 = barcodeService.generateBarcode(request.getEmail());

        // 3. Create and save patient
        Patient patient = Patient.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .nic(request.getNic())
                .address(request.getAddress())
                .contact(request.getContact())
                .email(request.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .gender(request.getGender())
                .age(request.getAge())
                .weight(request.getWeight())
                .medicalNotes(request.getMedicalNotes())
                .barcode(barcodeBase64)
                .build();

        Patient savedPatient = patientRepository.save(patient);

        // 4. Send email with barcode and temp password
        sendBarcodeAndPasswordEmail(savedPatient.getEmail(), barcodeBase64, tempPassword);

        return savedPatient;
    }

    private void sendBarcodeAndPasswordEmail(String toEmail, String barcodeBase64, String tempPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject("Your Temporary Login for Sahanaya Medical Center");

            String htmlContent = "<p>You have been registered by a doctor at Sahanaya Medical Center.</p>" +
                    "<p><b>Temporary Password:</b> " + tempPassword + "</p>" +
                    "<p><b>Barcode:</b></p>" +
                    "<img src='cid:barcodeImage' />" +
                    "<p>Please login using this password and change it as soon as possible.</p>";

            helper.setText(htmlContent, true);

            byte[] imageBytes = Base64.getDecoder().decode(barcodeBase64);
            helper.addInline("barcodeImage", new org.springframework.core.io.ByteArrayResource(imageBytes), "image/png");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send registration email", e);
        }
    }






    private void sendBarcodeEmail(String toEmail, String barcodeBase64) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject("Your Patient Barcode");

            // Email HTML with <img src="cid:barcode">
            String htmlContent = "<p>Thank you for registering SAHANAYA Medical Center.</p>" +
                    "<p>Your barcode is shown below. Please present this during your next visit:</p>" +
                    "<img src='cid:barcodeImage' />";

            helper.setText(htmlContent, true);

            // Decode Base64 and attach inline image
            byte[] imageBytes = Base64.getDecoder().decode(barcodeBase64);
            helper.addInline("barcodeImage", new org.springframework.core.io.ByteArrayResource(imageBytes), "image/png");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send barcode email", e);
        }
    }



//    Patinet Login
public String authenticateAndGenerateToken(PatientLoginDto loginDto) {
    Patient patient = patientRepository.findByEmail(loginDto.getEmail())
            .orElseThrow(() -> new RuntimeException("Patient not found"));

    if (!passwordEncoder.matches(loginDto.getPassword(), patient.getPassword())) {
        throw new RuntimeException("Invalid credentials");
    }

    return jwtUtils.generateTokenForPatient(patient);
}



    public PatientDto getPatientByEmail(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Patient not found"));

        return PatientDto.builder()
                .firstName(patient.getFirstName())
                .email(patient.getEmail())
                .build();
    }


    public List<PatientDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(patient -> PatientDto.builder()
                        .id(patient.getPatientId())
                        .firstName(patient.getFirstName())
                        .email(patient.getEmail())
                        .gender(patient.getGender())
                        .age(patient.getAge())
                        .contact(patient.getContact())
                        .address(patient.getAddress())
                        .build())
                .collect(Collectors.toList());
    }





}
