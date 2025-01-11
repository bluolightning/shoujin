export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message from content script:", message);
  
    if (message.action === 'pageVisible') {
      console.log("Page became visible:", message.url);
    } else if (message.action === 'pageHidden') {
      console.log("Page became hidden:", message.url);
    } else if (message.action === 'pageFocused'){
      console.log("Page focused", message.url);
    } else if (message.action === 'pageBlurred'){
      console.log("Page blurred", message.url);
    } else if (message.action === 'tabActivated') {
      console.log("Tab activated:", message.url);
    } else if (message.action === 'tabDeactivated'){
      console.log("Tab deactivated:", message.url);
    }
  });
});
