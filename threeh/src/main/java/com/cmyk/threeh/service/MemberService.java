package com.cmyk.threeh.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.aspectj.weaver.patterns.TypePatternQuestions.Question;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.MemberDTO;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {
    
	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;  //비밀번호 암호화 
	

	//<계정 관리>
    //회원가입
    public boolean create(MemberDTO dto) {
		
		try {
			Member member = new Member();
		
			member.setId(dto.getId());
			member.setName(dto.getName());
			member.setEmail(dto.getEmail());
			member.setPhone(dto.getPhone());
			member.setRole(MemberRole.USER);  //권한: USER("ROLE_USER", "일반 고객")
			member.setRegNo(dto.getRegNo());
			member.setCreatedAt(LocalDateTime.now());
			//수정일: 회원가입할 때는 null
			
			//Bcrypt 해싱 함수를 사용해서 비밀번호를 암호화
			member.setPassword(passwordEncoder.encode(dto.getPassword()));
			
			memberRepository.save(member);
			return true;
		} catch (Exception e) {
			System.out.println(e.toString());
			return false;
		}
		
	}
	
	
	//회원정보 가져오기
	public Member getUser(String id) {
		
		try {
			Optional<Member> op = memberRepository.findById(id);
		
			if(!op.isPresent()) {
				ErrorCode error = ErrorCode.MEMBER_NOT_FOUND;
				System.out.println(error);
				return null;
			}

			return op.get();
		} catch (Exception e) {
			System.out.println(e.toString());
			return null;
		}
		
	}


	//회원정보 수정
	public boolean update(Member member, MemberDTO dto) {

		try {
			member.setPassword(dto.getPassword());
			member.setName(dto.getName());
			member.setEmail(dto.getEmail());
			member.setPhone(dto.getPhone());
			member.setRegNo(dto.getRegNo());
			member.setUpdatedAt(LocalDateTime.now());

			memberRepository.save(member);
			return true;
		} catch (Exception e) {
			System.out.println(e.toString());
			return false;
		}
		
	}


	//회원 탈퇴
	public boolean delete(String id) {
		
		try {
			Member member = getUser(id);

			memberRepository.delete(member);
			return true;
		} catch (Exception e) {
			System.out.println(e.toString());
			return false;
		}
		
	}


	//=============================================================


	//<계정 찾기>
	//아이디 찾기&비밀번호 찾기
	public String findUserInfo(MemberDTO dto) {
		String id = dto.getId();
		String name = dto.getName();
		String phone = dto.getPhone();
		String email = dto.getEmail();

		Optional<Member> op = Optional.empty();
		Member member = null;
		String result="";
		
		try {
			//아이디 찾기 vs 비밀번호 찾기
			String findWhat = (id==null) ? "findId" : "findPassword";


			switch (findWhat) {
				//1. 아이디 찾기
				case "findId":
					//전화번호 or 이메일로 op 가져오기 (두번째 input)
					if(phone!=null) {
						op = memberRepository.findByNameAndPhone(name, phone);
					} else {
						op = memberRepository.findByNameAndEmail(name, email);
					}

					//op 예외처리
					if(!op.isPresent()) {
						ErrorCode error = ErrorCode.MEMBER_NOT_FOUND;
						System.out.println(error);
						return null;
					}

					//op에서 데이터 추출
					member = op.get();
					result = member.getId();
					break;


				// //2. 비밀번호 찾기  >>> 비밀번호 재설정으로 바꾸기
				// case "findPassword":
				// 	//전화번호 or 이메일로 op 가져오기
				// 	if(phone!=null) {
				// 		op = memberRepository.findByIdAndPhone(id, phone);
				// 	} else {
				// 		op = memberRepository.findByIdAndEmail(id, email);
				// 	}

				// 	//op 예외처리
				// 	if(!op.isPresent()) {
				// 		ErrorCode error = ErrorCode.MEMBER_NOT_FOUND;
				// 		System.out.println(error);
				// 		return null;
				// 	}

				// 	//op에서 데이터 추출
				// 	member = op.get();
				// 	result = member.getPassword();
				// 	//Bcrypt 해싱 함수를 사용해서 비밀번호를 암호화
				// 	passw
				// 	passwordEncoder.decode(member.getPassword());
				// 	// result = ;
				// 	break;
			

				//첫번째 input에 대한 예외처리
				default:
					System.out.println("입력값이 이름 또는 아이디가 아닙니다.");
					break;
			}


			return result;

		} catch (Exception e) {
			System.out.println(e.toString());
			return "";
		}
		
	}

    
}