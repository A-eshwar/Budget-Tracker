package com.smartai.budgettracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.Map;
import java.util.List;

@Service
public class MLServiceClient {

    private final WebClient webClient;

    public MLServiceClient(WebClient.Builder webClientBuilder, @Value("${ml.service.url}") String mlServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(mlServiceUrl).build();
    }

    public Mono<Map> predictExpense(Long userId, int month, int categoryId) {
        return webClient.post()
                .uri("/predict-expense")
                .bodyValue(Map.of("user_id", userId, "month", month, "category_id", categoryId))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> detectAnomaly(Double amount, int month, int dayOfWeek) {
        return webClient.post()
                .uri("/detect-anomaly")
                .bodyValue(Map.of("amount", amount, "month", month, "day_of_week", dayOfWeek))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getHealthScore(Long userId, Double totalAmount) {
        return webClient.post()
                .uri("/health-score")
                .bodyValue(Map.of("user_id", userId, "amount", totalAmount))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getSavingsEfficiency(Long userId, Double totalAmount) {
        return webClient.post()
                .uri("/savings-efficiency")
                .bodyValue(Map.of("user_id", userId, "amount", totalAmount))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getRecommendations(Long userId, int month, int categoryId, String categoryName) {
        return webClient.post()
                .uri("/recommendations")
                .bodyValue(Map.of("user_id", userId, "month", month, "category_id", categoryId, "category_name", categoryName))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> checkOverspending(Long userId, Double totalAmount) {
        return webClient.post()
                .uri("/overspending-alert")
                .bodyValue(Map.of("user_id", userId, "amount", totalAmount))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> trainModels(List<Map<String, Object>> transactions) {
        return webClient.post()
                .uri("/train")
                .bodyValue(transactions)
                .retrieve()
                .bodyToMono(Map.class);
    }
}
