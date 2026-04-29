package com.cmyk.threeh.domain;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Getter
public class Bookmarks {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bookmarks_seq")
    @SequenceGenerator(name = "bookmarks_seq", sequenceName = "BOOKMARKS_SEQ", allocationSize = 1)
    @Column(name = "bookmakr_Id")
    private Long bookmakrId;

    //member_id (외래키)
    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;

    //item_id (외래키)
    @OneToOne
    @JoinColumn(name = "itemId")
    private Item item;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "type")
    private String type;
    
}