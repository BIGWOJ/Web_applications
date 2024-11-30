/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*******************!*\
  !*** ./script.ts ***!
  \*******************/


var current_theme = "page1";
var themes = {
  page1: "styles/page1.css",
  page2: "styles/page2.css",
  page3: "styles/page3.css"
};
function change_theme(theme) {
  var node_list = document.querySelectorAll("link[rel=stylesheet]");
  var theme_link = node_list[0];
  theme_link.href = "styles/".concat(theme, ".css");
  current_theme = theme;
  if (theme === "page2") {
    var theme_buttons = document.querySelectorAll(".theme_button");
    for (var theme_counter = 0; theme_counter < theme_buttons.length; theme_counter++) {
      theme_buttons[theme_counter].style.left = "".concat(theme_counter * 2.5 + 27, "%");
    }
  } else {
    var _theme_buttons = document.querySelectorAll(".theme_button");
    for (var _theme_counter = 0; _theme_counter < _theme_buttons.length; _theme_counter++) {
      _theme_buttons[_theme_counter].style.left = "".concat(_theme_counter * 5 + 9, "%");
    }
  }
}
window.onload = function () {
  var _a;
  var theme_list = Object.keys(themes);
  var _loop = function _loop(theme_counter) {
    var button = document.createElement("button");
    button.className = "theme_button";
    button.innerHTML = "Styl ".concat(theme_counter + 1);
    button.style.left = "".concat(theme_counter * 2.5 + 27, "%");
    button.onclick = function () {
      var selected_theme = theme_list[theme_counter];
      change_theme(selected_theme);
    };
    (_a = document.querySelector(".footer")) === null || _a === void 0 ? void 0 : _a.appendChild(button);
  };
  for (var theme_counter = 0; theme_counter < theme_list.length; theme_counter++) {
    _loop(theme_counter);
  }
};
/******/ })()
;