package com.cmyk.threeh.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_item")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_item_seq")
    @SequenceGenerator(name = "order_item_seq", sequenceName = "ORDER_ITEM_SEQ", allocationSize = 1)
    @Column(name = "order_item_id")
    private Long orderItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Orders orders;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "count", nullable = false)
    private int count;

    @Column(name = "order_price")
    private int orderPrice;


    public static OrderItem creaOrderItem(Item item, int OrderPrice, int count){
        OrderItem orderItem = new OrderItem();
        
        orderItem.setItem(item);
        orderItem.setOrderPrice(OrderPrice);
        orderItem.setCount(count);

        item.removeStock(count); //주문 생성시 재고 감소 로직

        return orderItem;
    }

    public int getTotalPrice(){
        return getOrderPrice() * getCount();
    }

    public void cancel() {
        getItem().addStock(count); //취소시 재고가 다시 롤백되는 함수
    }
    

}
