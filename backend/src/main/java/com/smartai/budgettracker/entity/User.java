package com.smartai.budgettracker.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    private String role = "ROLE_USER";

    @Column(name = "profile_setup")
    private Boolean profileSetup = false;

    @Column(name = "monthly_salary")
    private BigDecimal monthlySalary;

    @Column(name = "age")
    private Integer age;

    @Column(name = "dependents")
    private Integer dependents;

    @Column(name = "occupation")
    private String occupation;

    @Column(name = "city_tier")
    private String cityTier;

    @Column(name = "rent")
    private BigDecimal rent;

    @Column(name = "loan_repayment")
    private BigDecimal loanRepayment;

    @Column(name = "insurance")
    private BigDecimal insurance;

    @Column(name = "desired_savings_percentage")
    private BigDecimal desiredSavingsPercentage;

    public User() {
    }

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getProfileSetup() {
        return profileSetup;
    }

    public void setProfileSetup(Boolean profileSetup) {
        this.profileSetup = profileSetup;
    }

    public BigDecimal getMonthlySalary() {
        return monthlySalary;
    }

    public void setMonthlySalary(BigDecimal monthlySalary) {
        this.monthlySalary = monthlySalary;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Integer getDependents() {
        return dependents;
    }

    public void setDependents(Integer dependents) {
        this.dependents = dependents;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getCityTier() {
        return cityTier;
    }

    public void setCityTier(String cityTier) {
        this.cityTier = cityTier;
    }

    public BigDecimal getRent() {
        return rent;
    }

    public void setRent(BigDecimal rent) {
        this.rent = rent;
    }

    public BigDecimal getLoanRepayment() {
        return loanRepayment;
    }

    public void setLoanRepayment(BigDecimal loanRepayment) {
        this.loanRepayment = loanRepayment;
    }

    public BigDecimal getInsurance() {
        return insurance;
    }

    public void setInsurance(BigDecimal insurance) {
        this.insurance = insurance;
    }

    public BigDecimal getDesiredSavingsPercentage() {
        return desiredSavingsPercentage;
    }

    public void setDesiredSavingsPercentage(BigDecimal desiredSavingsPercentage) {
        this.desiredSavingsPercentage = desiredSavingsPercentage;
    }
}
