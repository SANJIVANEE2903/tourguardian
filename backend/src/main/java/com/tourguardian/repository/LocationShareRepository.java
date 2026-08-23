package com.tourguardian.repository;

import com.tourguardian.entity.LocationShare;
import com.tourguardian.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationShareRepository extends JpaRepository<LocationShare, Long> {
    List<LocationShare> findByUserAndActiveTrue(User user);
    List<LocationShare> findBySharedWithUserAndActiveTrue(User user);
}
