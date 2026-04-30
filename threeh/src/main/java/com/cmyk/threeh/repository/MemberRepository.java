//데이터 흐름: Repository -> Service -> Controller
package com.cmyk.threeh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Member;


public interface MemberRepository extends JpaRepository<Member, Long> {

    //회원정보 가져오기
    Optional<Member> findById(String id);  //로그인 아이디(String)로 회원정보를 가져옴
    Optional<Member> findByEmail(String email);  //이메일


    //중복체크
    boolean existsById(String id);  //로그인 아이디의 존재 여부를 확인함
    boolean existsByEmail(String email);  //이메일의 존재 여부
    boolean existsByPhone(String phone);  //전화번호 존재 여부
    boolean existsByRegNo(String regNo);  //주민등록번호 존재 여부

    //아이디 찾기
    Optional<Member> findByNameAndPhone(String name, String phone);
    Optional<Member> findByNameAndEmail(String name, String email);

    //spring security의 영향을 받음
    
}