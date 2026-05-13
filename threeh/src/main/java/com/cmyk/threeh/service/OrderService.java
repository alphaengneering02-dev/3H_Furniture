package com.cmyk.threeh.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Adress;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.OrderItem;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.domain.Payment;
import com.cmyk.threeh.dto.OrderRequestDTO;
import com.cmyk.threeh.dto.OrderResponseDTO;
import com.cmyk.threeh.dto.PaymentResponseDTO;
import com.cmyk.threeh.dto.PaymentSuccessDTO;
import com.cmyk.threeh.enums.DeliveryStatus;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.enums.OrderType;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.repository.MemberRepository;
import com.cmyk.threeh.repository.OrderRepository;
import com.cmyk.threeh.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final ItemRepository itemRepository;
    private final PaymentRepository paymentRepository;

    /*
     * 주문 저장
     * 
     * @param memberId, itemId, count
     * 
     * @return Long
     */

    @Transactional
    public Long order(Long memberId, List<OrderRequestDTO.OrderItemDTO> orderItems, String city, String street,
            String zipCode, OrderType orderType) {

        // 엔티티 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

        String memberName = member.getName();
        Adress address = new Adress(city, street, zipCode);
        Delivery delivery = new Delivery();
        delivery.setSavedAddress(address);

        List<OrderItem> oderitemList = orderItems.stream()
                .map(dto -> {
                    Item item = itemRepository.findById(dto.getItemId())
                            .orElseThrow(() -> new CustomException(ErrorCode.ITEM_NOT_FOUND));
                    return OrderItem.creaOrderItem(item, item.getItemPrice(), dto.getCount());
                })
                .collect(Collectors.toList());

        // 주문 정보 생성
        Orders order = Orders.createOrder(member, delivery, oderitemList.toArray(new OrderItem[0]));
        order.setOrderState(OrderState.ORDER);
        order.setOrderType(orderType);
        order.setDeliveryDate(LocalDate.now().plusDays(3));
        order.setInstallDate(order.getDeliveryDate());
        order.setDeliveryAddr(city);
        order.setDeliveryAddrDetail(street);
        order.setOrderDate(LocalDateTime.now());

        orderRepository.save(order);

        return order.getOrderId();

    }

    @Transactional
    public void cancelOrder(Long orderId) {

        Orders orders = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

        orders.setOrderState(OrderState.CANCEL);
        orders.cancel();
    }

    /**
     * 
     * 회원 주문 상품 정보 조회
     * 
     */
    @Transactional()
    public List<OrderResponseDTO> getOrdersBymember(String memberId) {

        List<Orders> orders = orderRepository.findByMemberId(memberId);

        return orders.stream()
                .map(OrderResponseDTO::from)
                .collect(Collectors.toList());
    }

    /**
     * 단품 취소
     * 
     * @param user
     * @return
     */
    @Transactional
    public void cancelOrder(Long orderId, Long itemId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

        OrderItem orderItem = order.getOrderItems().stream()
                .filter(oi -> oi.getItem().getItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new CustomException(ErrorCode.ITEMIMG_NOT_FOUND));

        orderItem.cancel();
        order.getOrderItems().remove(orderItem);

        if (order.getOrderItems().isEmpty()) {
            order.setOrderState(OrderState.CANCEL);
            order.cancel();
        }
    }

    /**
     * 다중 취소 기능
     */
    @Transactional
    public void cancelOrderItems(@AuthenticationPrincipal User user, Long orderId, List<Long> itemIds) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

        itemIds.forEach(itemId -> {
            OrderItem orderItem = order.getOrderItems().stream()
                    .filter(oi -> oi.getItem().getItemId().equals(itemId))
                    .findFirst()
                    .orElseThrow(() -> new CustomException(ErrorCode.ITEM_NOT_FOUND));

            orderItem.cancel();
            order.getOrderItems().remove(orderItem);
        });

        if (order.getOrderItems().isEmpty()) {
            order.setOrderState(OrderState.CANCEL);
            order.cancel();
        }

    }

    @Transactional
    public void completeOrder(Long orderId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

        order.complete();
    }

    /**
     * 구매 완료 내역 조회
     */
    @Transactional
    PaymentResponseDTO getPaymentResult(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));

        return payment.toPaymentResponseDTO();
    }

    /**
     * 관리자용: 전체 주문 목록 조회 (DTO 변환 버전)
     */
    @Transactional
    public List<OrderResponseDTO> findAllOrders() {
    List<Orders> orders = orderRepository.findAll();
    
    return orders.stream()
            .map(OrderResponseDTO::from)
            .collect(Collectors.toList());
}

}
