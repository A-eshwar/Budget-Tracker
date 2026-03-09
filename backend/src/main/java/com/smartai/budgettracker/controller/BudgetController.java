package com.smartai.budgettracker.controller;

import com.smartai.budgettracker.dto.BudgetDTO;
import com.smartai.budgettracker.security.UserDetailsImpl;
import com.smartai.budgettracker.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getAllBudgets(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "year", required = false) Integer year) {
        
        int m = month != null ? month : LocalDate.now().getMonthValue();
        int y = year != null ? year : LocalDate.now().getYear();

        return ResponseEntity.ok(budgetService.getBudgetsByUserId(userDetails.getId(), m, y));
    }

    @PostMapping
    public ResponseEntity<BudgetDTO> setBudget(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody BudgetDTO dto) {
        return ResponseEntity.ok(budgetService.createOrUpdateBudget(userDetails.getId(), dto));
    }

    @PostMapping("/default")
    public ResponseEntity<BudgetDTO> setDefaultBudget(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody BudgetDTO dto) {
        return ResponseEntity.ok(budgetService.createOrUpdateDefaultBudget(userDetails.getId(), dto.getCategory(), dto.getAmount()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        budgetService.deleteBudget(userDetails.getId(), id);
        return ResponseEntity.ok("Budget override deleted successfully.");
    }
}
