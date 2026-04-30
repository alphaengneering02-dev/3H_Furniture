package com.cmyk.threeh.domain;

import javax.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name = "ADMINS")
@Getter
@Setter
@NoArgsConstructor
public class Admins {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "admin_seq")
    @SequenceGenerator(
            name = "admin_seq",
            sequenceName = "ADMIN_SEQ",
            allocationSize = 1
    )

    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL)
    private List<Delivery> deliveries;

    @Column(name = "ADMIN_ID")
    private Long adminId;

    @Column(name = "AD_LOGIN_ID", nullable = false, length = 255)
    private String adLoginId;

    @Column(name = "PASSWORD", nullable = false, length = 255)
    private String password;

    @Column(name = "ADMIN_NAME", nullable = false, length = 255)
    private String adminName;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist // 저장 전 시간 자동 세팅
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
