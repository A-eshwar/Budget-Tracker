package com.smartai.budgettracker.controller;

import com.smartai.budgettracker.entity.FinancialMetrics;
import com.smartai.budgettracker.security.UserDetailsImpl;
import com.smartai.budgettracker.service.AIInsightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/insights")
@CrossOrigin(origins = "*")
public class AIInsightController {

    @Autowired
    private AIInsightService insightService;

    @GetMapping
    public ResponseEntity<FinancialMetrics> getInsights(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(insightService.getInsights(userDetails.getId()));
    }
}
