package com.codedulan.dms.repository;

import com.codedulan.dms.entity.Users;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class UsersRepositoryTest {

    @Autowired
    private UsersRepository usersRepository;

    @Test
    public void saveStudent(){
        Users users = Users.builder()
                .email("dulan@gmail.com")
                .password("123")
                .role("admin")
                .build();

        usersRepository.save(users);
    }

}