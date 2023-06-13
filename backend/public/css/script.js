const searchWrapper = document.querySelector(".search-input");
const inputBox = searchWrapper.querySelector("input");
const suggBox = searchWrapper.querySelector(".autocom-box");
const icon = searchWrapper.querySelector(".icon");
const form = document.querySelector("form");

let linkTag = searchWrapper.querySelector("a");
let webLink;

let selectedIndex = -1; // Index of the selected suggestion

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchValue = inputBox.value.trim();
  if (searchValue) {
    window.location.href = `/doctors?field=${searchValue}`;
  }
});

// Show suggestions based on user input
inputBox.addEventListener("input", (e) => {
  let userData = e.target.value.trim(); // User entered data
  let emptyArray = [];
  if (userData) {
    emptyArray = suggestions.filter((data) =>
      data.toLowerCase().startsWith(userData.toLowerCase())
    );
    emptyArray = emptyArray.map((data) => `<li>${data}</li>`);
    selectedIndex = -1; // Reset the selected index
    searchWrapper.classList.add("active"); // Show autocomplete box
    showSuggestions(emptyArray);
  } else {
    searchWrapper.classList.remove("active"); // Hide autocomplete box
  }
});

// Handle arrow key navigation
inputBox.addEventListener("keydown", (e) => {
  const allList = suggBox.querySelectorAll("li");
  if (e.key === "ArrowUp") {
    e.preventDefault(); // Prevent the cursor from moving to the start or end of the input box
    if (selectedIndex > 0) {
      selectedIndex--;
    } else {
      selectedIndex = allList.length - 1;
    }
    highlightSuggestion(allList);
  } else if (e.key === "ArrowDown") {
    e.preventDefault(); // Prevent the cursor from moving to the start or end of the input box
    if (selectedIndex < allList.length - 1) {
      selectedIndex++;
    } else {
      selectedIndex = 0;
    }
    highlightSuggestion(allList);
  } else if (e.key === "Enter" && selectedIndex !== -1) {
    e.preventDefault(); // Prevent form submission
    inputBox.value = allList[selectedIndex].textContent;
    searchWrapper.classList.remove("active");
    form.submit(); // Trigger form submission
  }
});

// Handle suggestion selection using click event
suggBox.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    inputBox.value = e.target.textContent;
    searchWrapper.classList.remove("active");
    form.submit(); // Trigger form submission
  }
});

// Handle search icon click
icon.addEventListener("click", () => {
  const searchValue = inputBox.value.trim();
  if (searchValue) {
    window.location.href = `/doctors?field=${searchValue}`;
  }
});

// Highlight the selected suggestion
function highlightSuggestion(allList) {
  for (let i = 0; i < allList.length; i++) {
    allList[i].classList.remove("active");
  }
  allList[selectedIndex].classList.add("active");
}

// Display suggestions
function showSuggestions(list) {
  let listData;
  if (!list.length) {
    listData = `<li>No suggestions available</li>`;
  } else {
    listData = list.join("");
  }
  suggBox.innerHTML = listData;
}
