package com.cmyk.threeh.controller;

import com.cmyk.threeh.repository.MemberRepository;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.MemberDTO;
import com.cmyk.threeh.form.SignupUpdateForm;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.global.util.GetLoginId;
import com.cmyk.threeh.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")  //프론트엔드(3000번 포트)의 접근을 허락함
public class MemberController {

    private final MemberRepository memberRepository;
    private final MemberService memberService;
    private final HttpSession httpSession;
    private final PasswordEncoder passwordEncoder;  //비밀번호 암호화


    // (+) 에러 코드에 따라, 리액트의 어떤 필드에 에러를 보여줄지 매핑하는 유틸 메서드
    private String determineField(ErrorCode errorCode) {
        switch (errorCode) {
            case MEMBER_FOUND: return "id";
            case PASSWORD_NOT_SAME: return "password";
            case EMAIL_IS_EXIST: return "email";
            case PHONE_IS_EXIST: return "phone";
            case REGNO_IS_EXIST: return "regNo";
            case INPUT_NOT_CORRECT: return "others";
            case SOME_COLUMN_IS_NULL: return "others";
            
            default: return "global";
        }
    }

    
    //로그인(POST), 로그아웃 처리(GET): spring security가 자동으로 수행하므로, 따로 맵핑할 필요가 없다.

    

    //회원가입
    @PostMapping("/signup")
	public ResponseEntity<?> signup(@Valid @RequestBody SignupUpdateForm suform, BindingResult bindingResult) {

        //백엔드 - 에러 메세지를 JSON 형태로 반환
        Map<String, String> errorMap = new HashMap<>();  // 발생한 모든 필드 에러를 Map에 담음 (예: {"email": "이메일 형식이 아닙니다"})
        String field;
        String message;

		
		//입력값 에러 검사 (@Valid)
        if(bindingResult.hasErrors()) {
            for (FieldError error : bindingResult.getFieldErrors()) {  //필드마다 에러 처리
                errorMap.put(error.getField(), error.getDefaultMessage());  //필드명, 에러 메세지
            }
            return ResponseEntity.badRequest().body(errorMap); // 400 상태코드+에러 객체 반환
        }
		
		
		//비밀번호 불일치 검사
        if(!suform.getPassword1().equals(suform.getPassword2())) {
            field = "password2";
            message = ErrorCode.PASSWORD_NOT_SAME.getMessage();
            errorMap.put(field, message);
            return ResponseEntity.badRequest().body(errorMap);
        }
		
		
		//회원가입 실행
		try {
			memberService.create(suform);
            return ResponseEntity.ok().body(suform); // 성공 응답

		} catch (DataIntegrityViolationException e) {  //데이터 무결성 제약조건 위반
            field = "id";
            message = ErrorCode.MEMBER_FOUND.getMessage();
            errorMap.put(field, message);
            return ResponseEntity.badRequest().body(errorMap);

        } catch (CustomException e) {  //중복 에러 등 커스텀 예외 처리
            // 에러 코드에 따라 적절한 메시지를 맵에 담아 보냄 (예: ErrorCode.MEMBER_FOUND -> "id", "이미 존재하는 아이디입니다.")
            field = determineField(e.getErrorCode());
            message = e.getErrorCode().getMessage();
            errorMap.put(field, message);
            return ResponseEntity.badRequest().body(errorMap);
            
        } catch (Exception e) {
            field = "global";
            message = "서버 오류가 발생했습니다(회원가입 실패).";
            errorMap.put(field, message);
			return ResponseEntity.internalServerError().body(errorMap);
		}
		
	}

    

    //회원 조회(가져오기)
    @GetMapping("/{id}")
    public MemberDTO getMember(@PathVariable("id") String id){

        //Member 엔티티 ---> Member dto
        Member entity = memberService.getUser(id);
        MemberDTO dto = new MemberDTO();

        dto.setMemberId(entity.getMemberId());
        dto.setId(entity.getId());
        dto.setPassword(entity.getPassword());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setRole(entity.getRole());
        dto.setRegNo(entity.getRegNo());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;

    }


