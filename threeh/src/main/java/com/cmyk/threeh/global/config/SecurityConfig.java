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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
		.cors().and()  // CORS 설정 활성화

		.csrf().disable()  // 인가(접근 권한) 설정

		.authorizeRequests()
			.antMatchers("/admin/**").hasRole("ADMIN")
            .antMatchers("/api/v1/**").hasRole("USER")  ///api/v1로 시작하는 모든 API 요청은 ROLE_USER (일반 고객)만 접속 가능
            .antMatchers("/**").permitAll()  // 모든 인증되지 않은 접속 요청을 허락함
		.and()

		// 커스텀 로그인 페이지 설정
		.formLogin()
			.loginPage("/member/login")  // 1. 우리가 만든 로그인 페이지 컨트롤러 주소
			.usernameParameter("id") // 리액트에서 보내는 필드명과 일치시킴
    		.passwordParameter("password")
			.loginProcessingUrl("/member/login") // 2. <form action="/member/login">과 일치시켜야 함 (POST 요청을 가로챔)
			.defaultSuccessUrl("/", true) // 3. 성공 시 이동할 주소 (로그인 컨트롤러)                
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
			.logoutRequestMatcher(new AntPathRequestMatcher("/member/logout"))
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



	// 구체적인 CORS 설정 빈 추가
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		
		configuration.addAllowedOrigin("http://localhost:3000"); // 리액트 주소 허용
		configuration.addAllowedHeader("*"); // 모든 헤더 허용
		configuration.addAllowedMethod("*"); // GET, POST, PUT, DELETE 모두 허용
		configuration.setAllowCredentials(true); // 쿠키/인증 정보 포함 허용

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

}
