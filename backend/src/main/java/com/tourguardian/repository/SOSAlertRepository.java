package com.tourguardian.repository;

import com.tourguardian.entity.SOSAlert;
import com.tourguardian.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SOSAlertRepository extends JpaRepository<SOSAlert, Long> {
    List<SOSAlert> findByUserOrderByCreatedAtDesc(User user);
    List<SOSAlert> findByUserAndStatus(User user, SOSAlert.SOSStatus status);
}
