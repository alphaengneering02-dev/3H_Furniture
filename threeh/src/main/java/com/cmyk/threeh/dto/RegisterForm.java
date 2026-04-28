//<form을 제약하는 클래스 (제약조건)>

package com.cmyk.threeh.dto;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class RegisterForm {
	
	@NotEmpty(message = "아이디는 필수 항목입니다.")
	@Size(max = 50)
	private String id;
	
	@NotEmpty(message = "비밀번호는 필수 항목입니다.")
	@Size(max = 50)
	private String password;

	@NotEmpty(message = "이름은 필수 항목입니다.")
	@Size(max = 50)
	private String name;

	@NotEmpty(message = "이메일은 필수 항목입니다.")
	@Size(max = 50)
	private String email;

	@NotEmpty(message = "전화번호는 필수 항목입니다.")
	@Size(max = 50)
	private String phone;

	@NotEmpty(message = "주민등록번호는 필수 항목입니다.")
	@Size(max = 50)
	private String regNo;
	
}