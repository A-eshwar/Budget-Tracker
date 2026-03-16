package com.smartai.budgettracker.service;

import com.smartai.budgettracker.dto.TransactionDTO;
import com.smartai.budgettracker.entity.Transaction;
import com.smartai.budgettracker.entity.User;
import com.smartai.budgettracker.repository.TransactionRepository;
import com.smartai.budgettracker.repository.UserRepository;
import com.smartai.budgettracker.repository.BudgetRepository;
import com.smartai.budgettracker.repository.AlertRepository;
import com.smartai.budgettracker.entity.Budget;
import com.smartai.budgettracker.entity.Alert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MLServiceClient mlServiceClient;

    @Autowired
    private AIInsightService aiInsightService;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private AlertRepository alertRepository;

    public List<TransactionDTO> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TransactionDTO createTransaction(Long userId, TransactionDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setTransactionDate(dto.getTransactionDate());
        transaction.setType(dto.getType());

        // Perform Anomaly Detection via ML Service
        try {
            int month = dto.getTransactionDate().getMonthValue();
            int dayOfWeek = dto.getTransactionDate().getDayOfWeek().getValue() - 1; // 0-6
            Map result = mlServiceClient.detectAnomaly(dto.getAmount().doubleValue(), month, dayOfWeek).block();
            if (result != null && (Boolean) result.get("is_anomaly")) {
                transaction.setAnomaly(true);
            }
        } catch (Exception e) {
            // Log error and continue
        }

        Transaction saved = transactionRepository.save(transaction);
        
        checkBudgetExceeded(user, saved);

        // Trigger ML retraining in background
        try {
            aiInsightService.triggerRetraining(userId);
        } catch (Exception e) {
            // Log error and continue
        }

        return convertToDTO(saved);
    }

    public void deleteTransaction(Long id, Long userId) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (!transaction.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this transaction");
        }
        
        transactionRepository.deleteById(id);
    }

    public TransactionDTO updateTransaction(Long id, Long userId, TransactionDTO dto) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (!transaction.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setTransactionDate(dto.getTransactionDate());
        transaction.setType(dto.getType());

        Transaction saved = transactionRepository.save(transaction);
        checkBudgetExceeded(transaction.getUser(), saved);
        return convertToDTO(saved);
    }

    private TransactionDTO convertToDTO(Transaction t) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(t.getId());
        dto.setAmount(t.getAmount());
        dto.setCategory(t.getCategory());
        dto.setDescription(t.getDescription());
        dto.setTransactionDate(t.getTransactionDate());
        dto.setType(t.getType());
        dto.setAnomaly(t.isAnomaly());
        return dto;
    }

    private void checkBudgetExceeded(User user, Transaction transaction) {
        if (transaction.getType() != Transaction.TransactionType.EXPENSE) {
            return;
        }

        int month = transaction.getTransactionDate().getMonthValue();
        int year = transaction.getTransactionDate().getYear();
        String category = transaction.getCategory();

        budgetRepository.findByUserIdAndCategoryAndMonthAndYear(user.getId(), category, month, year)
                .ifPresent(budget -> {
                    java.math.BigDecimal totalSpent = transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId()).stream()
                            .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                            .filter(t -> t.getCategory().equals(category))
                            .filter(t -> t.getTransactionDate().getMonthValue() == month)
                            .filter(t -> t.getTransactionDate().getYear() == year)
                            .map(Transaction::getAmount)
                            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                    if (totalSpent.compareTo(budget.getAmount()) > 0) {
                        // Create an alert
                        Alert alert = new Alert();
                        alert.setUser(user);
                        alert.setType("BUDGET_EXCEEDED");
                        alert.setMessage("You have exceeded your budget of ₹" + budget.getAmount() + " for " + category + " in " + transaction.getTransactionDate().getMonth() + ".");
                        alertRepository.save(alert);
                    }
                });
    }
}
