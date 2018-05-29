/*jslint browser: true, node: true */
/*global window */

/*!

   Sprite thumbnail image plugin for Flowplayer

   Based on
   https://github.com/flowplayer/flowplayer-thumbnails/

   Copyright (c) 2015-2017, Flowplayer Drive Oy

   Released under the MIT License:
   http://www.opensource.org/licenses/mit-license.php

   requires:
   - Flowplayer HTML5 version 7.x or greater
   revision: $GIT_ID$

*/
(function () {
    "use strict";
    var extension = function (flowplayer) {

        flowplayer(function (api, root) {
            var common = flowplayer.common,
                bean = flowplayer.bean,
                extend = flowplayer.extend,
                support = flowplayer.support,
                timeStamp = common.find('.fp-timestamp', root)[0];

            if (support.touch || !support.inlineVideo) {
                return;
            }

            api.on('ready', function (_ev, a, video) {
                // cleanup
                bean.off(root, '.thumbnails');
                common.css(timeStamp, {
                    width: '',
                    height: '',
                    'background-image': '',
                    'background-repeat': '',
                    'background-size': '',
                    'background-position': '',
                    'border': '',
                    'text-shadow': ''
                });

                var c = extend({
                        responsive: 600
                    }, a.conf.thumbnails, video.thumbnails),
                    src = c.src,
                    responsive = c.responsive;

                if (!src || !c.width || !c.height) {
                    return;
                }

                var height = c.height,
                    width = c.width,
                    interval = c.interval || 1,
                    engine = common.find('.fp-engine', root)[0],
                    imgWidth,
                    imgHeight,
                    img = new Image(),
                    textContent = function (el) {
                        return el[(el.innerText !== undefined)
                            ? 'innerText'
                            : 'textContent'];
                    };

                img.src = src;
                bean.on(img, 'load', function () {
                    imgWidth = img.naturalWidth;
                    imgHeight = img.naturalHeight;
                });

                bean.on(root, 'mousemove.thumbnails', '.fp-timeline', function () {
                    if (!imgWidth) {
                        return;
                    }
                    var seconds = 0,
                        timeArray = textContent(timeStamp).split(':'),
                        engineWidth = common.width(engine),
                        displayThumb = function () {
                            var scale = (responsive && engineWidth < responsive)
                                    ? engineWidth / responsive
                                    : 1,
                                scaledWidth = width * scale,
                                scaledHeight = height * scale,
                                columns = imgWidth / width,
                                left = Math.floor(seconds % columns) * -scaledWidth,
                                top = Math.floor(seconds / columns) * -scaledHeight;
                            common.css(timeStamp, {
                                width: scaledWidth + 'px',
                                height: scaledHeight + 'px',
                                'background-image': "url('" + src + "')",
                                'background-repeat': 'no-repeat',
                                border: '1px solid #333',
                                'text-shadow': '1px 1px #000',
                                'background-position': left + 'px ' + top + 'px',
                                'background-size': (imgWidth * scale) + 'px ' + (imgHeight * scale) + 'px'
                            });
                        };

                    timeArray.reverse().forEach(function (t, i) {
                        seconds += parseInt(t, 10) * Math.pow(60, i);
                    });
                    // enables greater interval than one second between thumbnails
                    seconds = Math.floor(seconds / interval);

                    displayThumb();
                });
            });

        });
    };

    if (typeof module === 'object' && module.exports) {
        module.exports = extension;
    } else if (window.flowplayer) {
        extension(window.flowplayer);
    }
}());
