package com.smartai.budgettracker.repository;

import com.smartai.budgettracker.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Alert> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
}
