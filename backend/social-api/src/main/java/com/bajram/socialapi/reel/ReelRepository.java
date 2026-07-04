package com.bajram.socialapi.reel;

import com.bajram.socialapi.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReelRepository extends JpaRepository<Reel, Long> {
    Page<Reel> findByAuthor(User author, Pageable pageable);
    Page<Reel> findAllByOrderByCreatedAtDesc(Pageable pageable);
}