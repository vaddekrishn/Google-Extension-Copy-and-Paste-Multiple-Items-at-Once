let copiedData = {
    text1: null,
    text2: null
  };
  
  function createContextMenus() {
    chrome.contextMenus.removeAll(() => {
      console.log("All context menus removed.");
  
      chrome.contextMenus.create({
        id: "copy-text1",
        title: "Copy Text 1",
        contexts: ["selection"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-text2",
        title: "Copy Text 2",
        contexts: ["selection"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-text1",
        title: "Paste Text 1",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-text2",
        title: "Paste Text 2",
        contexts: ["editable"]
      }, onCreated);
    });
  }
  
  function onCreated() {
    if (chrome.runtime.lastError) {
      console.error(`Error creating context menu: ${chrome.runtime.lastError.message}`);
    } else {
      console.log("Context menu created.");
    }
  }
  
  createContextMenus();
  
  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "copy-text1") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyText,
        args: ["text1"]
      });
    } else if (info.menuItemId === "copy-text2") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyText,
        args: ["text2"]
      });
    } else if (info.menuItemId === "paste-text1") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: pasteText,
        args: [copiedData.text1]
      });
    } else if (info.menuItemId === "paste-text2") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: pasteText,
        args: [copiedData.text2]
      });
    }
  });
  
  function copyText(type) {
    const selection = window.getSelection();
    const selectedText = selection.toString();
  
    if (selectedText) {
      const tempInput = document.createElement("textarea");
      tempInput.value = selectedText;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      console.log(`Text copied (${type}):`, selectedText);
  
      chrome.runtime.sendMessage({ action: "storeCopiedData", type: type, data: selectedText });
    } else {
      console.warn(`No text selected for ${type}`);
    }
  }
  
  function pasteText(data) {
    const activeElement = document.activeElement;
    if (activeElement) {
      if (activeElement.isContentEditable) {
        document.execCommand('insertText', false, data);
        console.log(`Text pasted into contentEditable element.`);
      } else if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
        activeElement.value = data;
        console.log(`Text pasted into textarea or input element.`);
      } else {
        console.warn(`Unsupported element type (${activeElement.tagName}) for pasting text.`);
      }
    } else {
      console.warn(`No active element found to paste text into.`);
    }
  }
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "storeCopiedData") {
      copiedData[request.type] = request.data;
    }
  });
  
  chrome.runtime.onInstalled.addListener(createContextMenus);
  chrome.runtime.onStartup.addListener(createContextMenus);