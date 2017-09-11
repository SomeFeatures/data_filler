let states = {};

const USER_PWD = [{
  re: /(google\.com|facebook\.com)/,
  username: 'qqqqsssaaawww@gmail.com',
  pwd: 'qwerty!@##@!'
}, {
  re: /webex\.com/,
  username: 'qqqqsssaaawww@gmail.com',
  pwd: 'qwerty!@##@!1'
}];

const RULES = [
{
  type:  'Сarousel',
  re: {
    login: "^https:\/\/accounts\.google\.com\/(signin\/.+\/identifier|ServiceLogin)",
    pwd: "^https:\/\/accounts\.google\.com\/signin\/.+\/pwd",
    provider: "^https:\/\/accounts\.google\.com\/(signin|ServiceLogin)\/"
  },
  selectors: {
    login: '#identifierId',
    username: '#profileIdentifier',
    login_next: '#identifierNext',
    pwd: '[name="password"]',
    pwd_next: '#passwordNext'
  }
},
{
  type:  'Сarousel',
  waitpwd: true,
  re: {
    login: "^https:\/\/signin\.webex\.com\/collabs\/auth",
    pwd: "^https://idbroker\.webex\.com\/idb\/saml2\/",
    provider: "^https:\/\/.+\.webex\.com\/"
  },
  selectors: {
    login: '#username',
    login_next: '#login-btn-next',
    pwd: '[type=password]',
    pwd_next: '#signin_ht,[name="Login.Submit"]',
    username: '.login-email'
  }
},
{
  type:  'Single',
  re: {
    provider: "^https:\/\/www\.facebook\.com\/"
  },
  selectors: {
    login: '[type=email],#email,#header_block',
    pwd: '[type=password],#pass',
    next: '[type=submit],#loginbutton'
  }
}
];

const checkPage = (url, tab) => {
  const data = RULES.find(rules=>{
    return rules.waitpwd
      && new RegExp(rules.re.pwd).test(url)
  });
  if (data) {
    chrome.tabs.sendMessage(tab.id, {rules: RULES}, function(response) {});
  }
};

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {rules: RULES}, function(response) {});
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    const {url} = sender.tab;
    const userPwd = USER_PWD.find(elem=>elem.re.test(url));
    if (!userPwd) return;
    if ('full' in request) {
      sendResponse(userPwd);
    } else if ('username' in request) {
      sendResponse(userPwd.username);
    } else if ('pwd' in request) {
      const {current_user} = request;
      if (current_user === userPwd.username) {
        sendResponse(userPwd.pwd);
      }
    } else if ('check' in request) {
      checkPage(url, sender.tab);
    }
  });
