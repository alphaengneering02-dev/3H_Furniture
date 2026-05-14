/* 로그인 실패 대응 로직 */
package com.cmyk.threeh.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class LoginFailHandler implements AuthenticationFailureHandler {

    // 자바 객체를 JSON 문자열로 변환해주는 도구
    private final ObjectMapper objectMapper = new ObjectMapper();


	@Override
	public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
		
        String errorMessage = "알 수 없는 에러가 발생했습니다.";
		
		if (exception instanceof AuthenticationServiceException) {
                  errorMessage = "DB와의 연결에 실패했습니다.";

            } else if (exception instanceof UsernameNotFoundException) {
			errorMessage = "존재하지 않는 사용자입니다.";
		
		} else if(exception instanceof BadCredentialsException) {
			errorMessage = "아이디 또는 비밀번호가 틀립니다.";
			
		} else if(exception instanceof LockedException) {
                  errorMessage = "잠긴 계정입니다.";
			
		} else if(exception instanceof DisabledException) {
                  errorMessage = "비활성화된 계정입니다.";
			
		} else if(exception instanceof AccountExpiredException) {
                  errorMessage = "만료된 계정입니다.";
			
		} else if(exception instanceof CredentialsExpiredException) {
                  errorMessage = "비밀번호가 만료되었습니다.";
		}


        // 1. React가 에러로 인식하도록 HTTP 상태 코드를 401(Unauthorized)로 설정
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        
        // 2. 응답 데이터 형식을 JSON으로 설정 및 한글 깨짐 방지
        response.setContentType("application/json;charset=UTF-8");

        // 3. React로 보낼 JSON 데이터 만들기
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("status", false);
        responseData.put("message", errorMessage);

        // 4. JSON 문자열로 변환하여 응답 보내기
        response.getWriter().write(objectMapper.writeValueAsString(responseData));  //Map 객체(responseData) --> json 문자열(response)


	}
    
}
