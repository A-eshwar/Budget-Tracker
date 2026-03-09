package com.smartai.budgettracker.controller;

import java.util.List;
import java.util.stream.Collectors;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.smartai.budgettracker.dto.JwtResponse;
import com.smartai.budgettracker.dto.LoginRequest;
import com.smartai.budgettracker.dto.MessageResponse;
import com.smartai.budgettracker.dto.SignupRequest;
import com.smartai.budgettracker.dto.ProfileSetupRequest;
import com.smartai.budgettracker.entity.User;
import com.smartai.budgettracker.entity.DefaultBudget;
import com.smartai.budgettracker.dto.DefaultBudgetDTO;
import com.smartai.budgettracker.repository.UserRepository;
import com.smartai.budgettracker.repository.BudgetRepository;
import com.smartai.budgettracker.repository.DefaultBudgetRepository;
import com.smartai.budgettracker.repository.TransactionRepository;
import com.smartai.budgettracker.entity.Transaction;
import java.time.LocalDate;
import com.smartai.budgettracker.security.JwtUtils;
import com.smartai.budgettracker.security.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  BudgetRepository budgetRepository;

  @Autowired
  DefaultBudgetRepository defaultBudgetRepository;

  @Autowired
  TransactionRepository transactionRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

    SecurityContextHolder.getContext().setAuthentication(authentication);
    String jwt = jwtUtils.generateJwtToken(authentication);
    
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
    List<String> roles = userDetails.getAuthorities().stream()
        .map(item -> item.getAuthority())
        .collect(Collectors.toList());

    return ResponseEntity.ok(new JwtResponse(jwt, 
                         userDetails.getId(), 
                         userDetails.getUsername(), 
                         userDetails.getEmail(), 
                         userDetails.getProfileSetup(),
                         userDetails.getMonthlySalary(),
                         roles));
  }

  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    if (userRepository.existsByUsername(signUpRequest.getUsername())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Username is already taken!"));
    }

    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Email is already in use!"));
    }

    // Create new user's account
    User user = new User(signUpRequest.getUsername(), 
               signUpRequest.getEmail(),
               encoder.encode(signUpRequest.getPassword()));

    userRepository.save(user);

    return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
  }

  @PostMapping("/profile-setup")
  public ResponseEntity<?> setupProfile(@Valid @RequestBody ProfileSetupRequest request) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    
    User user = userRepository.findById(userDetails.getId()).orElse(null);
    if (user == null) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
    }
    
    user.setMonthlySalary(request.getMonthlySalary());
    user.setProfileSetup(true);
    userRepository.save(user);
    
    if (request.getDefaultBudgets() != null) {
        for (DefaultBudgetDTO dto : request.getDefaultBudgets()) {
            DefaultBudget db = new DefaultBudget();
            db.setUser(user);
            db.setCategory(dto.getCategory());
            db.setAmount(dto.getAmount());
            defaultBudgetRepository.save(db);
        }
    }

    if (request.getMonthlySalary() != null) {
        Transaction salaryTx = new Transaction();
        salaryTx.setUser(user);
        salaryTx.setCategory("Salary");
        salaryTx.setAmount(request.getMonthlySalary());
        salaryTx.setDescription("Initial Monthly Salary Setup");
        salaryTx.setTransactionDate(LocalDate.now());
        salaryTx.setType(Transaction.TransactionType.INCOME);
        transactionRepository.save(salaryTx);
    }
    
    return ResponseEntity.ok(new MessageResponse("Profile setup successfully!"));
  }
}
