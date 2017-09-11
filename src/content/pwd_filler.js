'use strict';

class PwdFillerBase {

  constructor(data) { }

  isIAm(pageUrl) { }

  fire(pageUrl) {}

  getData(name, current_user) {
    return new Promise(function(success, fail) {
      const request = {[name]: '', current_user};
      chrome.runtime.sendMessage(request, function(response) {
        if (response) {
          success(response);
        }
      });
    })
  }

};

const readyElement = (selector) => {
  return new Promise(function (success, fail) {
    const checkElement = document.querySelector(selector);
    if (checkElement) {
      return success(checkElement);
    }
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (!mutation.addedNodes) return

        for (let i = 0; i < mutation.addedNodes.length; i++) {
          // do things to your newly added nodes here
          const node = mutation.addedNodes[i];
          const targetElement = node.querySelector(selector);
          if (targetElement) {
            observer.disconnect();
            return success(targetElement);
          }
        }
      })
    });

    observer.observe(document.body, {
        childList: true
      , subtree: true
      , attributes: false
      , characterData: false
    });
  });
};

class СarouselFiller extends PwdFillerBase {

  constructor(data) {
    super();
    this.data = data;
  }

  isIAm(pageUrl) {
    return new RegExp(this.data.re.provider).test(pageUrl);
  }

  isLoginPage(pageUrl) {
    return new RegExp(this.data.re.login).test(pageUrl);
  }

  isPwdPage(pageUrl) {
    return new RegExp(this.data.re.pwd).test(pageUrl);
  }

  fillAndNext(fillDOM, value, nextSelector) {
    fillDOM.value = value;
    const nextButton = document.querySelector(nextSelector);
    // );
    if (nextButton) {
      nextButton.click();
    }
  }

  fillUsername() {
    let targetElement;
    readyElement(this.data.selectors.login)
      .then(domElement=>{
        targetElement = domElement;
        return this.getData('username');
      })
      .then(username=>{
        this.fillAndNext(targetElement, username, this.data.selectors.login_next);
      })
      .catch(err=>{

      });
  }

  fillPwd() {
    let targetElement;
    readyElement(this.data.selectors.pwd)
      .then(domElement=>{
        targetElement = domElement;
        const currentUser = document.querySelector(this.data.selectors.username)
        return this.getData('pwd', currentUser && currentUser.innerText);
      })
      .then(pwd=>{
        this.fillAndNext(targetElement, pwd, this.data.selectors.pwd_next);
      })
      .catch(err=>{

      });
  }

  fire(pageUrl) {
    if (this.isLoginPage(pageUrl)) {
      this.fillUsername();
    } else if (this.isPwdPage(pageUrl)) {
      this.fillPwd();
    }
  }
}

class SingleFiller extends PwdFillerBase {

  constructor(data) {
    super();
    this.data = data;
  }

  isIAm(pageUrl) {
    return new RegExp(this.data.re.provider).test(pageUrl);
  }

  fire(pageUrl) {
    let loginElement;
    let pwdElement;
    readyElement(this.data.selectors.login)
      .then(domElement=>{
        loginElement = domElement;
        return readyElement(this.data.selectors.pwd)
      })
      .then(domElement=>{
        pwdElement = domElement;
        return this.getData('full');
      })
      .then(userPwd=>{
        const {username, pwd} = userPwd;
        loginElement.value = username;
        pwdElement.value = pwd;
        return readyElement(this.data.selectors.next)
      })
      .then(domElement=>{
        domElement.click();
      })
      .catch(err=>{
        console.log(err);
      })
  }

}
