package com.cmyk.threeh.global.util;

import java.security.Principal;
import java.util.Map;

import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

public class GetLoginId {

    public static String getloginId(Principal principal){


        String loginId = "";
        if (principal == null) {
            return null;
        }

        if(principal instanceof OAuth2AuthenticationToken){
            OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) principal;

            Map<String, Object> attributes = authToken.getPrincipal().getAttributes();

            loginId = String.valueOf(attributes.get("db_id"));

            return loginId;

        }
        else{
            loginId = principal.getName();

            return loginId;
        }

        
    }
    
}
