package com.lawfirm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LawFirmApplication {
    public static void main(String[] args) {
        SpringApplication.run(LawFirmApplication.class, args);
    }
}
