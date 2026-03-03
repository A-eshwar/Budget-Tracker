package com.smartai.budgettracker.controller;

import com.smartai.budgettracker.dto.BudgetDTO;
import com.smartai.budgettracker.security.UserDetailsImpl;
import com.smartai.budgettracker.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getAllBudgets(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(budgetService.getBudgetsByUserId(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<BudgetDTO> setBudget(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody BudgetDTO dto) {
        return ResponseEntity.ok(budgetService.createOrUpdateBudget(userDetails.getId(), dto));
    }
}
