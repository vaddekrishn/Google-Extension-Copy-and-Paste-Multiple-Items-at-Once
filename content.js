console.log("Content script loaded");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "ping") {
    sendResponse("pong");
    return true; // Keep the message channel open for the asynchronous response
  } else if (request.action === "copyText") {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      console.log(`Copying text (${request.type}):`, selectedText);
      sendResponse({ type: request.type, text: selectedText });
    } else {
      console.warn(`No text selected for ${request.type}`);
      sendResponse(null);
    }
    return true; // Keep the message channel open for the asynchronous response
  }
});