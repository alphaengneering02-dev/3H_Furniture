/* 로그인 성공 대응 로직 */
package com.cmyk.threeh.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.SessionMember;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final MemberService memberService;
    // 자바 객체를 JSON 문자열로 변환해주는 도구
    private final ObjectMapper objectMapper;
    //세션 만료시간(초 단위, 30분)
	private final int expiredTime=600;


	@Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        // 1. 공통 세션 처리 (일반 로그인, 소셜 로그인 모두 필요)
        Object principal = authentication.getPrincipal();  
        HttpSession httpSession = request.getSession();
        httpSession.setAttribute("user", principal);
        httpSession.setMaxInactiveInterval(expiredTime);

        System.out.println("[백엔드 Spring session에 올라간 회원정보]\n"
            + "sessindId: " + httpSession.getId() + "\n"
            + "만료시간: " + httpSession.getMaxInactiveInterval() + "\n"
            + "생성시간: " + httpSession.getCreationTime() + "\n"
            + "마지막 접속시간: " + httpSession.getLastAccessedTime()
        );


        // =========================================================================
        // 2. 분기 처리: 소셜 로그인(OAuth2)인 경우 -> 프론트엔드로 리다이렉트
        // =========================================================================
        if (principal instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) principal;
            String db_id = (String) oauth2User.getAttribute("db_id");
            boolean isNewOAuth2User = false;

            // 기존 <-> 신규 가입자 판별 로직 적용
            // Member member = memberService.getLoginUser(authentication);
            // if (member != null && member.getCreatedAt() != null) {
            //     LocalDateTime createdAt = member.getCreatedAt();
            //     LocalDateTime minusOneMinute = LocalDateTime.now().minusMinutes(1);
                
            //     if (createdAt.isAfter(minusOneMinute)) {  
            //         isNewOAuth2User = true;
            //     }
            // }
            Member member = memberService.getUser(db_id);

            if (member != null) {
                System.out.println("===== [신규 소셜 회원 판별 디버깅] =====");
                System.out.println("1. DB에서 가져온 회원 ID: " + db_id);
                System.out.println("2. DB에 저장된 createdAt: " + member.getCreatedAt());
                System.out.println("3. 서버의 현재 시간(now): " + LocalDateTime.now());

                if (member.getCreatedAt() != null) {
                    LocalDateTime createdAt = member.getCreatedAt();
                    LocalDateTime minusOneMinute = LocalDateTime.now().minusMinutes(1);
                    
                    System.out.println("4. 기준 시간(now - 1분): " + minusOneMinute);
                    
                    if (createdAt.isAfter(minusOneMinute)) {  
                        isNewOAuth2User = true;
                        System.out.println("👉 결과: 1분 이내 가입한 신규 회원 맞음! (true)");
                    } else {
                        System.out.println("👉 결과: 가입한 지 1분이 지났거나, 시간대가 다릅니다! (false)");
                    }
                } else {
                    System.out.println("👉 결과: createdAt 값이 null 입니다! (JPA 저장 지연 의심)");
                }
                System.out.println("=========================================");
            }

            if (member != null && member.getCreatedAt() != null) {
                LocalDateTime createdAt = member.getCreatedAt();
                LocalDateTime minusOneMinute = LocalDateTime.now().minusMinutes(1);
                
                if (createdAt.isAfter(minusOneMinute)) {  
                    isNewOAuth2User = true;
                }
            }

            // React(프론트엔드)로 db_id와 신규회원 여부(isNewOAuth2User)를 함께 전달
            response.sendRedirect("http://localhost:3000/oauth/success?id=" + db_id + "&isNewOAuth2User=" + isNewOAuth2User);
            
            //리다이렉트 후, 아래의 JSON 응답 로직이 실행되지 않도록 반드시 return
            return; 
        }


        // =========================================================================
        // 3. 분기 처리: 일반 폼 로그인인 경우 -> JSON 데이터 반환
        // =========================================================================
        String id = authentication.getName();
        String passMessage = "로그인에 성공하였습니다.";

        response.setStatus(HttpStatus.OK.value());
        response.setContentType("application/json;charset=UTF-8");

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("status", true);
        responseData.put("id", id);
        responseData.put("message", passMessage);
        // 일반 로그인이므로 isNewOAuth2User는 무조건 false로 전송
        responseData.put("isNewOAuth2User", false); 

        response.getWriter().write(objectMapper.writeValueAsString(responseData));



        /*
        // 1. 기본 응답 상태 설정
        String passMessage = "로그인에 성공하였습니다.";
        boolean isNewOAuth2User = false;  //신규 가입자 여부 체크용

        
        // 2. Authentication 객체에서 인증된 사용자 정보를 가져옵니다. (authentication 객체 자체가 Principal)
        Object principal = authentication.getPrincipal();  
        String id = authentication.getName();


        // 2. 신규 가입한 OAuth2 회원 여부 검사
        if (id.contains("google_") || id.contains("naver_") || id.contains("kakao_")) {
            Member member = memberService.getLoginUser(authentication);
            
            // Null 안정성 확보
            if (member != null && member.getCreatedAt() != null) {
                LocalDateTime createdAt = member.getCreatedAt();
                LocalDateTime minusOneMinute = LocalDateTime.now().minusMinutes(1);
                
                // 가입한지 1분 이내일 때 메시지 및 상태 변경
                if (createdAt.isAfter(minusOneMinute)) {  
                    passMessage = "소셜 회원가입을 축하합니다. 마이페이지에서 추가 정보를 등록하시겠습니까?";
                    isNewOAuth2User = true;
                }
            }
        }


        // 3. 백엔드 Spring session 처리
        HttpSession httpSession = request.getSession();
        httpSession.setAttribute("user", principal);
        httpSession.setMaxInactiveInterval(expiredTime);

		System.out.println("[백엔드 Spring session에 올라간 회원정보]"  + "\n"
			+ "sessindId: " + httpSession.getId() + "\n"
			+ "만료시간: " + httpSession.getMaxInactiveInterval() + "\n"
			+ "생성시간: " + httpSession.getCreationTime() + "\n"
			+ "마지막 접속시간: " + httpSession.getLastAccessedTime()
		);

        // 4. HTTP 응답 헤더 설정
        response.setStatus(HttpStatus.OK.value());
        response.setContentType("application/json;charset=UTF-8");

        // 5. 최종 응답 데이터(JSON) 조립
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("status", true);
        responseData.put("id", id);
        responseData.put("message", passMessage);
        responseData.put("isNewOAuth2User", isNewOAuth2User); // React에서 if(res.data.isNewUser)로 마이페이지 이동 처리 가능
        

        // 7. JSON 문자열로 변환하여 클라이언트에게 전송(단 한 번만)  ----> React
        response.getWriter().write(objectMapper.writeValueAsString(responseData));  //Map 객체(responseData) --> json 문자열(response)
        */
    }
    
}