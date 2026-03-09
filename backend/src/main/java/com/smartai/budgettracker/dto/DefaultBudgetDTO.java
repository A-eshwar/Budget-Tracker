package com.smartai.budgettracker.dto;

import java.math.BigDecimal;

public class DefaultBudgetDTO {
    private Long id;
    private String category;
    private BigDecimal amount;

    public DefaultBudgetDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
