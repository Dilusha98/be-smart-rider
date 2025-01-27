<script setup>
import { ref } from 'vue';

// Import AOS styles
import 'aos/dist/aos.css';
// Import AOS library
import AOS from 'aos';
// Initialize AOS
AOS.init();

const heroTitle = ref('We offer modern solutions for growing your business');
const heroDescription = ref(
  'We are a team of talented designers making webssites with Bootstrap'
);
const aboutLink = ref('#about');
const videoLink = ref('https://www.youtube.com/watch?v=Y7f98aduVJ8');
const heroImage = ref(new URL('/assets/img/values-1.png', import.meta.url).href);
</script>

<template>
  <div>
    <section id="hero" class="hero section">
      <div class="container">
        <div class="row gy-4">
          <div
            class="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center"
          >
            <h1 data-aos="fade-up">{{ heroTitle }}</h1>
            <p data-aos="fade-up" data-aos-delay="100">{{ heroDescription }}</p>
            <div
              class="d-flex flex-column flex-md-row"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <a :href="aboutLink" class="btn-get-started">
                Get Started <i class="bi bi-arrow-right"></i>
              </a>
              <a
                :href="videoLink"
                class="glightbox btn-watch-video d-flex align-items-center justify-content-center ms-0 ms-md-4 mt-4 mt-md-0"
              >
                <i class="bi bi-play-circle"></i><span>Watch Video</span>
              </a>
            </div>
          </div>
          <div
            class="col-lg-6 order-1 order-lg-2 hero-img"
            data-aos="zoom-out"
          >
            <img
              :src="heroImage"
              class="img-fluid animated"
              alt="Hero Image"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

