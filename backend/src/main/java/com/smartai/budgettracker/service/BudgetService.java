package com.smartai.budgettracker.service;

import com.smartai.budgettracker.dto.BudgetDTO;
import com.smartai.budgettracker.entity.Budget;
import com.smartai.budgettracker.entity.User;
import com.smartai.budgettracker.repository.BudgetRepository;
import com.smartai.budgettracker.repository.UserRepository;
import com.smartai.budgettracker.repository.DefaultBudgetRepository;
import com.smartai.budgettracker.entity.DefaultBudget;
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

    @Autowired
    private DefaultBudgetRepository defaultBudgetRepository;

    public List<BudgetDTO> getBudgetsByUserId(Long userId, int month, int year) {
        List<DefaultBudget> defaults = defaultBudgetRepository.findByUserId(userId);
        List<Budget> overrides = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

        List<BudgetDTO> result = defaults.stream().map(db -> {
            Budget override = overrides.stream()
                    .filter(o -> o.getCategory().equals(db.getCategory()))
                    .findFirst()
                    .orElse(null);

            BudgetDTO dto = new BudgetDTO();
            dto.setCategory(db.getCategory());
            dto.setMonth(month);
            dto.setYear(year);

            if (override != null) {
                dto.setId(override.getId());
                dto.setAmount(override.getAmount());
            } else {
                dto.setId(null);
                dto.setAmount(db.getAmount());
            }
            return dto;
        }).collect(Collectors.toList());

        // Also add any overrides that don't have a corresponding default budget
        List<BudgetDTO> additionalOverrides = overrides.stream()
                .filter(o -> defaults.stream().noneMatch(db -> db.getCategory().equals(o.getCategory())))
                .map(o -> {
                    BudgetDTO dto = new BudgetDTO();
                    dto.setId(o.getId());
                    dto.setCategory(o.getCategory());
                    dto.setMonth(o.getMonth());
                    dto.setYear(o.getYear());
                    dto.setAmount(o.getAmount());
                    return dto;
                })
                .collect(Collectors.toList());

        result.addAll(additionalOverrides);
        return result;
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

    public BudgetDTO createOrUpdateDefaultBudget(Long userId, String category, java.math.BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DefaultBudget defaultBudget = defaultBudgetRepository.findByUserId(userId).stream()
                .filter(db -> db.getCategory().equals(category))
                .findFirst()
                .orElse(new DefaultBudget());

        defaultBudget.setUser(user);
        defaultBudget.setCategory(category);
        defaultBudget.setAmount(amount);

        DefaultBudget saved = defaultBudgetRepository.save(defaultBudget);

        BudgetDTO dto = new BudgetDTO();
        dto.setCategory(saved.getCategory());
        dto.setAmount(saved.getAmount());
        return dto;
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

    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget override not found"));
        
        // Ensure the budget belongs to the requesting user
        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this budget");
        }
        
        budgetRepository.delete(budget);
    }
}
