let display = document.getElementById("display");

// Add numbers and operators when buttons are pressed
function press(value) {
  if (display.value === "0") {
    display.value = value;
  } else {
    display.value += value;
  }
}

// Clear the screen
function clearDisplay() {
  display.value = "0";
}

// Delete one character
function delChar() {
  display.value = display.value.slice(0, -1);
  if (display.value === "") {
    display.value = "0";
  }
}

// Calculate result
function calculate() {
  try {
    display.value = eval(display.value);
  } catch (error) {
    display.value = "Error";
  }
}
