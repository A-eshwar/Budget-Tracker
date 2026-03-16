package com.smartai.budgettracker.service;

import com.smartai.budgettracker.entity.FinancialMetrics;
import com.smartai.budgettracker.entity.Transaction;
import com.smartai.budgettracker.entity.User;
import com.smartai.budgettracker.repository.FinancialMetricsRepository;
import com.smartai.budgettracker.repository.TransactionRepository;
import com.smartai.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class AIInsightService {

    @Autowired
    private MLServiceClient mlServiceClient;

    @Autowired
    private FinancialMetricsRepository metricsRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public FinancialMetrics getInsights(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FinancialMetrics metrics = metricsRepository.findByUserId(userId)
                .orElse(new FinancialMetrics());
        metrics.setUser(user);

        // Calculate total spending for the current month
        LocalDate now = LocalDate.now();
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
        BigDecimal currentMonthSpending = transactions.stream()
                .filter(t -> t.getTransactionDate().getMonth() == now.getMonth() && t.getTransactionDate().getYear() == now.getYear())
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Double totalAmount = currentMonthSpending.doubleValue();

        if (transactions.isEmpty()) {
            metrics.setHealthScore(BigDecimal.ZERO);
            metrics.setSavingsEfficiency(BigDecimal.ZERO);
            metrics.setPredictedNextMonthExpense(BigDecimal.ZERO);
            metrics.setRecommendations("Start adding transactions to get AI-powered financial insights!");
            return metricsRepository.save(metrics);
        }

        try {
            // Call ML Service for various metrics
            // Find top spending category for specific recommendation
            String topCategory = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .collect(java.util.stream.Collectors.groupingBy(Transaction::getCategory, java.util.stream.Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("expenses");

            Double currentMonthIncome = transactions.stream()
                .filter(t -> t.getTransactionDate().getMonth() == now.getMonth() && t.getTransactionDate().getYear() == now.getYear())
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .doubleValue();

            Map health = mlServiceClient.getHealthScore(userId, totalAmount, currentMonthIncome).block();
            Map savings = mlServiceClient.getSavingsEfficiency(userId, totalAmount, currentMonthIncome).block();
            Map rec = mlServiceClient.getRecommendations(userId, now.getMonthValue(), 0, topCategory).block();

            if (health != null && health.containsKey("health_score")) {
                metrics.setHealthScore(new BigDecimal(health.get("health_score").toString()));
            } else {
                metrics.setHealthScore(BigDecimal.ZERO);
            }

            if (savings != null && savings.containsKey("savings_efficiency")) {
                metrics.setSavingsEfficiency(new BigDecimal(savings.get("savings_efficiency").toString()));
            } else {
                metrics.setSavingsEfficiency(BigDecimal.ZERO);
            }

            BigDecimal totalPredicted = BigDecimal.ZERO;
            for (int catId = 0; catId <= 8; catId++) {
                try {
                    Map p = mlServiceClient.predictExpense(userId, now.plusMonths(1).getMonthValue(), catId).block();
                    if (p != null && p.containsKey("predicted_expense")) {
                        totalPredicted = totalPredicted.add(new BigDecimal(p.get("predicted_expense").toString()));
                    }
                } catch (Exception e) {
                    // Ignore individual category failures
                }
            }
            metrics.setPredictedNextMonthExpense(totalPredicted);

            if (rec != null && rec.containsKey("recommendation")) {
                metrics.setRecommendations(rec.get("recommendation").toString());
            }

        } catch (Exception e) {
            // Silently fail and keep existing/zero metrics
            System.err.println("Error calling ML service: " + e.getMessage());
        }

        return metricsRepository.save(metrics);
    }

    public void triggerRetraining(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
        if (transactions.isEmpty()) return;

        List<Map<String, Object>> data = transactions.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("user_id", userId);
            map.put("amount", t.getAmount().doubleValue());
            map.put("category", t.getCategory());
            map.put("date", t.getTransactionDate().toString());
            map.put("type", t.getType().name());
            map.put("month", t.getTransactionDate().getMonthValue());
            map.put("day_of_week", t.getTransactionDate().getDayOfWeek().getValue() - 1);
            return map;
        }).collect(Collectors.toList());

        mlServiceClient.trainModels(data).subscribe(
            result -> System.out.println("ML models retrained successfully for user: " + userId),
            error -> System.err.println("Failed to retrain ML models: " + error.getMessage())
        );
    }
}
