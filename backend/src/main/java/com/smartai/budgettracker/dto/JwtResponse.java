package com.smartai.budgettracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class JwtResponse {
  private String token;
  private String type = "Bearer";
  private Long id;
  private String username;
  private String email;
  private Boolean profileSetup;
  private BigDecimal monthlySalary;
  private List<String> roles;

  public JwtResponse(String accessToken, Long id, String username, String email, Boolean profileSetup, BigDecimal monthlySalary, List<String> roles) {
    this.token = accessToken;
    this.id = id;
    this.username = username;
    this.email = email;
    this.profileSetup = profileSetup;
    this.monthlySalary = monthlySalary;
    this.roles = roles;
  }

  public String getToken() { return token; }
  public void setToken(String token) { this.token = token; }
  public String getTokenType() { return type; }
  public void setTokenType(String tokenType) { this.type = tokenType; }
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }
  public Boolean getProfileSetup() { return profileSetup; }
  public void setProfileSetup(Boolean profileSetup) { this.profileSetup = profileSetup; }
  public BigDecimal getMonthlySalary() { return monthlySalary; }
  public void setMonthlySalary(BigDecimal monthlySalary) { this.monthlySalary = monthlySalary; }
  public List<String> getRoles() { return roles; }
}
