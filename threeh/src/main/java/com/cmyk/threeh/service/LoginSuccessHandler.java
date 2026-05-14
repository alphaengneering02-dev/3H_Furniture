/* 로그인 성공 대응 로직 */
package com.cmyk.threeh.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.cmyk.threeh.dto.SessionMember;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    // 자바 객체를 JSON 문자열로 변환해주는 도구
    private final ObjectMapper objectMapper;
    //세션 만료시간(초 단위, 기본값 10분)
	private final int expiredTime=600;


	@Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        
        String passMessage = "로그인에 성공하였습니다.";


        // 1. request 객체에서 현재 사용자의 고유한 세션을 가져옵니다. (전역 변수 사용 X)
        HttpSession httpSession = request.getSession();

        // 2. Authentication 객체에서 인증된 사용자 정보를 가져옵니다.
        // (MemberSecurityService에서 return한 UserDetails 객체를 가져옴)
        Object principal = authentication.getPrincipal();

        // 3. 백엔드 Spring session에 사용자 정보를 저장하고 만료 시간을 설정합니다.
        httpSession.setAttribute("user", principal);
        httpSession.setMaxInactiveInterval(expiredTime); // 톰캣이 자동으로 10분 뒤 만료 처리 (활동 시 자동 연장됨)

		System.out.println("[백엔드 Spring session에 올라간 회원정보]"  + "\n"
			+ "sessindId: " + httpSession.getId() + "\n"
			+ "만료시간: " + httpSession.getMaxInactiveInterval() + "\n"
			+ "생성시간: " + httpSession.getCreationTime() + "\n"
			+ "마지막 접속시간: " + httpSession.getLastAccessedTime()
		);

        // 4. React가 성공으로 인식하도록 HTTP 상태 코드를 200(OK)로 설정
        response.setStatus(HttpStatus.OK.value());
        
        // 5. 응답 데이터 형식을 JSON으로 설정 및 한글 깨짐 방지
        response.setContentType("application/json;charset=UTF-8");

        // 6. React로 보낼 JSON 데이터 만들기
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("status", true);
        responseData.put("message", passMessage);
        responseData.put("id", authentication.getName());

        // 7. JSON 문자열로 변환하여 응답 보내기
        response.getWriter().write(objectMapper.writeValueAsString(responseData));  //Map 객체(responseData) --> json 문자열(response)

    }
    
}