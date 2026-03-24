package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class LegalQueryController {

    // Helper class to map the incoming JSON
    public static class QueryRequest {
        public String domain_tag;
        public String user_input;
        public String language;
    }

    @PostMapping("/query")
    public ResponseEntity<?> processLegalQuery(@RequestBody QueryRequest request) {
        System.out.println("🚨 Java Server received query from React!");
        
        // TODO: Yahan hum aage chalkar Supabase me data save karne ka code daalenge
        
        System.out.println("🔄 Forwarding to Python AI Microservice...");
        
        // Java is making an HTTP call to your Python server
        RestTemplate restTemplate = new RestTemplate();
        String pythonMicroserviceUrl = "http://localhost:9000/api/v1/query";
        
        try {
            // Send the exact same request to Python
            ResponseEntity<Map> pythonResponse = restTemplate.postForEntity(
                pythonMicroserviceUrl, 
                request, 
                Map.class
            );
            
            System.out.println("✅ Received AI response from Python.");
            
            // Return what Python said straight back to React
            return ResponseEntity.ok(pythonResponse.getBody());
            
        } catch (Exception e) {
            System.out.println("❌ Python connection failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("reply", "⚠️ Error: Java could not reach the Python AI microservice."));
        }
    }
}