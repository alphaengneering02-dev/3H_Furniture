package com.cmyk.threeh.domain;

import javax.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cart_item") 
@Getter
@Setter
@NoArgsConstructor

public class CartItem {

    //장바구니 아이템 고유 번호 (PK) - 시퀀스 전략 사용
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cart_item_seq")
    @SequenceGenerator(name = "cart_item_seq", sequenceName = "CART_ITEM_SEQ", allocationSize = 1)
    @Column(name = "cart_item_id") 
    private Long cartItemId;

    //소속된 장바구니 - 여러 아이템이 하나의 장바구니에 담기므로 다대일 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false) 
    private Cart cart;

    //담긴 상품 정보 - 여러 아이템 행이 하나의 상품 종류를 가리킬 수 있으므로 다대일 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false) 
    private Item item; 

    //상품 수량 - 해당 상품을 몇 개 담았는지 저장
    @Column(name = "count") 
    private int count;
}