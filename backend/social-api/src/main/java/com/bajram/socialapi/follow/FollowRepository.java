package com.bajram.socialapi.follow;

import com.bajram.socialapi.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollowerAndFollowing(User follower, User following);

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    long countByFollowing(User following); // follower count

    long countByFollower(User follower); // following count

    Page<Follow> findByFollowing(User following, Pageable pageable); // who follows this user

    Page<Follow> findByFollower(User follower, Pageable pageable);// who this user follows

    @Query("SELECT f.following.id FROM Follow f WHERE f.follower = :follower")
    List<Long> findFollowingIdsByFollower(@Param("follower") User follower);
}