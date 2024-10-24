<!-- <script setup>
  import { ref, onMounted } from 'vue';
  import Navbar from './components/Navbar.vue'
</script> -->

<template>
  <header>
    <div class="wrapper">
      <Navbar></Navbar>
    </div>
  </header>

  <main>
    <div>
      <h1>WebSocket Testt</h1>
      <button @click="sendMessage">Send Message</button>
      <p v-if="response">Response: {{ response }}</p>
      <p v-else>No messages received yet.</p>
    </div>
  </main>


</template>


<script setup>
import { ref, onMounted } from 'vue'; // Import necessary Vue functions
import Navbar from './components/Navbar.vue'; // Import your Navbar component

const message = ref('Hello WebSocket!'); // Reactive reference for the message
const response = ref(''); // Reactive reference for the response
let socket = null; // Socket variable

// Function to send message
const sendMessage = () => {
  if (socket) {
    socket.send(message.value); // Send the reactive message
  }
};

// Create the WebSocket connection
onMounted(() => {
  socket = new WebSocket('wss://echo.websocket.org');

  // Listen for messages from the server
  socket.onmessage = (event) => {
    const data = event.data; // Get the data from the event
    // Dynamically change the response based on the data received
    response.value = `Received: ${data}`; // Format the response for clarity
  };

  socket.onopen = () => {
    console.log('WebSocket connection opened.');
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed.');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
});
</script>

<style scoped>
/* Add any styles if needed */
.wrapper {
  padding: 1em;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ccc;
}

main {
  padding: 2em;
  text-align: center;
}
</style>