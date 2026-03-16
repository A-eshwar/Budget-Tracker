package com.smartai.budgettracker.service;

import com.smartai.budgettracker.dto.SavingDTO;
import com.smartai.budgettracker.entity.Saving;
import com.smartai.budgettracker.entity.Transaction;
import com.smartai.budgettracker.entity.User;
import com.smartai.budgettracker.repository.SavingRepository;
import com.smartai.budgettracker.repository.TransactionRepository;
import com.smartai.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SavingService {

    @Autowired
    private SavingRepository savingRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<SavingDTO> getSavingsByUserId(Long userId) {
        return savingRepository.findByUserIdOrderByYearDescMonthDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SavingDTO addOrUpdateSaving(Long userId, SavingDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculate current balance (Income - Expense - Previous Savings of other months)
        BigDecimal totalIncome = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId).stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId).stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal otherSavings = savingRepository.findByUserIdOrderByYearDescMonthDesc(userId).stream()
                .filter(s -> !(s.getMonth() == dto.getMonth() && s.getYear() == dto.getYear()))
                .map(Saving::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal availableBalance = totalIncome.subtract(totalExpense).subtract(otherSavings);

        if (dto.getAmount().compareTo(availableBalance) > 0) {
            throw new RuntimeException("Not enough balance");
        }

        Saving saving = savingRepository.findByUserIdAndMonthAndYear(userId, dto.getMonth(), dto.getYear())
                .orElse(new Saving());

        saving.setUser(user);
        saving.setAmount(dto.getAmount());
        saving.setMonth(dto.getMonth());
        saving.setYear(dto.getYear());

        Saving saved = savingRepository.save(saving);
        return convertToDTO(saved);
    }

    public void deleteSaving(Long userId, Long id) {
        Saving saving = savingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Saving not found"));
        if (!saving.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        savingRepository.delete(saving);
    }

    private SavingDTO convertToDTO(Saving s) {
        SavingDTO dto = new SavingDTO();
        dto.setId(s.getId());
        dto.setAmount(s.getAmount());
        dto.setMonth(s.getMonth());
        dto.setYear(s.getYear());
        return dto;
    }
}
