(function () {

// Init Module.

let pageUrl = window.location.href;
let timerId = null;
let fillers = [];
const timerDelay = 300;

const urlWasChanges = (url) => {
  const currentFillder = fillers.find(filler=>filler.isIAm(url))
  if (currentFillder) {
    currentFillder.fire(pageUrl);
  }
};

const checkUrl = function() {
  const {next} = this;
  const currentUrl = window.location.href;
  if (pageUrl !== currentUrl) {
    pageUrl = currentUrl;
    next && next(pageUrl);
  }
  clearTimeout(timerId);
  timerId = setTimeout(checkUrl, timerDelay);
}.bind({next: urlWasChanges});

const fill = (data) => {
  fillers = data.rules.map(data=>{
    if (data.type === 'Сarousel') {
      return new СarouselFiller(data)
    } else if (data.type === 'Single') {
      return new SingleFiller(data);
    }
  });
  urlWasChanges(pageUrl);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    clearTimeout(timerId);
    timerId = setTimeout(checkUrl, timerDelay);
    fill(request);
  });

window.addEventListener('popstate', _=>{
  clearTimeout(timerId)
});

chrome.runtime.sendMessage({check: ''});

})();