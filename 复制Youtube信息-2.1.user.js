// ==UserScript==
// @name         复制Youtube信息
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Copy creator name, views, likes, comments, subscribers, and publish date from YouTube videos.
// @author       Punk Deer
// @match        https://www.youtube.com/watch*
// @grant        GM_setClipboard
// @updateURL    https://github.com/PunkDeer/-Youtube-/raw/refs/heads/main/%E5%A4%8D%E5%88%B6Youtube%E4%BF%A1%E6%81%AF-2.1.user.js
// @downloadURL  https://github.com/PunkDeer/-Youtube-/raw/refs/heads/main/%E5%A4%8D%E5%88%B6Youtube%E4%BF%A1%E6%81%AF-2.1.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Create the buttons container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.top = '80px';
    buttonContainer.style.left = '15px';
    buttonContainer.style.zIndex = '9999';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '10px';
    document.body.appendChild(buttonContainer);

    // Helper function to create buttons
    function createButton(text, onClick) {
        const button = document.createElement('button');
        button.innerText = text;
        button.style.padding = '8px 7px';
        button.style.backgroundColor = '#ff0000';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.addEventListener('click', onClick);
        buttonContainer.appendChild(button);
    }

    // Helper function to format dates
    function formatDate(dateText) {
        const chineseDateMatch = dateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        const englishDateMatch = dateText.match(/(\d{1,2}) (\w+) (\d{4})/);
        const monthMap = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
            Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
        };

        if (chineseDateMatch) {
            return `${chineseDateMatch[1]}.${chineseDateMatch[2].padStart(2, '0')}.${chineseDateMatch[3].padStart(2, '0')}`;
        }
        if (englishDateMatch) {
            const day = englishDateMatch[1].padStart(2, '0');
            const month = monthMap[englishDateMatch[2]];
            const year = englishDateMatch[3];
            return `${year}.${month}.${day}`;
        }
        return null;
    }

    // Functions to extract information
    function getCreatorName() {
        const element = document.querySelector('span[itemprop="author"] [itemprop="name"]');
        return element ? element.getAttribute('content').trim() : null;
    }

    function getRawVideoViews() {
        const element = document.querySelector('meta[itemprop="interactionCount"]');
        return element ? element.getAttribute('content').trim() : null;
    }

    function getIntegerSubscriberCount() {
        const element = document.querySelector('yt-formatted-string#owner-sub-count');
        if (element) {
            const text = element.innerText.replace(/位订阅者|subscribers/g, '').trim();
            if (text.includes('万')) return parseFloat(text.replace('万', '')) * 10000;
            if (text.includes('K')) return parseFloat(text.replace('K', '')) * 1000;
            if (text.includes('M')) return parseFloat(text.replace('M', '')) * 1000000;
            return parseInt(text, 10);
        }
        return null;
    }

    function getCommentsCount() {
        const element = document.querySelector('#count .yt-formatted-string');
        if (element) {
            const text = element.innerText.trim();
            const commentCount = text.match(/(\d+)/);
            return commentCount ? commentCount[1] : null;
        }
        return null;
    }

    function getLikesCount() {
        const element = document.querySelector('button[aria-label^="与"]');
        if (element) {
            const likesElement = element.querySelector('.yt-spec-button-shape-next__button-text-content');
            return likesElement ? likesElement.innerText.trim() : null;
        }
        return null;
    }

    function getFormattedPublishDate() {
        const dateElement = document.querySelector('div#info-strings yt-formatted-string');
        if (dateElement) {
            return formatDate(dateElement.innerText.trim());
        }
        return null;
    }

    function getSimplifiedVideoURL() {
        const url = new URL(window.location.href);
        url.search = url.searchParams.get('v') ? `?v=${url.searchParams.get('v')}` : '';
        return url.toString();
    }

    // Simulate scroll to load comments
    function loadComments() {
        const commentsSection = document.querySelector('#comments');
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }

    // Show notification in the bottom-left corner
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.innerText = message;
        notification.style.position = 'fixed';
        notification.style.left = '15px';
        notification.style.bottom = '15px';
        notification.style.backgroundColor = '#323232';
        notification.style.color = 'white';
        notification.style.padding = '10px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        notification.style.fontSize = '14px';
        notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        document.body.appendChild(notification);

        // Remove the notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Add buttons for each function (in the new order)
    createButton('昵称', function() {
        const data = getCreatorName();
        if (data) {
            GM_setClipboard(data);
            showNotification('昵称已复制');
        }
    });

    createButton('订阅', function() {
        const data = getIntegerSubscriberCount();
        if (data) {
            GM_setClipboard(data);
            showNotification('订阅数已复制');
        }
    });

    createButton('播放', function() {
        const data = getRawVideoViews();
        if (data) {
            GM_setClipboard(data);
            showNotification('播放数已复制');
        }
    });

    createButton('点赞', function() {
        const data = getLikesCount();
        if (data) {
            GM_setClipboard(data);
            showNotification('点赞数已复制');
        }
    });

    createButton('评论', function() {
        loadComments();  // Scroll to comments first
        setTimeout(() => {
            const data = getCommentsCount();
            if (data) {
                GM_setClipboard(data);
                showNotification('评论数已复制');
            }
        }, 1000);  // Wait for comments to load
    });

    createButton('日期', function() {
        const data = getFormattedPublishDate();
        if (data) {
            GM_setClipboard(data);
            showNotification('发布日期已复制');
        }
    });

    createButton('URL', function() {
        const data = getSimplifiedVideoURL();
        if (data) {
            GM_setClipboard(data);
            showNotification('视频URL已复制');
        }
    });
})();
