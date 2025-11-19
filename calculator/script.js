// Get DOM
const display = document.getElementById("display");
const buttons = document.querySelectorAll(".buttons .btn");

// Focus display so user can type
display.focus();

// When clicking buttons
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const val = btn.getAttribute("data-value");
    const action = btn.getAttribute("data-action");

    if (action === "clear") {
      clearDisplay();
      return;
    }
    if (action === "del") {
      deleteChar();
      return;
    }
    if (action === "equals") {
      calculate();
      return;
    }

    // If a value button like '7', '+', '.', '%' etc.
    if (val) addToDisplay(val);
  });
});

// Add value at caret (so users can type anywhere)
function addToDisplay(value) {
  const selStart = display.selectionStart;
  const selEnd = display.selectionEnd;
  // Replace selected text or insert at caret
  const current = display.value === "0" ? "" : display.value;
  const newValue = current.slice(0, selStart) + value + current.slice(selEnd);
  display.value = newValue;
  // move caret after inserted char
  const pos = selStart + value.length;
  display.setSelectionRange(pos, pos);
  display.focus();
}

// Clear
function clearDisplay() {
  display.value = "0";
  display.focus();
  display.setSelectionRange(1, 1);
}

// Delete last character or selected range
function deleteChar() {
  const start = display.selectionStart;
  const end = display.selectionEnd;

  if (start !== end) {
    // delete selection
    const v = display.value;
    display.value = v.slice(0, start) + v.slice(end);
    display.setSelectionRange(start, start);
    display.focus();
    return;
  }

  // if caret at position 0 do nothing
  if (start === 0) {
    display.value = display.value === "" ? "0" : display.value;
    return;
  }

  const v = display.value;
  const newPos = start - 1;
  display.value = v.slice(0, newPos) + v.slice(end);
  display.setSelectionRange(newPos, newPos);
  if (display.value === "") display.value = "0";
  display.focus();
}

// Calculate expression
function calculate() {
  // Prepare expression:
  // - turn × and − to * and -
  // - convert percentages like 50% to (50/100)
  let expr = display.value
    .replace(/×/g, "*")
    .replace(/−/g, "-")
    .replace(/×/g, "*");

  // Replace number% with (number/100)
  expr = expr.replace(/(\d+(\.\d+)?)%/g, "($1/100)");

  // Prevent accidental leading operator like "+2" -> allow it (Function handles it)
  try {
    // Use Function to evaluate safely-ish (no external variables)
    const result = Function('"use strict"; return (' + expr + ")")();
    if (result === undefined || Number.isNaN(result)) {
      display.value = "Error";
    } else {
      // Trim long floats
      display.value = formatResult(result);
    }
  } catch (e) {
    display.value = "Error";
  }
  // place caret at end
  display.setSelectionRange(display.value.length, display.value.length);
  display.focus();
}

function formatResult(num) {
  // If integer, show as-is
  if (Number.isInteger(num)) return String(num);
  // else limit to 10 significant digits (avoid huge floats)
  return parseFloat(num.toPrecision(10)).toString();
}

/* Keyboard support:
   - Enter => calculate
   - Backspace => deleteChar (we let native Backspace handle selection typing normally,
     but we intercept to ensure display isn't empty)
*/
display.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    calculate();
    return;
  }

  if (e.key === "Backspace") {
    // let browser handle deletion if selection/caret present.
    // But if display is single char or becomes empty, ensure "0".
    setTimeout(() => {
      if (display.value === "") display.value = "0";
    }, 1);
    return;
  }

  // allow only relevant keys (digits, operators, ., %, parentheses, navigation)
  const allowed = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "-",
    "*",
    "/",
    "%",
    ".",
    "(",
    ")",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Delete",
    "Home",
    "End",
    "Tab",
  ];

  // If Ctrl/Meta keys pressed, allow combos (copy/paste)
  if (e.ctrlKey || e.metaKey) return;

  // If key is not allowed and not a control key, prevent
  if (!allowed.includes(e.key) && e.key.length === 1) {
    e.preventDefault();
  }
});

// Ensure when input is focused and empty we keep "0" placeholder behavior
display.addEventListener("focus");
