package com.smartai.budgettracker.service;

import com.smartai.budgettracker.dto.TransactionDTO;
import com.smartai.budgettracker.entity.Transaction;
import com.smartai.budgettracker.entity.User;
import com.smartai.budgettracker.repository.TransactionRepository;
import com.smartai.budgettracker.repository.UserRepository;
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
        
        // Trigger ML retraining in background
        try {
            aiInsightService.triggerRetraining(userId);
        } catch (Exception e) {
            // Log error and continue
        }

        return convertToDTO(saved);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
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
}
