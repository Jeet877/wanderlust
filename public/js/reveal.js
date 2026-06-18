// // scrollReveal.js
// document.addEventListener("DOMContentLoaded", () => {
//   const cards = document.querySelectorAll(".listing-card");

//   const revealOnScroll = () => {
//     const triggerBottom = window.innerHeight * 0.9;
//     cards.forEach(card => {
//       const cardTop = card.getBoundingClientRect().top;
//       if (cardTop < triggerBottom) {
//         card.classList.add("show");
//       } else {
//         card.classList.remove("show");
//       }
//     });
//   };

//   window.addEventListener("scroll", revealOnScroll);
//   revealOnScroll(); // initial load
// });
