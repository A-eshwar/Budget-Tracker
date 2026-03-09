package com.smartai.budgettracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProfileSetupRequest {
    private BigDecimal monthlySalary;
    private List<DefaultBudgetDTO> defaultBudgets;

    public BigDecimal getMonthlySalary() {
        return monthlySalary;
    }

    public void setMonthlySalary(BigDecimal monthlySalary) {
        this.monthlySalary = monthlySalary;
    }

    public List<DefaultBudgetDTO> getDefaultBudgets() {
        return defaultBudgets;
    }

    public void setDefaultBudgets(List<DefaultBudgetDTO> defaultBudgets) {
        this.defaultBudgets = defaultBudgets;
    }
}
