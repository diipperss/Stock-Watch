package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.math.BigDecimal;
import java.util.List;


import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import com.example.demo.model.Wallet;
import com.example.demo.repository.WalletRepository;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @GetMapping("/balance/{userId}")
    public ResponseEntity<?> getUserBalance(@PathVariable("userId") Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            BigDecimal total = walletRepository.getTotalMoneyByUser(userOpt.get());
            return ResponseEntity.ok(total);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Wallet>> getUserWallets(@PathVariable("userId") Long userId) {
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        if (!wallets.isEmpty()) {
            return ResponseEntity.ok(wallets);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
