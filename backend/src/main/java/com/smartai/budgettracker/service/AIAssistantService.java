package com.smartai.budgettracker.service;

import com.smartai.budgettracker.entity.FinancialMetrics;
import com.smartai.budgettracker.repository.FinancialMetricsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AIAssistantService {

    @Autowired
    private FinancialMetricsRepository metricsRepository;

    @Value("${ai.assistant.key}")
    private String apiKey;

    public Map<String, String> getChatResponse(Long userId, String userMessage) {
        FinancialMetrics metrics = metricsRepository.findByUserId(userId).orElse(null);
        
        String response;
        String lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.contains("spending") || lowerMessage.contains("expense")) {
            if (metrics != null && metrics.getHealthScore() != null) {
                response = String.format("Based on your current data, your Financial Health Score is %s. " +
                        "Your predicted expense for next month is ₹%s. I recommend focusing on your %s spending to optimize your budget.",
                        metrics.getHealthScore(), metrics.getPredictedNextMonthExpense(), 
                        getTopCategory(metrics));
            } else {
                response = "I see your transactions, but I'm still calculating your full financial health. Overall, your spending seems to be within a manageable range for your income level.";
            }
        } else if (lowerMessage.contains("save") || lowerMessage.contains("savings")) {
            if (metrics != null && metrics.getSavingsEfficiency() != null) {
                response = String.format("Your savings efficiency is currently at %s%%. To reach your goal, you might want to review your non-essential spending. Your personalized recommendation: %s",
                        metrics.getSavingsEfficiency(), metrics.getRecommendations());
            } else {
                response = "Saving more is a great goal! Try setting a small, consistent budget for utilities and transport to see immediate results.";
            }
        } else if (lowerMessage.contains("hello") || lowerMessage.contains("hi")) {
            response = "Hello! I'm your SmartBudget AI Assistant. I can help you analyze your spending, give you savings tips, or explain your financial health score. What's on your mind?";
        } else {
            response = "That's an interesting question. Looking at your current budget and savings goals, the best approach would be to maintain your current discipline while looking for small leaks in your miscellaneous categories. Is there anything specific about your budget you'd like me to analyze?";
        }

        Map<String, String> result = new HashMap<>();
        result.put("role", "assistant");
        result.put("content", response);
        return result;
    }

    private String getTopCategory(FinancialMetrics metrics) {
        if (metrics.getCategoryForecasts() == null || metrics.getCategoryForecasts().isEmpty()) {
            return "highest";
        }
        return metrics.getCategoryForecasts().entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("general");
    }
}
