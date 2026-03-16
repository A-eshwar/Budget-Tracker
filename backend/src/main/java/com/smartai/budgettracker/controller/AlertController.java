package com.smartai.budgettracker.controller;

import com.smartai.budgettracker.entity.Alert;
import com.smartai.budgettracker.repository.AlertRepository;
import com.smartai.budgettracker.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    @GetMapping
    public ResponseEntity<List<Alert>> getUserAlerts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(alertRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Alert>> getUnreadAlerts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(alertRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userDetails.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        Alert alert = alertRepository.findById(id).orElseThrow(() -> new RuntimeException("Alert not found"));
        if (!alert.getUser().getId().equals(userDetails.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        alert.setRead(true);
        alertRepository.save(alert);
        return ResponseEntity.ok().build();
    }
}
