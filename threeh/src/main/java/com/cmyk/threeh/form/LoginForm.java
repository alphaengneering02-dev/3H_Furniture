package com.cmyk.threeh.form;

import com.cmyk.threeh.enums.MemberRole;
import java.time.LocalDateTime;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class LoginForm {

    
    @Size(min = 3, max = 30, message = "아이디의 길이가 맞지 않습니다.")
	@NotBlank(message = "아이디는 필수항목입니다.")
    private String id;

    @Size(min = 3, max = 30, message = "비밀번호의 길이가 맞지 않습니다.")
	@NotBlank(message = "비밀번호는 필수항목입니다.")
    private String password;

}
