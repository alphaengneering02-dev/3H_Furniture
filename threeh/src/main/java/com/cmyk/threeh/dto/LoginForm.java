//<form을 제약하는 클래스 (제약조건)>

package com.cmyk.threeh.dto;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class LoginForm {
	
	@NotEmpty(message = "아이디는 필수 항목입니다.")
	@Size(max = 50)
	private String id;
	
	@NotEmpty(message = "비밀번호는 필수 항목입니다.")
	@Size(max = 50)
	private String password;
	
}