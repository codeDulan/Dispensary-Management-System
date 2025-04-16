package com.codedulan.dms.service;

import com.codedulan.dms.dto.PatientDto;
import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final BarcodeService barcodeService;

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

}