    //회원리스트 조회
    @GetMapping("/list")
    public List<MemberDTO> getMemberList(){

        //List<Member 엔티티> ---> List<Member dto>
        List<Member> entityList = memberService.getUserList();
        List<MemberDTO> dtoList = new ArrayList<MemberDTO>();

        for(Member entity : entityList) {
            MemberDTO dto = new MemberDTO();

            dto.setMemberId(entity.getMemberId());
            dto.setId(entity.getId());
            dto.setPassword(entity.getPassword());
            dto.setName(entity.getName());
            dto.setEmail(entity.getEmail());
            dto.setPhone(entity.getPhone());
            dto.setRole(entity.getRole());
            dto.setRegNo(entity.getRegNo());
            dto.setCreatedAt(entity.getCreatedAt());
            dto.setUpdatedAt(entity.getUpdatedAt());

            dtoList.add(dto);
        }

        return dtoList;

    }


    //태양 orders에서 멤버에서 연락처 받아오는 용

    @GetMapping("/seq/{memberId}")
public MemberDTO getMemberBySeq(@PathVariable("memberId") Long memberId) {

    // 1. memberService에 숫자 PK로 Member를 찾는 메서드가 없다면 아래처럼 repository를 활용하거나,
    //    memberService에 findByMemberId(Long id)를 만들어 호출하세요.
    Member entity = memberRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원 번호입니다: " + memberId));
    
    MemberDTO dto = new MemberDTO();

    dto.setMemberId(entity.getMemberId());
    dto.setId(entity.getId());
    dto.setName(entity.getName());
    dto.setEmail(entity.getEmail());
    dto.setPhone(entity.getPhone());
    dto.setRole(entity.getRole());
    dto.setRegNo(entity.getRegNo());
    dto.setCreatedAt(entity.getCreatedAt());
    dto.setUpdatedAt(entity.getUpdatedAt());

    return dto;
}


