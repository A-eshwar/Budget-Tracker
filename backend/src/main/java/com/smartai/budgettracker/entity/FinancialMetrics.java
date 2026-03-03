package com.smartai.budgettracker.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "financial_metrics")
public class FinancialMetrics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private BigDecimal healthScore = BigDecimal.ZERO;
    private BigDecimal savingsEfficiency = BigDecimal.ZERO;
    private BigDecimal predictedNextMonthExpense = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    public FinancialMetrics() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public BigDecimal getHealthScore() { return healthScore; }
    public void setHealthScore(BigDecimal healthScore) { this.healthScore = healthScore; }
    public BigDecimal getSavingsEfficiency() { return savingsEfficiency; }
    public void setSavingsEfficiency(BigDecimal savingsEfficiency) { this.savingsEfficiency = savingsEfficiency; }
    public BigDecimal getPredictedNextMonthExpense() { return predictedNextMonthExpense; }
    public void setPredictedNextMonthExpense(BigDecimal predictedNextMonthExpense) { this.predictedNextMonthExpense = predictedNextMonthExpense; }
    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
}
