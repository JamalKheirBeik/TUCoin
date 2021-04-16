let home = document.querySelector(".home");
let buy = document.querySelector(".buy");
let homeBtn = document.getElementById("home");
let buyBtn = document.getElementById("buy");

homeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  buy.style.display = "none";
  home.style.display = "block";
});

buyBtn.addEventListener("click", (e) => {
  e.preventDefault();
  home.style.display = "none";
  buy.style.display = "block";
});
