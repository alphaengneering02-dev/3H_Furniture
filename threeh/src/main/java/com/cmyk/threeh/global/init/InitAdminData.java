package com.cmyk.threeh.global.init;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.service.AdminsService;

@Configuration
@Profile("dev")  // 개발 환경에서만 실행
public class InitAdminData {

    @Bean
    CommandLineRunner init(AdminsService adminsService) {
        return args -> {

            // admin1 자동 생성
            AdminsDTO dto = new AdminsDTO();
            dto.setAdLoginId("admin1");
            dto.setPassword("admin1");
            dto.setAdminName("임시관리자");

            adminsService.createAdmin(dto);
        };
    }
}