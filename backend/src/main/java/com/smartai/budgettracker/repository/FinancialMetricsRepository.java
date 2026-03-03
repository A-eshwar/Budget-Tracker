package com.smartai.budgettracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smartai.budgettracker.entity.FinancialMetrics;
import java.util.Optional;

@Repository
public interface FinancialMetricsRepository extends JpaRepository<FinancialMetrics, Long> {
    Optional<FinancialMetrics> findByUserId(Long userId);
}
