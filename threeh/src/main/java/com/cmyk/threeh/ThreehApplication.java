package com.cmyk.threeh;



import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;


//user 비번 뚫는 설정
@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })

public class ThreehApplication {

	public static void main(String[] args) {

       SpringApplication.run(ThreehApplication.class, args);


	}

}
