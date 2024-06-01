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
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-text2",
        title: "Copy Text 2",
        contexts: ["all"]
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
    const restrictedUrls = ['chrome://', 'https://chrome.google.com/webstore'];
    const isRestrictedUrl = restrictedUrls.some(url => tab.url.startsWith(url));
  
    if (isRestrictedUrl) {
      console.warn(`Cannot copy or paste data on restricted URL: ${tab.url}`);
      return;
    }
  
    if (info.menuItemId === "copy-text1") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyData,
        args: ["text1", info]
      });
    } else if (info.menuItemId === "copy-text2") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyData,
        args: ["text2", info]
      });
    } else if (info.menuItemId === "paste-text1") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: pasteData,
        args: [copiedData.text1]
      });
    } else if (info.menuItemId === "paste-text2") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: pasteData,
        args: [copiedData.text2]
      });
    }
  });
  
  function copyData(type, info) {
    let copiedContent;
  
    if (info.selectionText) {
      copiedContent = info.selectionText;
      console.log(`Text copied (${type}):`, copiedContent);
    } else if (info.linkUrl) {
      copiedContent = info.linkUrl;
      console.log(`Link copied (${type}):`, copiedContent);
    } else if (info.srcUrl) {
      copiedContent = info.srcUrl;
      console.log(`Image copied (${type}):`, copiedContent);
    } else {
      const targetElement = info.targetElementObject;
      if (targetElement) {
        copiedContent = targetElement.outerHTML;
        console.log(`HTML element copied (${type}):`, copiedContent);
      } else {
        console.warn(`No data selected for ${type}`);
        return;
      }
    }
  
    chrome.runtime.sendMessage({ action: "storeCopiedData", type: type, data: copiedContent });
  }
  
  function pasteData(data) {
    const activeElement = document.activeElement;
    if (activeElement) {
      if (activeElement.isContentEditable) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const newNode = document.createTextNode(data);
        range.insertNode(newNode);
        range.setStartAfter(newNode);
        selection.removeAllRanges();
        selection.addRange(range);
        console.log(`Data pasted into contentEditable element.`);
      } else if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        const value = activeElement.value;
        activeElement.value = value.slice(0, start) + data + value.slice(end);
        activeElement.setSelectionRange(start + data.length, start + data.length);
        console.log(`Data pasted into textarea or input element.`);
      } else {
        console.warn(`Unsupported element type (${activeElement.tagName}) for pasting data.`);
      }
    } else {
      console.warn(`No active element found to paste data into.`);
    }
  }
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "storeCopiedData") {
      copiedData[request.type] = request.data;
    }
  });
  
  chrome.runtime.onInstalled.addListener(createContextMenus);
  chrome.runtime.onStartup.addListener(createContextMenus);