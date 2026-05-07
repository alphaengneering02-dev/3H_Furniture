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
    @Column(name="ITEM_ID")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ADMIN_ID", nullable = false)
    private Admins admin;

    @Column(name="ITEM_CATEGORY",nullable = false,length = 100)
    private String itemCategory;

    @Column(name = "ITEM_NAME", nullable = false, length = 255)
    private String itemName;

    @Column(name="ITEM_DETAIL", nullable = true, length = 255)
    private String itemDetail;

    @Enumerated(EnumType.STRING)
    @Column( name="ITEM_SELL_STATUS", nullable = false, length = 50)
    private ItemSellStatus itemSellStatus = ItemSellStatus.SELL;

    @Column(name="ITEM_COLOR",nullable=true, length =50 )
    private String itemColor;

    @Column(name="ITEM_PRICE",nullable = false)
    private Integer itemPrice;

    @Column(name="ITEM_DISCOUNT_PRICE",nullable = true)
    private Integer itemDiscountPrice = 0;

    @Column(name="ITEM_PRICE_CURRENCY",nullable = false, length = 10)
    private String itemPriceCurrency = "KRW";

    @Column(name="ITEM_STOCK",nullable = false)
    private Integer itemStock;

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
    public void itemUpdate(ItemUpdateRequestDTO dto){

     if(dto.getItemName() !=null) this.itemName = dto.getItemName();
     if(dto.getItemDetail() !=null)this.itemDetail = dto.getItemDetail();
     if(dto.getItemColor() !=null)this.itemColor = dto.getItemColor();
     
     if(dto.getItemPrice() !=null){
        validatePrice(dto.getItemPrice());
        this.itemPrice =dto.getItemPrice();
     }

     if(dto.getItemDiscountPrice() !=null){
        validateDiscountPrice(dto.getItemDiscountPrice());
        this.itemDiscountPrice = dto.getItemDiscountPrice();

     }

     if(dto.getItemStock() !=null){
        validateStock(dto.getItemStock());
        this.itemStock = dto.getItemStock();
     }
    
    }

    //생성,수정 검증 메서드
    private void validateItem(){
        validatePrice(this.itemPrice);
        validateStock(this.itemStock);
        validateDiscountPrice(this.itemDiscountPrice);
    }

    //재고 감소 메서드(10개중 3개 주문되면 잔여 7개)

    public void removeStock(int quantity){

        if(quantity <=0){
            throw new IllegalArgumentException("수량은 1개 이상이어야 합니다.");
        }
        if(this.itemStock<quantity){
            throw new IllegalArgumentException("재고가 부족합니다.");
        }
        this.itemStock -=quantity;
    }



    //재고 증가 메서드(환불/입고시 사용할 메서드)

    public void addStock(int quantity){

        if(quantity <=0){
            throw new IllegalArgumentException("수량은 1개 이상이어야 합니다.");
        }
        this.itemStock += quantity;

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

    public void validateDiscountPrice(int itemDiscounttPrice){

        if(itemDiscounttPrice < 0 ){
            throw new IllegalArgumentException("할인 가격은 음수일 수 없습니다.");
        }
        if(itemDiscounttPrice > this.itemPrice){
            throw new IllegalArgumentException("할인 가격이 원가보다 클 수 없습니다.");
        }
    }

    //최종 판매 가격 메서드
    public int getItemFinalPrice(){

        return this.itemPrice -this.itemDiscountPrice;
        
    }

    //상품 생성 메서드
    
    public static Item create(ItemRequestDTO dto, Admins admin){
        Item item = new Item();

        item.admin = admin;
        item.itemCategory = dto.getItemCategory();
        item.itemName = dto.getItemName();
        item.itemDetail = dto.getItemDetail();
        item.itemColor = dto.getItemColor();

        item.itemPrice = dto.getItemPrice();
        item.itemDiscountPrice = dto.getItemDiscountPrice() !=null? dto.getItemDiscountPrice() : 0;
        item.itemPriceCurrency = dto.getItemPriceCurrency() !=null? dto.getItemPriceCurrency():"KRW";
        item.itemStock = dto.getItemStock();

        item.validateItem();

        return item;

    }

}
