const downloadButton = '<div class="ProfileTweet-action tva_download_action"><button class="ProfileTweet-actionButton u-textUserColorHover js-actionButton tva_js_download" type="button"><div class="IconContainer js-tooltip" data-original-title="Video Download"><span class="Icon Icon--medium tva_download_icon"></span><span class="u-hiddenVisually"></span></div></button></div>'
const progressPopup = '<div class="stream-item tva_ext_container tva_hide" aria-live="polite"><div class="tva_ext_spinner"><div class="tva_spinner"></div></div><div class="tva_ext_text_box"><p class="tva_ext_text">GIF Converting...</p></div></div>'
const downloadIcon = '<g xmlns="http://www.w3.org/2000/svg"><path d="M 21 15 L 20.98 18.51 C 20.98 19.89 19.86 21 18.48 21 L 5.5 21 C 4.11 21 3 19.88 3 18.5 L 3 15 L 5 15 L 5 18.5 C 5 18.78 5.22 19 5.5 19 L 18.48 19 C 18.76 19 18.98 18.78 18.98 18.5 L 19 15 L 21 15 Z M 12 16 L 17.7 10.3 L 16.29 8.88 L 13 12.18 L 13 2.59 L 11 2.59 L 11 12.18 L 7.7 8.88 L 6.29 10.3 L 12 16 Z" style=""/></g>'
const reactProgressPopup = '<div class="tva-react-spinner-wrapper"><div class="tva_spinner tva_spinner_old"></div><span class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0">GIFing...</span></div>'

const modalCalss = 'div[aria-modal="true"]'

const targetNode = document.body
const config = { childList: true, subtree: true }

const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                injectAdditionalDownloadButtons(node)
            })
        }
    }
}

const observer = new MutationObserver(callback)
observer.observe(targetNode, config)

$(document).on({
    mouseenter: function (e) {
        $(e.currentTarget).find('svg').prev().addClass('r-zv2cs0')
        $(e.currentTarget).find('svg').prev().parent().parent().removeClass('r-111h2gw')
        $(e.currentTarget).find('svg').prev().parent().parent().addClass('r-13gxpu9')
    },
    mouseleave: function (e) {
        $(e.currentTarget).find('svg').prev().removeClass('r-zv2cs0')
        $(e.currentTarget).find('svg').prev().parent().parent().addClass('r-111h2gw')
        $(e.currentTarget).find('svg').prev().parent().parent().removeClass('r-13gxpu9')
    }
}, ".tva-download-icon")

let hideViewCount = false
browser.runtime.onMessage.addListener(processRequest)
browser.storage.sync.get({ hideViewCount: true }).then((items) => {
    hideViewCount = items.hideViewCount
})

function initialize() {
    $(".tweet").each(function () {
        injectDownloadButton(this)
    })
    $("body").append(progressPopup)
    $(".tva_ext_container").css("z-index", getMaximumZindex() + 1)
}

function injectAdditionalDownloadButtons(insertedElement) {
    const tweets = $(insertedElement).find('article')

    if (tweets.length) {
        tweets.each((index, element) => {
            analysisDom(element)
        })
    } else {
        analysisDom(insertedElement)
    }

    $(insertedElement).find('.AdaptiveMedia-video').each(function () {
        injectDownloadButton(this)
    })
}

function hasMedia(element) {
    const isImage = element.outerHTML.includes('pbs.twimg.com/media')
    const isVideo = $(element).html().includes('video')

    return isImage || isVideo
}

function analysisDom(content) {
    if (hideViewCount) {
        removeStatIcon(content)
    }

    if (hasMedia(content)) {
        injectReactDownloadButton(content)
    }
}

function injectReactModalDownloadButton(modal) {
    if (modal.find('div[role="group"] div.tva-modal-download-icon').length) {
        return
    }

    var icon = modal.find('div[role="group"] div:nth-child(4)')

    icon.after(icon.clone())

    var download = icon.next()
    download.addClass('tva-modal-download-icon')
    download.children('div:first-child').data('testid', 'download')
    download.children('div:first-child').attr('aria-label', 'Media Download')
    download.find('svg').html(downloadIcon)
    download.click(modalCalss, downloadMediaObject)

    icon.attr('class', icon.prev().attr('class'))
}

