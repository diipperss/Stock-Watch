package com.example.demo.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Wallet;
import com.example.demo.model.User;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    List<Wallet> findByUser(User user);
    List<Wallet> findByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM Wallet w WHERE w.user = :user")
    BigDecimal getTotalMoneyByUser(@Param("user") User user);
}

