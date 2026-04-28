package com.cmyk.threeh.domain;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;


import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Getter
public class Bookmarks {

    @Id  //Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookmakrId;

    //member_id (외래키)
    // @ManyToOne
    // private Member member;

    //item_id (외래키)
    // @OneToOne
    // @JoinColumn(name = "itemId")
    // private Item item;

    private LocalDateTime createdAt;

    private String type;
    
}
