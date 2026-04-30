//데이터 흐름: Repository -> Service -> Controller
package com.cmyk.threeh.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Bookmarks;


public interface BookmarksRepository extends JpaRepository<Bookmarks, Long> {

    Optional<Bookmarks> findByBookmakrId(Long bookmakrId);  //데이터 1개
    List<Bookmarks> findById(String id);
    
}