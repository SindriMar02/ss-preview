/* B.js — group B behaviour. Own code, written from tooling/modules-B.md (B10, J:10104–10121 values).
   The counters of the stats blocks (B11, B17) run in the shared site.js. */
(function () {
  'use strict';
  /* logo list slider: drag only, no arrows; 1.26 slides below 480, 2.2 at 480+, 2.5 at 768+, 4 (44px gap) at 1024+ */
  if (window.Swiper) {
    document.querySelectorAll('.llist__swiper').forEach(function (el) {
      new Swiper(el, {
        loop: false, navigation: false, slidesPerView: 1.26, spaceBetween: 32,
        breakpoints: { 480: { slidesPerView: 2.2 }, 768: { slidesPerView: 2.5 }, 1024: { slidesPerView: 4, spaceBetween: 44 } }
      });
    });
  }
})();
