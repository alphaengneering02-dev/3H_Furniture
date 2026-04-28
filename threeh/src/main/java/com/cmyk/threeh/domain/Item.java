package com.cmyk.threeh.domain;

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
import javax.persistence.Table;

import com.cmyk.threeh.enums.ItemSellStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "Item")
@NoArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Admins adminId;

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
    private int discountPrice;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(nullable = false)
    private int stock;

}
