package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

import com.example.demo.model.Favorite;
import com.example.demo.repository.FavoriteRepository;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/favorites")
public class FavController {
    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> addFavorite(@RequestBody FavoriteRequest request) {
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        User user = userOpt.get();
        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setStockSymbol(request.getStockSymbol());

        Favorite savedFavorite = favoriteRepository.save(favorite);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedFavorite);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Favorite>> getFavoritesByUser(@PathVariable("userId") Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            List<Favorite> favorites = favoriteRepository.findByUser(userOpt.get());
            return ResponseEntity.ok(favorites);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @DeleteMapping("/delete/{userId}/{stockSymbol}")
    public ResponseEntity<?> removeFavorite(@PathVariable("userId") Long userId,
                                            @PathVariable("stockSymbol") String stockSymbol) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        User user = userOpt.get();

        Optional<Favorite> favoriteOpt = favoriteRepository.findByUserAndStockSymbol(user, stockSymbol);
        if (favoriteOpt.isPresent()) {
            favoriteRepository.delete(favoriteOpt.get());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Favorite not found");
    }



}

class FavoriteRequest {
    private Long userId;
    private String stockSymbol;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getStockSymbol() { return stockSymbol; }
    public void setStockSymbol(String stockSymbol) { this.stockSymbol = stockSymbol; }
}
