//<사용자 정보 entity>
package com.cmyk.threeh.domain;

import java.time.LocalDateTime;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

import com.cmyk.threeh.enums.MemberRole;

import lombok.Data;


@Entity
@Data
public class Member {
    
    @Id  //Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;

    @Column(unique = true, nullable = false)
    private String id;

    @Column(nullable = false)
    private String password;

    private String name;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
	@Column(nullable = false)
    private MemberRole role;

    private String regNo;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;



    //Bookmarks 테이블
	@OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
	private List<Bookmarks> bookmarksList;

    /* 
    * 각각에 해당하는 Entity를 만든 후, 주석을 풀어주세요. */
    
    //Member_address 테이블
	@OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
	private List<MemberAddress> memberAddressList;

    //Review 테이블
	@OneToOne(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
	private Review review;
    
    //Article 테이블
	// @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
	// private List<Article> articleList;
    
    //Cart 테이블
	@OneToOne(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
	private Cart cart;

    //Orders 테이블
	@OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
	private List<Orders> ordersList;
    
    //Payment 테이블
	// @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
	// private List<Payment> paymentList;
    


}