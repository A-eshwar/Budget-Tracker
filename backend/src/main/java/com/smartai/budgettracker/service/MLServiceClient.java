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

    public Mono<Map> executeMLPost(String uri, Map<String, Object> payload) {
        return webClient.post()
                .uri(uri)
                .bodyValue(payload)
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
