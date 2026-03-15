package com.lawfirm.config;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.lawfirm.entity.Role;
import com.lawfirm.entity.User;
import com.lawfirm.repository.RoleRepository;
import com.lawfirm.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            initializeRoles();
            System.out.println("✅ Roles initialization complete");
        } catch (Exception e) {
            System.err.println("❌ Roles initialization FAILED: " + e.getMessage());
            e.printStackTrace();
        }

        try {
            initializeAdminUser();
            System.out.println("✅ Admin initialization complete");
        } catch (Exception e) {
            System.err.println("❌ Admin initialization FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void initializeRoles() {
        long roleCount = roleRepository.count();
        System.out.println("ℹ️ Current role count in DB: " + roleCount);

        if (roleCount == 0) {
            System.out.println("ℹ️ No roles found, seeding...");

            Role adminRole = new Role(Role.RoleName.ROLE_ADMIN);
            Role lawyerRole = new Role(Role.RoleName.ROLE_LAWYER);
            Role clientRole = new Role(Role.RoleName.ROLE_CLIENT);

            roleRepository.save(adminRole);
            System.out.println("✅ Saved ROLE_ADMIN");

            roleRepository.save(lawyerRole);
            System.out.println("✅ Saved ROLE_LAWYER");

            roleRepository.save(clientRole);
            System.out.println("✅ Saved ROLE_CLIENT");

        } else {
            System.out.println("ℹ️ Roles already exist, skipping seed.");
        }
    }

    private void initializeAdminUser() {
        boolean adminExists = userRepository.existsByUsername("admin");
        System.out.println("ℹ️ Admin user exists: " + adminExists);

        if (!adminExists) {
            System.out.println("ℹ️ Creating default admin user...");

            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@lawfirm.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setPhoneNumber("000-000-0000");
            admin.setAddress("Law Firm Office");

            Set<Role> adminRoles = new HashSet<>();
            Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException(
                        "ROLE_ADMIN not found in DB — roles table may be empty or save failed above"
                    ));
            adminRoles.add(adminRole);
            admin.setRoles(adminRoles);

            User saved = userRepository.save(admin);
            System.out.println("✅ Default admin created with ID: " + saved.getId());

        } else {
            System.out.println("ℹ️ Admin already exists, skipping.");
        }
    }
}