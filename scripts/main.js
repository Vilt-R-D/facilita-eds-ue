function waitForElement(selector, callback) {
  const interval = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(interval);
      callback(element);
    }
  }, 100); // Check every 100ms
}

// eslint-disable-next-line func-names
(function () {
  const mqVideo = window.matchMedia('(min-width:640px)');
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  const isANDROID = /android/i.test(userAgent);

  function initJSLazy() {
    const $lazyElements = document.querySelectorAll('.js-lazy');
    const $lazySVGs = document.querySelectorAll('svg[data-url]');
    document.addEventListener('readystatechange', (event) => {
      if (event.target.readyState === 'complete') {
        [].forEach.call($lazyElements, ($el) => {
          const $noscriptElement = $el.querySelector('noscript');
          if ($noscriptElement) {
            const unescapedImg = unEscape($noscriptElement.innerHTML);
            $noscriptElement.outerHTML = unescapedImg;
          }
        });
        [].forEach.call($lazySVGs, ($el) => {
          const url = $el.getAttribute('data-url');
          $el.removeAttribute('data-url');
          loadSVG(url, $el);
        });
        loadJS('assets/js/svg4everybody.min.js', () => {
          svg4everybody();
        }, document.body);
      }
    });
  }

  function initResponsiveVideo() {
    const $video = document.querySelector('.lp-video video');
    if ($video === null) return;
    const toggleVideoSource = function (matches) {
      if (matches) {
        $video.src = 'assets/video/bg-horizontal.webm';
      } else {
        /* $video.src = 'assets/video/bg-vertical.mp4'; */
      }

      $video.setAttribute('type', 'video/mp4');
      $video.load();
      $video.autoplay = true;
      $video.muted = true;
      $video.loop = true;
      $video.playsInline = true;
      $video.play();
    };

    document.addEventListener('readystatechange', (event) => {
      if (event.target.readyState === 'complete') {
        mqVideo.addEventListener('change', (e) => {
          toggleVideoSource(e.matches);
        });

        toggleVideoSource(mqVideo.matches);
      }
    });
  }

  function initModalVideo() {
    let $initalVideo;
    const $modalVideo = document.querySelector('.lp-modalvideo');

    if (window.location.hash) {
      $initalVideo = document.querySelector(`.lp-swiper a[href="${window.location.hash}"][data-video-id]:not(.hide-temp)`);
      if ($initalVideo) {
        $modalVideo.open = true;
      }
    }

    function removeHash() {
      if (window.history.pushState) {
        window.history.pushState('', '/', window.location.pathname + window.location.search);
      } else {
        window.location.hash = '';
      }
    }

    document.addEventListener('readystatechange', (event) => {
      if (event.target.readyState === 'complete') {
        const loadImage = (src) => new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

        loadImage('//youtube.com/favicon.ico').then(() => {
          let ytPlayer;

          function loadPlayerScripts(videoId) {
            // 2. This code loads the IFrame Player API code asynchronously.
            const tag = document.createElement('script');

            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // 3. This function creates an <iframe> (and YouTube player)
            //    after the API code downloads.

            window.onYouTubeIframeAPIReady = () => {
              // eslint-disable-next-line no-undef
              ytPlayer = new YT.Player('yt-player', {
                height: '874',
                width: '492',
                videoId: videoId || '',
                events: {
                  onReady: onPlayerReady,
                  onStateChange: onPlayerStateChange,
                },
              });
            };
          }

          // 4. The API will call this function when the video player is ready.
          function onPlayerReady(event) {
            event.target.playVideo();
          }

          // 5. The API calls this function when the player's state changes.
          //    The function indicates that when playing a video (state=1),
          //    the player should play for six seconds and then stop.
          let done = false;
          function onPlayerStateChange(event) {
            if (event.data == YT.PlayerState.PLAYING && !done) {
              setTimeout(stopVideo, 6000);
              done = true;
            }
          }

          function stopVideo() {
            ytPlayer.stopVideo();
          }

          if ($initalVideo) loadPlayerScripts($initalVideo.dataset.videoId);
          if (document.querySelector('.lp-modalvideo') === null) return;
          document.querySelector('.lp-modalvideo').addEventListener('click', (event) => {
            if (event.target.closest('.lp-modalclose') || event.target === $modalVideo) {
              $modalVideo.open = false;
              stopVideo();
              removeHash();
            }
          });

          document.querySelector('.lp-swiper').addEventListener('click', (event) => {
            const $videoButton = event.target.closest('a[data-video-id]');
            if ($videoButton) {
              if (ytPlayer) {
                ytPlayer.loadVideoById($videoButton.dataset.videoId);
              } else {
                loadPlayerScripts($videoButton.dataset.videoId);
              }
              $modalVideo.open = true;
            }
          });
        }).catch((err) => {
          const $videoFallback = document.createElement('video');
          $videoFallback.width = 482;
          $videoFallback.controls = true;
          $videoFallback.autoplay = true;

          if ($initalVideo) {
            $videoFallback.src = $initalVideo.dataset.videoFallback;
          }

          document.querySelector('#yt-player').replaceWith($videoFallback);

          function stopVideo() {
            $videoFallback.pause();
            $videoFallback.currentTime = 0;
          }

          document.querySelector('.lp-modalvideo').addEventListener('click', (event) => {
            if (event.target.closest('.lp-modalclose') || event.target === $modalVideo) {
              $modalVideo.open = false;
              stopVideo();
              removeHash();
            }
          });

          document.querySelector('.lp-swiper').addEventListener('click', (event) => {
            const $videoButton = event.target.closest('a[data-video-id]');
            if ($videoButton) {
              $videoFallback.src = $videoButton.dataset.videoFallback;
              $modalVideo.open = true;
            }
          });
        });
      }
    });
  }

  function initAppButtonsHandler() {
    if (isIOS) {
      document.querySelector('.lp-google').style.display = 'none';
    }

    if (isANDROID) {
      document.querySelector('.lp-apple').style.display = 'none';
    }
  }

  function initScrollTo() {
    if (document.querySelector('#wrapper') === null) return;
    document.querySelector('#wrapper').addEventListener('click', (e) => {
      const $lnk = e.target.closest('.lnk-obs');
      if ($lnk) {
        e.preventDefault();
        const $target = document.querySelector($lnk.getAttribute('href'));
        $target && $target.scrollIntoView();
      }
    });
  }

  function initSwiper() {
    new Swiper('.swiper-container', {
      allowTouchMove: true,
      simulateTouch: true,
      spaceBetween: 16,
      slidesPerView: 1,
      breakpoints: {
        320: {
          slidesPerView: 1.1
        },
        640: {
          slidesPerView: 2.2
        },
        960: {
          slidesPerView: 3.3
        },
        1280: {
          slidesPerView: 4.4
        },
        1600: {
          slidesPerView: 5.5
        },
        1900: {
          slidesPerView: 6.6
        }

      },
      breakpointsBase: 'container',
      pagination: {
        el: '.brad-pagination',
        type: 'bullets',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }

  function initOthersFilters() {
    const $others = document.querySelector('.lp-others');
    if ($others === null) return;
    $others.addEventListener('click', (event) => {
      if (event.target.matches('a[data-filter]')) {
        $others.dataset.filter = event.target.dataset.filter;
      }
    }, false);
  }

  function unEscape(htmlStr) {
    htmlStr = htmlStr.replace(/&lt;/g, '<');
    htmlStr = htmlStr.replace(/&gt;/g, '>');
    htmlStr = htmlStr.replace(/&quot;/g, '"');
    htmlStr = htmlStr.replace(/&#39;/g, "\'");
    htmlStr = htmlStr.replace(/&amp;/g, '&');
    return htmlStr;
  }

  function loadJS(url, implementationCode, location) {
    const scriptTag = document.createElement('script');
    scriptTag.defer = true;
    scriptTag.src = url;

    scriptTag.onload = implementationCode;
    scriptTag.onreadystatechange = implementationCode;

    location.appendChild(scriptTag);
  }

  /**
 * Fetch an SVG
 *
 * @param {string} url URL.
 * @param {DOMElement} el Element.
 * @returns {void} Nothing.
 */
  async function loadSVG(url, el) {
    // Dog bless fetch() and await, though be advised you'll need
    // to transpile this down to ES5 for older browsers.
    const response = await fetch(url);
    const data = await response.text();

    // This response should be an XML document we can parse.
    const parser = new DOMParser();
    const parsed = parser.parseFromString(data, 'image/svg+xml');

    // The file might not actually begin with "<svg>", and
    // for that matter there could be none, or many.
    let svg = parsed.getElementsByTagName('svg');
    if (svg.length) {
      // But we only want the first.
      svg = svg[0];

      // Copy over the attributes first.
      const attr = svg.attributes;
      const attrLen = attr.length;
      for (let i = 0; i < attrLen; ++i) {
        if (attr[i].specified) {
          // Merge classes.
          if (attr[i].name === 'class') {
            const classes = attr[i].value.replace(/\s+/g, ' ').trim().split(' ');
            const classesLen = classes.length;
            for (let j = 0; j < classesLen; ++j) {
              el.classList.add(classes[j]);
            }
          }
          // Add/replace anything else.
          else {
            el.setAttribute(attr[i].name, attr[i].value);
          }
        }
      }

      // Now transfer over the children. Note: IE does not
      // assign an innerHTML property to SVGs, so we need to
      // go node by node.
      while (svg.childNodes.length) {
        el.appendChild(svg.childNodes[0]);
      }
    }
  }

  function fixAcessib() {
    if (window.initAccessib && document.querySelector('#acessib-menu-feat')) {
      const $problematicImgs = document.querySelectorAll('#acessib-menu-feat img:not([src])');
      if ($problematicImgs.length) {
        document.querySelector('#acessib-menu-feat').classList.add('theme-classic');
        [].forEach.call($problematicImgs, ($img) => {
          $img.setAttribute('src', `//${window.host}/assets/common/acessibilidade/svg/themes/classic/${$img.dataset.src}`);
        });
      }
    } else {
      setTimeout(() => {
        fixAcessib();
      }, 50);
    }
  }

  function applyBehaviours() {
    loadJS(window.hlx.codeBasePath + '/scripts/swiper-bundle.js', () => {
      initSwiper();
    }, document.body);

    initModalVideo();
    initOthersFilters();
    // initResponsiveVideo();
    // initAppButtonsHandler();
    // initScrollTo();

    // initJSLazy();
    // fixAcessib();
  }

  waitForElement('main', applyBehaviours);
}());

// function openUrlOnMobile() {
//   const url = 'https://bradesco.onelink.me/61vz/h747szzo';
//   if (/Mobi|Android/i.test(navigator.userAgent)) {
//     window.location.href = url;
//   }
// }
