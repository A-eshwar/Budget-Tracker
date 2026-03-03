package com.smartai.budgettracker.service;

import com.smartai.budgettracker.dto.BudgetDTO;
import com.smartai.budgettracker.entity.Budget;
import com.smartai.budgettracker.entity.User;
import com.smartai.budgettracker.repository.BudgetRepository;
import com.smartai.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    public List<BudgetDTO> getBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserIdOrderByYearDescMonthDesc(userId) // I see I need a new repo method or just sort
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BudgetDTO createOrUpdateBudget(Long userId, BudgetDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget budget = budgetRepository.findByUserIdAndCategoryAndMonthAndYear(
                userId, dto.getCategory(), dto.getMonth(), dto.getYear())
                .orElse(new Budget());

        budget.setUser(user);
        budget.setCategory(dto.getCategory());
        budget.setAmount(dto.getAmount());
        budget.setMonth(dto.getMonth());
        budget.setYear(dto.getYear());

        Budget saved = budgetRepository.save(budget);
        return convertToDTO(saved);
    }

    private BudgetDTO convertToDTO(Budget b) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(b.getId());
        dto.setCategory(b.getCategory());
        dto.setAmount(b.getAmount());
        dto.setMonth(b.getMonth());
        dto.setYear(b.getYear());
        return dto;
    }
}
