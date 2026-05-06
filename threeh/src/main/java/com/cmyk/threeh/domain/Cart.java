package com.cmyk.threeh.domain;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "cart")
@Getter 
@Setter
@NoArgsConstructor
public class Cart {

    //장바구니 고유 번호 (PK) - 시퀀스 전략 사용
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cart_seq")
    @SequenceGenerator(name = "cart_seq", sequenceName = "CART_SEQ", allocationSize = 1)
    @Column(name = "cart_id")
    private Long cartId;

    //장바구니 소유 회원 - 회원 한 명당 하나의 장바구니만 가지도록 1:1 관계
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    //장바구니에 담긴 상품 목록 - 장바구니 삭제 시 담긴 아이템도 함께 삭제 영속성
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> cartItems = new ArrayList<>();

    //배송지 정보 연동 - 조장님 adress VO 활용
    //장바구니 단계에서 미리 배송지를 설정할 수 있도록 임베디드 타입으로 구성
    //관련된 DB 컬럼들을 하나의 자바 객체로 그룹화 하여 관리하는 방식
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "city", column = @Column(name = "CITY")),
        @AttributeOverride(name = "street", column = @Column(name = "STREET")),
        @AttributeOverride(name = "zipcode", column = @Column(name = "ZIPCODE"))
    })
    private Adress delivAdress;

}