function removeStatIcon(content) {
    const tweet = $(content).closest('article')
    const iconsGroups = tweet.find('div[role="group"]')
    const dateStatLabel = tweet.find('div.css-1dbjc4n.r-1d09ksm.r-1471scf.r-18u37iz.r-1wbh5a2')

    for (const groupElement of iconsGroups) {
        const group = $(groupElement)
        const statIcon = group.find('path[d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"]')
        statIcon.parents('div.css-1dbjc4n.r-18u37iz.r-1h0z5md').remove()
    }

    if (dateStatLabel.length > 0) {
        dateStatLabel.children('div.r-1q142lx.r-s1qlax').remove()
        dateStatLabel.children('div.r-1nao33i').remove()
    }
}

function injectReactDownloadButton(target) {
    var tweet = $(target).closest('article')

    if (!tweet.length) {
        const modal = $(target).closest(modalCalss)
        injectReactModalDownloadButton(modal)
        return
    }

    if (tweet.find('div[role="group"] div.tva-download-icon').length) {
        return
    }

    const iconsGroups = tweet.find('div[role="group"]')
    const lastIcon = $(iconsGroups[iconsGroups.length - 1]).children('div:last-child')
    const download = lastIcon.clone()
    lastIcon.addClass('r-13awgt0 r-18u37iz r-1h0z5md')

    download.addClass('tva-download-icon')
    download.children('div:first-child').data('testid', 'download')
    download.children('div:first-child').attr('aria-label', 'Media Download')
    download.find('svg').html(downloadIcon)
    download.click('article', downloadMediaObject)

    const button = download.find('div > button');
    if (button) {
        button.removeAttr('aria-disabled');
        button.removeAttr('disabled');
        button.removeClass();
        button.addClass("css-175oi2r r-1777fci r-bt1l66 r-bztko3 r-lrvibr r-1loqt21 r-1ny4l3l")
    }
    
    lastIcon.after(download)
}

function injectDownloadButton(target) {
    var tweet = $(target).closest('.tweet')
    if (!isVideoExist(tweet)) {
        return
    }

    if (isVideoDownloadButton(tweet)) {
        return
    }

    var favIcon = $(tweet).find('div.ProfileTweet-action--favorite')[0]
    $(favIcon).after(downloadButton)
    $(favIcon).siblings(".tva_download_action").find('button.tva_js_download').click('.tweet', downloadMediaObject)
}

function indexOfMedia(selector, originalIndex, totalCount) {
    if (selector === modalCalss) {
        const splited = window.location.pathname.split('/')

        return Number(splited[splited.length - 1]);
    } else if (totalCount === 1) {
        return 0;
    }
    return originalIndex + 1;
}

async function downloadMediaObject(event) {

    event.stopPropagation()
    event.preventDefault()

    const tweetSelector = event.data

    const tweet = $(event.currentTarget).closest(tweetSelector)

    const sessionData = JSON.parse(sessionStorage.getItem('rectifying@gmail.com') || '[]');

    const mainTweetId = extractMainTweetId(tweet);

    const relatedMedia = sessionData.filter(media => 
        media.tweetId === mainTweetId || 
        media.referencedBy === mainTweetId
    );

    relatedMedia.forEach(media => {
        browser.runtime.sendMessage(media);
    });
}

async function downloadVideoObject(tweet, tweetSelector, videoTags) {
    videoTags.map(async (element, index) => {
        var videoSource = element.src
        if (!videoSource) {
            videoSource = tweet.find('source')[0].src
        }

        let url = null
        if (videoSource.includes('blob')) {
            url = await extractGraphQlMp4Video(getTweetId(tweet, tweetSelector), getCookie("ct0"), index)
        }

        const videoIndex = indexOfMedia(tweetSelector, index, videoTags.length)
        browser.runtime.sendMessage({
            type: 'video',
            videoSource: url || videoSource,
            tweetId: getTweetId(tweet, tweetSelector),
            readableFilename: generateReadableFilename(tweet, tweetSelector, videoIndex),
            tweetSelector: tweetSelector,
            token: getCookie("ct0")
        })
    })
}

