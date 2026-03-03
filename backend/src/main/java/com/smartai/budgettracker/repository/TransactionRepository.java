package com.smartai.budgettracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smartai.budgettracker.entity.Transaction;
import com.smartai.budgettracker.entity.User;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);
}
