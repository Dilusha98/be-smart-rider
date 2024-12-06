<template>
    <nav class="navbar">
      <!-- Brand -->
      <div class="navbar-brand">
        <a href="#" class="brand-link">Taxi App</a>
      </div>
  
      <!-- Right Side (Sign In & Profile) -->
      <div class="navbar-right">
        <!-- Sign In Button -->
        <button @click="onSignInClick" class="sign-in-btn">Sign In</button>
  
        <!-- Profile Picture with Dropdown -->
        <div class="profile-dropdown" ref="profileDropdown">
          <img
            :src="profilePicture"
            alt="Profile"
            class="profile-picture"
            @click="toggleDropdown"
          />
          <!-- Dropdown Menu -->
          <div v-show="dropdownOpen" class="dropdown-menu">
            <a href="#" class="dropdown-item" @click="onProfileClick">Profile</a>
            <a href="#" class="dropdown-item" @click="onSettingsClick">Settings</a>
            <hr class="dropdown-divider" />
            <a href="#" class="dropdown-item logout" @click="onLogoutClick">Logout</a>
          </div>
        </div>
      </div>
    </nav>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  
  // Reactive properties using Composition API
  const dropdownOpen = ref(false); 
  const profilePicture = ref('https://via.placeholder.com/40');
  const profileDropdown = ref(null); 

  // Methods to handle user actions
  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
  };
  
  const onSignInClick = () => {
    console.log('Sign In clicked');
  };
  
  const onProfileClick = () => {
    console.log('Profile clicked');
  };
  
  const onSettingsClick = () => {
    console.log('Settings clicked');
  };
  
  const onLogoutClick = () => {
    console.log('Logout clicked');
  };
  
  // Detect clicks outside the dropdown to close it
  const handleClickOutside = (event) => {
    if (profileDropdown.value && !profileDropdown.value.contains(event.target)) {
      dropdownOpen.value = false;
    }
  };
  
  // Add event listener when component is mounted
  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });
  
  // Remove event listener when component is unmounted
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });
  </script>
  
  <style scoped>
  /* Navbar styles */
  .navbar {
    background-color: #2CB953; 
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    box-shadow: none;
    border: none;
  }
  
  /* Brand styles */
  .navbar-brand {
    font-weight: bold;
    font-size: 20px;
  }
  
  .brand-link {
    text-decoration: none;
    color: white;
  }
  
  /* Right side styles (Sign In & Profile) */
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  /* Sign In Button styles */
  .sign-in-btn {
    background: transparent;
    color: white;
    border: 1px solid white;
    border-radius: 5px;
    padding: 3px 8px;
    cursor: pointer;
    box-shadow: none;
  }
  
  /* Profile dropdown wrapper */
  .profile-dropdown {
    position: relative;
  }
  
  /* Profile Picture */
  .profile-picture {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: none;
  }
  
  /* Dropdown Menu styles */
  .dropdown-menu {
    position: absolute;
    top: 50px;
    right: 0;
    background-color: white;
    color: black;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    width: 150px;
    z-index: 9999999;
    padding: 10px 5px;
    display: block;
  }
  
  /* The triangle shape above the dropdown */
  .dropdown-menu::before {
    content: "";
    position: absolute;
    top: -10px;
    right: 20px; 
  }
  
  /* Dropdown items */
  .dropdown-item {
    display: block;
    padding: 10px;
    text-decoration: none;
    color: black;
    cursor: pointer;
  }
  
  /* Hover effects for dropdown items */
  .dropdown-item:hover {
    background-color: #f4f4f4;
  }
  
  /* Logout item */
  .logout {
    color: red;
  }
  
  /* Hover effects for profile picture */
  .profile-picture:hover {
    box-shadow: 0 0 5px white;
  }
  </style>
  