function calculatePrice() {
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const priceDisplay = document.getElementById('priceDisplay');
  const pricePerNight = window.listingPrice;

  if (checkIn && checkOut) {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const nights = (outDate - inDate) / (1000 * 60 * 60 * 24);
    if (nights > 0) {
      const total = nights * pricePerNight;
      priceDisplay.textContent = `₹ ${total.toLocaleString("en-IN")} for ${nights} nights`;
    } else {
      priceDisplay.textContent = "";
    }
  }
}

document.getElementById('checkIn').addEventListener('change', calculatePrice);
document.getElementById('checkOut').addEventListener('change', calculatePrice);