package com.example.demo.DTO;

public record QueryRequest(
    String domain_tag, 
    String user_input, 
    String language
) {}