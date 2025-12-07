const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import models
const User = require("./models/user");
const Profile = require("./models/profile");
const Category = require("./models/category");

// Database connection
const { connectDB } = require("./config/database");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comentează dacă nu vrei să ștergi datele existente)
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Category.deleteMany({});
    console.log("✓ Data cleared\n");

    // 1. Create Categories
    console.log("📚 Creating categories...");
    const categories = await Category.insertMany([
      {
        name: "Web Development",
        description:
          "Learn modern web development with HTML, CSS, JavaScript, React, Node.js and more",
      },
      {
        name: "Mobile Development",
        description:
          "Build mobile applications for iOS and Android using React Native, Flutter, Swift",
      },
      {
        name: "Data Science",
        description:
          "Master data analysis, machine learning, AI and statistical modeling",
      },
      {
        name: "DevOps",
        description:
          "Learn CI/CD, Docker, Kubernetes, AWS, Azure and cloud infrastructure",
      },
      {
        name: "Cybersecurity",
        description:
          "Understand network security, ethical hacking, and security best practices",
      },
      {
        name: "UI/UX Design",
        description:
          "Create beautiful user interfaces and enhance user experience with Figma, Adobe XD",
      },
      {
        name: "Database Management",
        description:
          "Learn SQL, MongoDB, PostgreSQL, and database design principles",
      },
      {
        name: "Programming Languages",
        description:
          "Master Python, Java, C++, JavaScript and other programming languages",
      },
      {
        name: "Machine Learning",
        description: "Deep learning, neural networks, computer vision and NLP",
      },
      {
        name: "Business & Marketing",
        description:
          "Digital marketing, SEO, social media marketing and business strategies",
      },
    ]);
    console.log(`✓ Created ${categories.length} categories\n`);

    // 2. Create Admin Profile
    console.log("👤 Creating admin user...");
    const adminProfile = await Profile.create({
      gender: "Male",
      dateOfBirth: "1990-01-01",
      about: "Platform Administrator - Resoul",
      contactNumber: 1234567890,
    });

    // 3. Create Admin User
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      firstName: "Admin",
      lastName: "Learnhub",
      email: "admin@learnhub.com",
      password: hashedPassword,
      accountType: "Admin",
      active: true,
      approved: true,
      additionalDetails: adminProfile._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Admin",
    });
    console.log(`✓ Admin created: ${adminUser.email} / password: admin123\n`);

    // 4. Create Sample Instructor Profile
    console.log("👨‍🏫 Creating instructor user...");
    const instructorProfile = await Profile.create({
      gender: "Female",
      dateOfBirth: "1985-05-15",
      about: "Experienced instructor with 10+ years in web development",
      contactNumber: 9876543210,
    });

    const instructorPassword = await bcrypt.hash("instructor123", 10);
    const instructorUser = await User.create({
      firstName: "Maria",
      lastName: "Popescu",
      email: "instructor@learnhub.com",
      password: instructorPassword,
      accountType: "Instructor",
      active: true,
      approved: true,
      additionalDetails: instructorProfile._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Maria%20Popescu",
    });
    console.log(
      `✓ Instructor created: ${instructorUser.email} / password: instructor123\n`
    );

    // 5. Create Sample Student Profile
    console.log("👨‍🎓 Creating student user...");
    const studentProfile = await Profile.create({
      gender: "Male",
      dateOfBirth: "2000-08-20",
      about: "Passionate learner exploring web development",
      contactNumber: 5551234567,
    });

    const studentPassword = await bcrypt.hash("student123", 10);
    const studentUser = await User.create({
      firstName: "Ion",
      lastName: "Ionescu",
      email: "student@learnhub.com",
      password: studentPassword,
      accountType: "Student",
      active: true,
      approved: true,
      additionalDetails: studentProfile._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Ion%20Ionescu",
    });
    console.log(
      `✓ Student created: ${studentUser.email} / password: student123\n`
    );

    // Summary
    console.log("═══════════════════════════════════════════════════");
    console.log("🎉 Database seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Users: 3 (Admin, Instructor, Student)\n`);
    console.log("👥 Test Accounts:");
    console.log("   ┌─────────────────────────────────────────┐");
    console.log("   │ ADMIN                                   │");
    console.log("   │ Email: admin@learnhub.com               │");
    console.log("   │ Password: admin123                      │");
    console.log("   ├─────────────────────────────────────────┤");
    console.log("   │ INSTRUCTOR                              │");
    console.log("   │ Email: instructor@learnhub.com          │");
    console.log("   │ Password: instructor123                 │");
    console.log("   ├─────────────────────────────────────────┤");
    console.log("   │ STUDENT                                 │");
    console.log("   │ Email: student@learnhub.com             │");
    console.log("   │ Password: student123                    │");
    console.log("   └─────────────────────────────────────────┘");
    console.log("═══════════════════════════════════════════════════");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