function downloadImageObject(tweet, tweetSelector, imageTags) {
    imageTags.map((element, index) => {
        const src = refineImageSourceParams(element.src)
        const imageIndex = indexOfMedia(tweetSelector, index, imageTags.length)
        const readableFilename = generateReadableFilename(tweet, tweetSelector, imageIndex)
        processImageDownload(src, readableFilename)
    })
}


function generateReadableFilename(tweet, selector, imageIndex) {
    if (!!imageIndex) {
        return `${getTweetOwner(tweet, selector)}-${getTweetId(tweet, selector)}-${imageIndex}`
    } else {
        return `${getTweetOwner(tweet, selector)}-${getTweetId(tweet, selector)}`
    }
}

function getTweetOwner(tweet, selector) {
    const re = /(?:https:\/\/[A-z.]*\/(\w*)\/status\/)(?:\d*)(?:\/?\w*)/g
    return getTweetData(tweet, selector, re)
}

function getTweetId(tweet, selector) {
    const re = /(?:https:\/\/[A-z.]*\/\w*\/status\/)(\d*)(?:\/?\w*)/g
    return getTweetData(tweet, selector, re)
}

function getTweetIndex(statusUrl) {
    const re = /(?:https:\/\/[A-z.]*\/\w*\/status\/)(?:\d*\/?\w*\/)(\d)/g
    const match = re.exec(statusUrl)
    if (match) {
        return match[1]
    }
    return 0
}

function getTweetData(tweet, selector, re) {
    if (selector === '.tweet') {
        return tweet.data("tweet-id")
    } else if (selector === 'article') {
        for (const element of tweet.find('a').toArray()) {
            const match = re.exec(element.href)
            if (match) {
                return match[1]
            }
        }
    } else if (selector === modalCalss) {
        const match = re.exec(window.location.href)
        if (match) {
            return match[1]
        }
    }
}

function extractMainTweetId(articleElem) {
    var domElem = articleElem instanceof jQuery ? articleElem.get(0) : articleElem;
    if (!domElem) return null;
  
    var links = domElem.querySelectorAll('a[href*="/status/"]');
    for (const link of links) {
      if (link.querySelector('time')) {
        const match = link.href.match(/status\/(\d+)/);
        if (match) return match[1];
      }
    }
    return null;
  }
  
function processRequest(request) {
    toggleReactProgressPopup(request)
}

function toggleReactProgressPopup(request) {
    if (!$(".tweet").length) {
        let spinner = $('.tva-react-spinner-wrapper')
        if (request.hideSpinner) {
            if (spinner.length) {
                spinner.remove()
            }
        } else {
            if (!spinner.length) {
                $('.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1pi2tsx.r-1777fci h2:first-child ').append($(reactProgressPopup))
            }
        }
    } else {
        if (request.hideSpinner) {
            $(".tva_ext_container").addClass("tva_hide")
        } else {
            $(".tva_ext_container").removeClass("tva_hide")
        }
    }
}

function getMaximumZindex() {
    function intOrNaN(x) {
        return /^\d+$/.test(x) ? +x : NaN
    }

    let maxZ = 0
    $('div').each((element, index) => {
        try {
            var indexCurrent = intOrNaN($(element).css("z-index"))
            if (indexCurrent > maxZ) {
                maxZ = indexCurrent
            }
        } catch {

        }
    })
    return maxZ
}

function isVideoExist(target) {
    return $(target).find('.AdaptiveMedia-video')[0]
}

function isVideoDownloadButton(target) {
    return $(target).find('button.tva_js_download')[0]
}

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'UPDATE_SESSION_DATA') {

        const currentData = JSON.parse(sessionStorage.getItem('rectifying@gmail.com') || '[]');
        const mergedArray = [...currentData, ...message.data];
        sessionStorage.setItem('rectifying@gmail.com', JSON.stringify(mergedArray))
    }
});

window.addEventListener('pageshow', function (event) {
    sessionStorage.removeItem('rectifying@gmail.com');
});