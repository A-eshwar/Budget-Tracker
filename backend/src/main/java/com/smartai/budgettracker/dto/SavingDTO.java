package com.smartai.budgettracker.dto;

import java.math.BigDecimal;

public class SavingDTO {
    private Long id;
    private BigDecimal amount;
    private int month;
    private int year;
    private String description;

    public SavingDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
