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
    @Column(name = "member_id")
    private Long memberId;

    @Column(name = "id", unique = true, nullable = false)
    private String id;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "name")
    private String name;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "phone", unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false)
    private MemberRole role;

    @Column(name = "reg_no")
    private String regNo;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;



    //Bookmarks 테이블
	@OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
	private List<Bookmarks> bookmarksList;
    
    //Member_address 테이블
	@OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
	private List<MemberAddress> memberAddressList;

    //Review 테이블
	@OneToOne(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
	private Review review;
    
    //Article 테이블
	// @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
	// private List<Article> articleList;
    
    //Cart 테이블
	@OneToOne(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
	private Cart cart;

    //Orders 테이블
	@OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
	private List<Orders> ordersList;
    
    //Payment 테이블
	// @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
	// private List<Payment> paymentList;
    
}