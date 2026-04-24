package com.cmyk.threeh;



import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;


import com.cmyk.threeh.global.util.WalletPath;

//user 비번 뚫는 설정
@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })

public class ThreehApplication {

	public static void main(String[] args) {

        WalletPath.getWalletPaht();
		new SpringApplicationBuilder(ThreehApplication.class)
        .properties(
            "spring.datasource.url=jdbc:oracle:thin:@db_name_high?TNS_ADMIN=D:/Wallet_swDB"
        )
        .run(args);


	}

}
