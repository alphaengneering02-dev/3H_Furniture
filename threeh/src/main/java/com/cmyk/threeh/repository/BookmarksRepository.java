//데이터 흐름: Repository -> Service -> Controller
package com.cmyk.threeh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Bookmarks;


public interface BookmarksRepository extends JpaRepository<Bookmarks, Long> {

    Optional<Bookmarks> findById(long bookmakrId);  //데이터 1개
    
}