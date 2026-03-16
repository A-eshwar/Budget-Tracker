package com.smartai.budgettracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smartai.budgettracker.entity.Saving;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavingRepository extends JpaRepository<Saving, Long> {
    List<Saving> findByUserIdOrderByYearDescMonthDesc(Long userId);
    Optional<Saving> findByUserIdAndMonthAndYear(Long userId, int month, int year);
}
