# Calorie Counter

A lightweight, dependency-free calorie tracking app built with vanilla HTML, CSS, and JavaScript. Based on the [freeCodeCamp Learn Form Validation by Building a Calorie Counter](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/) curriculum.

## Features

- Set a daily calorie **budget**
- Log food entries across **Breakfast, Lunch, Dinner, and Snacks**
- Log **Exercise** to offset calories consumed
- See an instant **Surplus / Deficit** summary after calculating
- **Delete individual entries** without resetting the whole form
- **Persists your data** across page refreshes via `localStorage`
- Inline **error messages** for invalid inputs (no browser alert popups)
- Fully **keyboard accessible** with visible focus indicators

## Usage

1. Open `index.html` in any modern browser — no build step required.
2. Enter your **daily calorie budget**.
3. Select a meal category from the dropdown and click **Add Entry**.
4. Fill in the name and calorie count for each item. Repeat as needed.
5. Click **Calculate Remaining Calories** to see your summary.
6. Click **Clear** to reset everything and start fresh.

## Project Structure

```
calorie-counter/
├── index.html   # App markup
├── script.js    # App logic
└── styles.css   # Styles
```
