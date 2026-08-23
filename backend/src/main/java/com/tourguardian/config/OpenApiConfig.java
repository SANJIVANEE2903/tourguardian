package com.tourguardian.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("TourGuardian API")
                .version("1.0.0")
                .description("AI-Powered Smart Travel Safety & Assistance Platform API")
                .contact(new Contact()
                    .name("TourGuardian Team")
                    .email("support@tourguardian.com")
                    .url("https://tourguardian.com"))
                .license(new License()
                    .name("MIT")
                    .url("https://opensource.org/licenses/MIT")));
    }
}
