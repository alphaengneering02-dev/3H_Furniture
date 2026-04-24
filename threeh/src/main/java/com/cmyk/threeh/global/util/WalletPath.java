package com.cmyk.threeh.global.util;

import java.io.File;

public class WalletPath {


     public static String getWalletPaht(){



        String finalPath = null;

         // 1. 각자 컴퓨터의 지갑 위치를 담을 리스트 
        String[] possiblePaths = {
            "D:/Wallet_swDB"
        };


        try {
        

        for (String path : possiblePaths) {
            File file = new File(path);
            if (file.exists() && file.isDirectory()) {
                finalPath = file.getAbsolutePath().replace("\\", "/");
                break;
            }
        }

        if (finalPath != null) {
            // 오라클 속성 설정
            System.setProperty("oracle.net.tns_admin", finalPath);
            System.setProperty("wallet.path", finalPath);
            
            System.out.println("✅ 지갑 경로 외부 설정 완료: " + finalPath);
        } else {
            System.err.println("❌ 에러: 지정된 외부 경로 어디에도 지갑 폴더가 없습니다.");
        }

        } catch (Exception e) {
            System.err.println("❌ 에러 발생: " + e.getMessage());
        }

        return finalPath;
    }
    
}
