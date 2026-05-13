//<Spring Security 설정파일>
package com.cmyk.threeh.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.service.LoginFailHandler;
import com.cmyk.threeh.service.MemberSecurityService;

import lombok.RequiredArgsConstructor;

@Profile("!test")
@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
//@EnableMethodSecurity(prePostEnabled = true)   //로그아웃 상태면, login_form으로 이동시킴
public class SecurityConfig {

	private final MemberSecurityService memberSecurityService;
	private final LoginFailHandler loginFailHandler;  //로그인 에러 핸들러 주입



	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

		http
		.cors().and()  // CORS 설정 활성화

		.csrf().disable()  // 인가(접근 권한) 설정

		.authorizeRequests()
			.antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
			.antMatchers("/admin/**").permitAll()  //.antMatchers("/admin/**").hasRole("ADMIN")
			.antMatchers("/itemImgs/**").permitAll()
			.antMatchers("/upload/**").permitAll()
            //.antMatchers("/api/v1/**").hasRole("USER")  ///api/v1로 시작하는 모든 API 요청은 ROLE_USER (일반 고객)만 접속 가능
            .antMatchers("/**").permitAll()  // 모든 인증되지 않은 접속 요청을 허락함
		.and()


		//[추가] 인증되지 않은 사용자가 접근했을 때, 리다이렉트 대신 401 에러(JSON)를 반환하도록 설정
		.exceptionHandling()
			.authenticationEntryPoint((request, response, authException) -> {
				response.setStatus(HttpStatus.UNAUTHORIZED.value()); // 401 상태 코드
				response.setContentType("application/json;charset=UTF-8");
				response.getWriter().write("{"
					+ "\"status\": false,"
					+ "\"message\": \"로그인이 필요한 서비스입니다.\""
					+ "}");
			})
		.and()


		// 커스텀 로그인 페이지 설정
		.formLogin()
			// React가 로그인 데이터를 POST로 보낼 주소 (Security가 가로챕니다!)
			.loginProcessingUrl("/api/member/login")  //"/api/v1/login"
			.usernameParameter("id") // 리액트에서 보내는 필드명과 일치시킴
    		.passwordParameter("password")

			// .defaultSuccessUrl("/", true) // 3. 성공 시 이동할 주소 (로그인 컨트롤러)  
			
			

			// 2. 로그인 성공 시 실행될 동작 (JSON 반환)
			.successHandler((request, response, authentication) -> {
				response.setStatus(HttpStatus.OK.value()); // 200 상태 코드
				response.setContentType("application/json;charset=UTF-8");  //"React에게 보낼 응답은 HTML이 아니라 JSON 형식의 데이터이고, UTF-8로 인코딩함"
				response.getWriter().write("{"   //JSON 데이터를 문자열로 직접 작성 (res.data로 호출함)
				+ "\"status\": true,"
				+ "\"message\": \"로그인에 성공하였습니다.\""
				+ "\"id\":" + authentication.getName()
				+ "}");
			})
			
			// 3. 로그인 실패 시 실행될 동작 (JSON 반환)
			.failureHandler(loginFailHandler)  //에러 처리 핸들러 객체를 넣어줌


			.permitAll()
		.and()  // >> 로그인 성공 시, Cookie에 정보가 저장됨

        // OAuth2 로그인 설정
        .oauth2Login()
		    .userInfoEndpoint()
                .userService(memberSecurityService)
            .and()

			// 2. 로그인 성공 시 실행될 동작 (JSON 반환 대신 프론트엔드(React)로 리다이렉트)
            .successHandler((request, response, authentication) -> {
				//인증 객체에서 OAuth2User를 꺼냅니다.
				OAuth2User oauth2User = (OAuth2User)authentication.getPrincipal();

				//OAuth2User에서 진짜 DB ID를 추출합니다.
				String id = oauth2User.getAttribute("db_id");
				
                //추출한 DB ID를 프론트엔드로 넘겨줍니다.(OAuth2Success.js 컴포넌트)
                response.sendRedirect("http://localhost:3000/oauth/success?id=" + id);
            })
			
			// 3. 로그인 실패 시 실행될 동작 (JSON 반환)
			.failureHandler(loginFailHandler)  //에러 처리 핸들러 객체를 넣어줌
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
