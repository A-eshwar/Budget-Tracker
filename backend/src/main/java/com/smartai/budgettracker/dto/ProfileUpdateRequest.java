package com.smartai.budgettracker.dto;

import java.math.BigDecimal;

public class ProfileUpdateRequest {
    private BigDecimal monthlySalary;
    private Integer age;
    private Integer dependents;
    private String occupation;
    private String cityTier;
    private BigDecimal rent;
    private BigDecimal loanRepayment;
    private BigDecimal insurance;
    private BigDecimal desiredSavingsPercentage;

    public BigDecimal getMonthlySalary() { return monthlySalary; }
    public void setMonthlySalary(BigDecimal monthlySalary) { this.monthlySalary = monthlySalary; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Integer getDependents() { return dependents; }
    public void setDependents(Integer dependents) { this.dependents = dependents; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getCityTier() { return cityTier; }
    public void setCityTier(String cityTier) { this.cityTier = cityTier; }

    public BigDecimal getRent() { return rent; }
    public void setRent(BigDecimal rent) { this.rent = rent; }

    public BigDecimal getLoanRepayment() { return loanRepayment; }
    public void setLoanRepayment(BigDecimal loanRepayment) { this.loanRepayment = loanRepayment; }

    public BigDecimal getInsurance() { return insurance; }
    public void setInsurance(BigDecimal insurance) { this.insurance = insurance; }

    public BigDecimal getDesiredSavingsPercentage() { return desiredSavingsPercentage; }
    public void setDesiredSavingsPercentage(BigDecimal desiredSavingsPercentage) { this.desiredSavingsPercentage = desiredSavingsPercentage; }
}
