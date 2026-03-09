package com.smartai.budgettracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smartai.budgettracker.entity.DefaultBudget;
import java.util.List;
import java.util.Optional;

@Repository
public interface DefaultBudgetRepository extends JpaRepository<DefaultBudget, Long> {
    List<DefaultBudget> findByUserId(Long userId);
    Optional<DefaultBudget> findByUserIdAndCategory(Long userId, String category);
}
