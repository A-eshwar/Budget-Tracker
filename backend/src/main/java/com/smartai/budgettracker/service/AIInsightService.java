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

            // Build Comprehensive Payload required by new ML Models
            Map<String, Object> payload = new HashMap<>();
            payload.put("user_id", user.getId());
            payload.put("income", user.getMonthlySalary() != null ? user.getMonthlySalary() : currentMonthIncome);
            payload.put("age", user.getAge() != null ? user.getAge() : 30);
            payload.put("dependents", user.getDependents() != null ? user.getDependents() : 0);
            payload.put("occupation", user.getOccupation() != null ? user.getOccupation() : "Professional");
            payload.put("city_tier", user.getCityTier() != null ? user.getCityTier() : "Tier_2");
            payload.put("rent", user.getRent() != null ? user.getRent() : 0.0);
            payload.put("loan_repayment", user.getLoanRepayment() != null ? user.getLoanRepayment() : 0.0);
            payload.put("insurance", user.getInsurance() != null ? user.getInsurance() : 0.0);
            payload.put("desired_savings_percentage", user.getDesiredSavingsPercentage() != null ? user.getDesiredSavingsPercentage() : 20.0);
            payload.put("total_expense", totalAmount);
            payload.put("category_name", topCategory);

            // Compute basic categorical spending for the Health Score
            Map<String, Double> catSpend = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(Transaction::getCategory, Collectors.summingDouble(t -> t.getAmount().doubleValue())));
            
            payload.put("groceries", catSpend.getOrDefault("Food", 0.0) + catSpend.getOrDefault("Groceries", 0.0));
            payload.put("transport", catSpend.getOrDefault("Transport", 0.0));
            payload.put("eating_out", catSpend.getOrDefault("Dining", 0.0));
            payload.put("entertainment", catSpend.getOrDefault("Entertainment", 0.0));
            payload.put("utilities", catSpend.getOrDefault("Utilities", 0.0));
            payload.put("healthcare", catSpend.getOrDefault("Health", 0.0));

            Map health = mlServiceClient.executeMLPost("/health-score", payload).block();
            Map savings = mlServiceClient.executeMLPost("/savings-efficiency", payload).block();
            Map rec = mlServiceClient.executeMLPost("/recommendations", payload).block();

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
            Map<String, BigDecimal> categoryForecasts = new HashMap<>();
            String[] categories = {"Food", "Transport", "Entertainment", "Utilities", "Health", "Shopping", "Groceries", "Miscellaneous"};
            for (String cat : categories) {
                try {
                    Map<String, Object> catPayload = new HashMap<>(payload);
                    catPayload.put("category_name", cat);
                    Map p = mlServiceClient.executeMLPost("/predict-expense", catPayload).block();
                    if (p != null && p.containsKey("predicted_expense")) {
                        BigDecimal predictedVal = new BigDecimal(p.get("predicted_expense").toString());
                        totalPredicted = totalPredicted.add(predictedVal);
                        categoryForecasts.put(cat, predictedVal);
                    }
                } catch (Exception e) {
                    // Ignore individual category failures
                }
            }
            metrics.setPredictedNextMonthExpense(totalPredicted);
            metrics.setCategoryForecasts(categoryForecasts);

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
        mlServiceClient.executeMLPost("/train", new HashMap<>()).subscribe(
            result -> System.out.println("ML models retrained successfully globally from data.csv"),
            error -> System.err.println("Failed to retrain ML models: " + error.getMessage())
        );
    }
}
