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

    //여러 개의 상품 아이템이 하나의 장바구니에 속함
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false) 
    private Cart cart;

    //한 종류의 상품이 여러 장바구니에 아이템으로 등록
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false) 
    private Item item; 

    @Column(name = "count") //해당 상품을 몇 개 담았는지 수량
    private int count;
}