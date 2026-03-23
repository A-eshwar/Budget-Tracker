package com.smartai.budgettracker.controller;

import com.smartai.budgettracker.dto.SavingDTO;
import com.smartai.budgettracker.security.UserDetailsImpl;
import com.smartai.budgettracker.service.SavingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/savings")
@CrossOrigin(origins = "*")
public class SavingController {

    @Autowired
    private SavingService savingService;

    @GetMapping
    public ResponseEntity<List<SavingDTO>> getSavings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(savingService.getSavingsByUserId(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<SavingDTO> addOrUpdateSaving(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody SavingDTO dto) {
        return ResponseEntity.ok(savingService.addOrUpdateSaving(userDetails.getId(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSaving(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id) {
        savingService.deleteSaving(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
