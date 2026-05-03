package com.cmyk.threeh.controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import javax.validation.Valid;

import org.aspectj.weaver.patterns.TypePatternQuestions.Question;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.ModelAndView;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;
import com.cmyk.threeh.dto.MemberDTO;
import com.cmyk.threeh.form.LoginForm;
import com.cmyk.threeh.form.SignupUpdateForm;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.service.MemberService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberContoller {

    private final MemberService memberService;

    
    //로그인
    @GetMapping("/login")
    public String login(LoginForm loginForm) {
        // return "forward:/login.js";
        return "Test";
    }

    //로그인 처리(POST): spring security가 자동으로 수행하므로, 따로 맵핑할 필요가 없다.
    @PostMapping("/login")
	public ResponseEntity<?> login(@Valid @RequestBody LoginForm loginForm, BindingResult bindingResult) {

        //백엔드 - 에러 메세지를 JSON 형태로 반환
		
		//입력값 에러 검사 (@Valid)
        if(bindingResult.hasErrors()) {
            Map<String, String> errorMap = new HashMap<>();  // 발생한 모든 필드 에러를 Map에 담음 (예: {"email": "이메일 형식이 아닙니다"})
            for (FieldError error : bindingResult.getFieldErrors()) {
                errorMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorMap); // 400 상태코드+에러 객체 반환
        }
		
		
		//로그인 실행
		try {
            return ResponseEntity.ok().body("로그인에 성공했습니다."); // 성공 응답
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다(로그인 실패).");
		}
		
	}


    //로그아웃 처리(GET): spring security가 자동으로 수행하므로, 따로 맵핑할 필요가 없다.

    
    //회원가입
    @GetMapping("/signup")
    public String signup(SignupUpdateForm suform) {
        return "forward:/signup.js";
    }


    @PostMapping("/signup")
	public ResponseEntity<?> signup(@Valid @RequestBody SignupUpdateForm suform, BindingResult bindingResult) {

        //백엔드 - 에러 메세지를 JSON 형태로 반환
		
		//입력값 에러 검사 (@Valid)
        if(bindingResult.hasErrors()) {
            Map<String, String> errorMap = new HashMap<>();  // 발생한 모든 필드 에러를 Map에 담음 (예: {"email": "이메일 형식이 아닙니다"})
            for (FieldError error : bindingResult.getFieldErrors()) {  //필드마다 에러 처리
                errorMap.put(error.getField(), error.getDefaultMessage());  //필드명, 에러 메세지
            }
            return ResponseEntity.badRequest().body(errorMap); // 400 상태코드+에러 객체 반환
        }
		
		
		//비밀번호 불일치 검사
        if(!suform.getPassword1().equals(suform.getPassword2())) {
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("PASSWORD_NOT_SAME", "비밀번호가 일치하지 않습니다.");
            return ResponseEntity.badRequest().body(errorMap);
        }
		
		
		//회원가입 실행
		try {
			memberService.create(suform);
            return ResponseEntity.ok().body("회원가입이 완료되었습니다."); // 성공 응답
		} catch (DataIntegrityViolationException e) {  //데이터 무결성 제약조건 위반
			Map<String, String> errorMap = new HashMap<>();
            errorMap.put("MEMBER_FOUND", "이미 존재하는 회원입니다.");
            return ResponseEntity.badRequest().body(errorMap);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다(회원가입 실패).");
		}
		
	}

    

    //회원 조회(가져오기)
    @GetMapping("/info/{id}")
    public ResponseEntity<?> getMember(Model model, @PathVariable("id") String id){

        try {
			Member member = memberService.getUser(id);
            MemberDTO dto = new MemberDTO();

            //Member 엔티티 ---> Member dto
            dto.setMemberId(member.getMemberId());
            dto.setId(member.getId());
            dto.setPassword(member.getPassword());
            dto.setName(member.getName());
            dto.setEmail(member.getEmail());
            dto.setPhone(member.getPhone());
            dto.setRole(member.getRole());
            dto.setRegNo(member.getRegNo());
            dto.setCreatedAt(member.getCreatedAt());
            dto.setUpdatedAt(member.getUpdatedAt());

            model.addAttribute("member", dto);
            return ResponseEntity.ok().body("회원정보가 조회되었습니다"); // 성공 응답
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다(회원조회 실패).");
		}

    }


    //회원수정
    @PreAuthorize("isAuthenticated")
    @GetMapping("/update/{id}")
    public ResponseEntity<?> update(Model model, SignupUpdateForm suform, @PathVariable("id") String id, Principal principal) {

        try {
            Member member = memberService.getUser(id);
            
            //현재 로그인한 회원과 수정할 회원이 불일치할 경우
            if(!member.getId() .equals(principal.getName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "회원정보가 일치하지 않습니다.");
                // throw new CustomException(ErrorCode.);
            }
            
            
            //수정할 회원정보를 폼에 채워서 보냄
            suform.setMemberId(member.getMemberId());  //readOnly
            suform.setId(member.getId());
            suform.setPassword1(member.getPassword());
            suform.setName(member.getName());
            suform.setEmail(member.getEmail());
            suform.setPhone(member.getPhone());
            suform.setRole(member.getRole());  //readOnly
            suform.setRegNo(member.getRegNo());
            suform.setCreatedAt(member.getCreatedAt());  //readOnly
            suform.setUpdatedAt(member.getUpdatedAt());  //readOnly
        
            model.addAttribute("suform", suform);
            return ResponseEntity.ok().body("회원정보가 조회되었습니다"); // 성공 응답
        } catch (Exception e) {
			return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다(회원조회 실패).");
		}

    }



    @PostMapping("/update/{id}")
    public ResponseEntity<?> update(@Valid @RequestBody SignupUpdateForm suform, BindingResult bindingResult) {

        //백엔드 - 에러 메세지를 JSON 형태로 반환
		
		//입력값 에러 검사 (@Valid)
        if(bindingResult.hasErrors()) {
            Map<String, String> errorMap = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errorMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorMap);
        }
		

		//비밀번호 불일치 검사
        if(!suform.getPassword1().equals(suform.getPassword2())) {
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("PASSWORD_NOT_SAME", "비밀번호가 일치하지 않습니다.");
            return ResponseEntity.badRequest().body(errorMap);
        }
		
		
		//회원수정 실행
		try {
			memberService.update(null, suform);
            return ResponseEntity.ok().body("회원정보 수정이 완료되었습니다.");
        //데이터 무결성 제약조건 X
        } catch (DataIntegrityViolationException e) {  //데이터 무결성 제약조건 위반
			Map<String, String> errorMap = new HashMap<>();
            errorMap.put("MEMBER_FOUND", "이미 존재하는 회원입니다.");
            return ResponseEntity.badRequest().body(errorMap);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다(회원가입 실패).");
		}
		
	}



    //회원삭제
    @PreAuthorize("isAuthenticated")
    @DeleteMapping("/del/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable("id") String id){

		try {
			memberService.delete(id);
            return ResponseEntity.ok().body("회원정보 삭제가 완료되었습니다.");
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다(회원삭제 실패).");
		}
        
    }
    


    // ModelAndView mav = new ModelAndView();
    // mav.setViewName();
    // return mav;


}
