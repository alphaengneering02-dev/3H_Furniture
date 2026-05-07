//<Spring Security 설정파일>
package com.cmyk.threeh.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.service.MemberSecurityService;

import lombok.RequiredArgsConstructor;

@Profile("!test")
@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)   //로그아웃 상태면, login_form으로 이동시킴
public class SecurityConfig {

	private final MemberSecurityService memberSecurityService;



	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

		http
		// 인가(접근 권한) 설정
		.csrf().disable()

		.authorizeRequests()
			.antMatchers("/admin/**").hasRole("ADMIN")
            .antMatchers("/api/v1/**").hasRole("USER")  ///api/v1로 시작하는 모든 API 요청은 ROLE_USER (일반 고객)만 접속 가능
            .antMatchers("/**").permitAll()  // 모든 인증되지 않은 접속 요청을 허락함
		.and()

		// 커스텀 로그인 페이지 설정
		.formLogin()
			.loginPage("/member/login")  // 1. 우리가 만든 로그인 페이지 컨트롤러 주소
			.loginProcessingUrl("/member/login") // 2. <form action="/member/login">과 일치시켜야 함 (POST 요청을 가로챔)
			.defaultSuccessUrl("/", true) // 3. 성공 시 이동할 주소 (메인 페이지)                
			.permitAll()
		.and()  // >> 로그인 성공 시, Cookie에 정보가 저장됨

        // OAuth2 로그인 설정
        .oauth2Login()
            .defaultSuccessUrl("/")
		    .userInfoEndpoint()
                .userService(memberSecurityService)
            .and()
        .and()


		// 로그아웃 설정
		.logout()
			.logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
			.logoutSuccessUrl("/")
			.invalidateHttpSession(true)
			.deleteCookies("JSESSIONID")
		;
		
		return http.build();
		
	}
	
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	
    //spring security 인증 관리자 (DB 비교+로그인 처리)
	@Bean
	public AuthenticationManager authenticationManager(
			AuthenticationConfiguration authenticationConfiguration) throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}
	

}
