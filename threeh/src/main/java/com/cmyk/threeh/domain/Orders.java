package com.cmyk.threeh.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import com.cmyk.threeh.enums.DeliveryStatus;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.enums.OrderType;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "orders_seq")
    @SequenceGenerator(name = "orders_seq", sequenceName = "ORDERS_SEQ", allocationSize = 1)
    @Column(name = "order_id")
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    @Column(name = "delivery_addr", length = 500)
    private String deliveryAddr;

    @Column(name = "delivery_addr_detail", length = 255)
    private String deliveryAddrDetail;

    @Column(name = "order_date", nullable = false, length = 50)
    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_state", nullable = false)
    private OrderState orderState = OrderState.ORDER;

    @Column(name = "order_type", nullable = false, length = 50)
    private OrderType orderType;

    @Column(name = "install_date")
    private LocalDate installDate;

    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems = new ArrayList<>();

   

    @Embedded
    private Adress adress;

    // == 연관관계 편의 메서드 == //
    public void addOrderItem(OrderItem orderItem){
        orderItems.add(orderItem);
        orderItem.setOrders(this);
    }

    // == 생성 메서드 ==/
    public static Orders createOrder(Member member, Delivery delivery, OrderItem... orderItems){

        Orders order = new Orders();

        order.setMember(member);
        order.setDelivery(delivery);
        

        for(OrderItem orderItem : orderItems){
            order.addOrderItem(orderItem);
        }

        order.setOrderState(OrderState.ORDER);
        order.setOrderDate(LocalDateTime.now());

        return order;
    }


    /*
    주문 취소
     */   
    
    public void cancel() {


        if(delivery.getStatus() == DeliveryStatus.COMPLETED){

            throw new CustomException(ErrorCode.ORDER_CANCEL_FAIL);    
        }

        this.setOrderState(OrderState.CANCEL);

        for(OrderItem  orderItem: orderItems){
            orderItem.cancel();
        }

    }

    /*
    * 전체 주문 가격 조회
    */
   public int getTotalPrice(){
        int totalPrice = 0;

        for (OrderItem orderItem : orderItems){
            totalPrice += orderItem.getTotalPrice();
        }

        return totalPrice;
   }

   /*
   주문 할당
   */
  public void assinOrder(){
    this.delivery = delivery;
    this.setOrderState(orderState.READY);
  }

  /*
  주문 상태 변경 
  */
  public void changeOrderState(OrderState newState) {
    
    if(delivery.getStatus() == DeliveryStatus.COMPLETED && newState == OrderState.ORDER ){
        throw new CustomException(ErrorCode.ORDER_CANCEL_FAIL);
    }

    this.setOrderState(newState);
  }
  

}