    //회원수정
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable("id") String id, Principal principal) {

        Member member = memberService.getUser(id);
        
        //현재 로그인한 회원과 수정할 회원이 불일치할 경우
        String loginId = GetLoginId.getloginId(principal);

        if(loginId == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        if(!member.getId() .equals(loginId)) {
            throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
            // throw new CustomException(ErrorCode.);
        }
        
        
        //수정할 회원정보를 폼에 채워서 보냄
        SignupUpdateForm suform = new SignupUpdateForm();

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
    
        return ResponseEntity.ok(suform);  // 수정 전의 회원정보를 JSON으로 반환

    }


    @PreAuthorize("isAuthenticated()")
    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable("id") String id, @Valid @RequestBody SignupUpdateForm suform, BindingResult bindingResult, Principal principal) {

        String loginId = GetLoginId.getloginId(principal);

        if(loginId == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        Member member = memberService.getUser(loginId);

        //백엔드 - 에러 메세지를 JSON 형태로 반환
        Map<String, String> errorMap = new HashMap<>();
        String field;
        String message;

		
		//입력값 에러 검사 (@Valid)
        if(bindingResult.hasErrors()) {
            for (FieldError error : bindingResult.getFieldErrors()) {
                errorMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorMap);
        }
		

		//비밀번호 불일치 검사
        if(!suform.getPassword1().equals(suform.getPassword2())) {
            field = "password2";
            message = ErrorCode.PASSWORD_NOT_SAME.getMessage();
            errorMap.put(field, message);
            return ResponseEntity.badRequest().body(errorMap);
        }
		
		
		//회원수정 실행
		try {
			memberService.update(member, suform);
            return ResponseEntity.ok().body(suform);  //수정 후의 회원정보
        //데이터 무결성 제약조건 X
		} catch (Exception e) {
			field = "global";
            message = "서버 오류가 발생했습니다(회원수정 실패).";
            errorMap.put(field, message);
			return ResponseEntity.internalServerError().body(errorMap);
		}
		
	}



    //회원삭제
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/delete/{id}")
    public void deleteItem(@PathVariable("id") String id){

		memberService.delete(id);
        
    }



    //아이디 찾기 - 이름, 전화번호 또는 이메일
    @GetMapping("/findUserId/{name}/{phoneORemail}")  //경로 형식: /member/findUserId/이름/연락처
    public ResponseEntity<?> findUserId(@PathVariable("name") String name, @PathVariable("phoneORemail") String phoneORemail){

        List<Member> list = memberService.findUserByName(name);
        String id = "";

        //전화번호인지, 이메일인지 구분
		String phone="";
		String email="";

        if(phoneORemail.indexOf("@") == -1) {  //전화번호
			phone = phoneORemail;
		} else {  //이메일
			email = phoneORemail;
		}

        //백엔드 - 에러 메세지를 JSON 형태로 반환
        Map<String, String> errorMap = new HashMap<>();

        boolean isMemberFound = false;


        //1. null 검사
		if(name.isEmpty()) {
            errorMap.put("name", "이름을 입력해주세요!");
            return ResponseEntity.badRequest().body(errorMap);
		} else if(phoneORemail.isEmpty()) {
            errorMap.put("phoneORemail", "전화번호 또는 이메일을 입력해주세요!");
            return ResponseEntity.badRequest().body(errorMap);
		}

        
        //2. 정합성 검사
        //존재하지 않는 이름(name 정합성)
        if(list.size() <= 0) {
            errorMap.put("name", ErrorCode.MEMBER_NOT_FOUND.getMessage());
            return ResponseEntity.badRequest().body(errorMap);
        }


        //전화번호 또는 이메일이 틀렸을 경우(phone, email 정합성)
        if(!phone.isEmpty()) {  //전화번호
            for (Member member : list) {
                if(member.getPhone().equals(phone)) {
                    isMemberFound = true; //일치하는 사람을 찾음
                    break;
                }
            }

            if (!isMemberFound) { //일치하는 사람이 없으면 에러
                errorMap.put("phoneORemail", "전화번호가 일치하지 않습니다.");
                return ResponseEntity.badRequest().body(errorMap);
            }
        } else {  //이메일
            for(Member member : list) {
                if(member.getEmail().equals(email)) {
                    isMemberFound = true;
                    break;
                }

            }

             if (!isMemberFound) { //리스트를 다 돌았는데도 일치하는 사람이 없으면 에러
                errorMap.put("phoneORemail", "이메일이 일치하지 않습니다.");
                return ResponseEntity.badRequest().body(errorMap);
            }
        }


        //3. 아이디 찾기 실행
		try {
			if(!phone.isEmpty()) {  //전화번호로 가져오기
                id = memberService.findUserIdByPhone(name, phone);
            } else {  //이메일로 가져오기
                id = memberService.findUserIdByEmail(name, email);
            }

            return ResponseEntity.ok().body(id);
		} catch (Exception e) {
            errorMap.put("global", "서버 오류가 발생했습니다(아이디 찾기 실패).");
			return ResponseEntity.internalServerError().body(errorMap);
		}

    }


    //비밀번호 재설정 - 아이디, 기존 비번, 새로운 비번
    @GetMapping("/changeUserPassword/{id}/{oldPassword}/{newPassword}")  //경로 형식: /member/findUserId/아이디/기존 비번&새로운 비번
    public ResponseEntity<?> changeUserPassword(@PathVariable("id") String id, @PathVariable("oldPassword") String oldPassword, @PathVariable("newPassword") String newPassword, Authentication authentication){  //*** Principal 대신 Authentication 사용

        //백엔드 - 에러 메세지를 JSON 형태로 반환
        Map<String, String> errorMap = new HashMap<>();


        // //1. 로그인이 되어있는 상태인지 검사한다. (인증정보 유무)
        // if(authentication == null || !authentication.isAuthenticated()) {
		// 	errorMap.put("global", "로그인이 필요한 서비스입니다.");
        //     return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorMap); // 411 혹은 401 Unauthorized
		// }
		
        //2. 회원가입이 되어있는 상태인지 검사한다. 
		Member member = memberService.getUser(id);
		if(member==null) {
            errorMap.put("name", ErrorCode.MEMBER_NOT_FOUND.getMessage());
            return ResponseEntity.badRequest().body(errorMap);
		}

		//3. 기존 pw가 현재 사용자의 pw와 일치하는지 검사한다.
		if (!passwordEncoder.matches(oldPassword, member.getPassword())) {
			//일치하지 않는다면, 오류를 발생시킨다.
            errorMap.put("oldPassword", ErrorCode.PASSWORD_NOT_SAME.getMessage());
            return ResponseEntity.badRequest().body(errorMap);
		}


        //4. 일치한다면, 비밀번호를 재설정한다.
		try {
			String resultNewPassword = memberService.changeUserPassword(member, oldPassword, newPassword);
            return ResponseEntity.ok().body(resultNewPassword);
		} catch (Exception e) {
            e.printStackTrace();
            errorMap.put("global", "서버 오류가 발생했습니다(비밀번호 재설정 실패).");
			return ResponseEntity.internalServerError().body(errorMap);
		}

    }

}
