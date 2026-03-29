package com.smartai.budgettracker.controller;

import com.smartai.budgettracker.security.UserDetailsImpl;
import com.smartai.budgettracker.service.AIAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIAssistantController {

    @Autowired
    private AIAssistantService aiAssistantService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> request) {
        
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(aiAssistantService.getChatResponse(userDetails.getId(), userMessage));
    }
}
