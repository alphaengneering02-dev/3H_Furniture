package com.cmyk.threeh.domain;

import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GenerationType;
import javax.persistence.GeneratedValue;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;
import com.cmyk.threeh.enums.ItemSellStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "item")
@NoArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE,generator = "items_seq")
    @SequenceGenerator(name = "items_seq",sequenceName = "ITEMS_SEQ",allocationSize=1)
    @Column(name="item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admins admin;

    @Column(nullable = false,length = 100)
    private String category;

    @Column(nullable = false, length = 255)
    private String itemName;

    @Column(nullable = true, length = 255)
    private String itemDetail;

    @Enumerated(EnumType.STRING)
    @Column( name="item_sell_status", nullable = false, length = 50)
    private ItemSellStatus itemSellStatus = ItemSellStatus.SELL;

    @Column(nullable=true, length =50 )
    private String itemColor;

    @Column(nullable = false)
    private int price;

    @Column(nullable = true)
    private int discountPrice = 0;

    @Column(nullable = false, length = 10)
    private String currency = "KRW";

    @Column(nullable = false)
    private int stock;

    @JsonIgnore
    @OneToMany(mappedBy = "item")
    private List<Bookmarks> bookmarksList;


    //재고 검증 메서드 

    private void validateStock(int stock){
        if (stock < 0 ) {
            throw new IllegalArgumentException("재고는 음수일 수 없습니다.");
        }
    }

    //가격 검증 메서드

    private void validatePrice(int price){

        if(price < 0 ){
            throw new IllegalArgumentException("가격은 음수일 수 없습니다.");
        }

    }

    // 상품 수정 메서드
    public void update(ItemUpdateRequestDTO dto){

     if(dto.getItemName() !=null) this.itemName = dto.getItemName();
     if(dto.getItemDetail() !=null)this.itemDetail = dto.getItemDetail();
     if(dto.getItemColor() !=null)this.itemColor = dto.getItemColor();
     
     if(dto.getPrice() !=null){
        validatePrice(dto.getPrice());
        this.price =dto.getPrice();
     }

     if(dto.getDiscountPrice() !=null){
        validateDiscount(dto.getDiscountPrice());
        this.discountPrice = dto.getDiscountPrice();

     }

     if(dto.getStock() !=null){
        validateStock(dto.getStock());
        this.stock = dto.getStock();
     }
    
    }

    //수정 검증 로직
    private void validate(){
        validatePrice(this.price);
        validateStock(this.stock);
        validateDiscount(this.discountPrice);
    }

    //재고 감소 메서드(10개중 3개 주문되면 잔여 7개)

    public void removeStock(int quantity){

        if(quantity <=0){
            throw new IllegalArgumentException("수량은 1개 이상이어야 합니다.");
        }
        if(this.stock<quantity){
            throw new IllegalArgumentException("재고가 부족합니다.");
        }
        this.stock -=quantity;
    }



    //재고 증가 메서드(환불/입고시 사용할 메서드)

    public void addStock(int quantity){

        if(quantity <=0){
            throw new IllegalArgumentException("수량은 1개 이상이어야 합니다.");
        }
        this.stock += quantity;

    }

    //판매 상태 변경 메서드(판매중인지 아닌지 확인용)
    //--사용예시:item.changeSellStatus(ItemSellStatus.SOLD_OUT);

    public void changeSellStatus(ItemSellStatus status){

        if(status == null){
            throw new IllegalArgumentException("판매 상태를 선택해주세요.");
        }
        this.itemSellStatus = status;
    }

    //할인 적용 메서드

    public void validateDiscount(int discountPrice){

        if(discountPrice < 0 ){
            throw new IllegalArgumentException("할인 가격은 음수일 수 없습니다.");
        }
        if(discountPrice > this.price){
            throw new IllegalArgumentException("할인 가격이 원가보다 클 수 없습니다.");
        }
    }

    //최종 판매가 메서드
    public int getFinalPrice(){

        return this.price -this.discountPrice;
        
    }

    //상품생성 메서드
    
    public static Item create(ItemRequestDTO dto, Admins admin){
        Item item = new Item();

        item.admin = admin;
        item.category = dto.getCategory();
        item.itemName = dto.getItemName();
        item.itemDetail = dto.getItemDetail();
        item.itemColor = dto.getItemColor();

        item.price = dto.getPrice();
        item.discountPrice = dto.getDiscountPrice() !=null? dto.getDiscountPrice() : 0;
        item.currency = dto.getCurrency() !=null? dto.getCurrency():"KRW";
        item.stock = dto.getStock();

        item.validate();

        return item;

    }

}
