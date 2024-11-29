/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*******************!*\
  !*** ./script.ts ***!
  \*******************/


var default_theme = 'page1.css';
var second_theme = 'page2.css';
var current_theme = 'default';
window.addEventListener('DOMContentLoaded', function (event) {
  var theme_button = document.querySelector('.theme_button');
  var body = document.querySelector('body');
  var second_theme_link = document.createElement('link');
  // if (theme_button && body) {
  //     theme_button.addEventListener('click', (event) => {
  //         if (current_theme === 'default') {
  //             body.style.backgroundImage = 'url("sauna_background.jpg")';
  //             current_theme = 'gray_background';
  //         }
  //         else {
  //             body.style.backgroundImage = 'none';
  //             body.style.backgroundColor = '#372f37';
  //             current_theme = 'default';
  //         }
  //     });
  // }
});
/******/ })()
;