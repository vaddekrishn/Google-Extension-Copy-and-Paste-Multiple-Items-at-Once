let copiedData = {
    JobLink: null,
    JobTitle: null,
    VendorCompany: null,
    VendorName: null,
    VendorEmail: null,
    VendorContact: null,
    VendorLocation: null
  };
  
  function createContextMenus() {
    chrome.contextMenus.removeAll(() => {
      console.log("All context menus removed.");
  
      chrome.contextMenus.create({
        id: "copy-JobLink",
        title: "Copy Job Link",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-JobTitle",
        title: "Copy Job Title",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-VendorCompany",
        title: "Copy Vendor Company",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-VendorName",
        title: "Copy Vendor Name",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-VendorEmail",
        title: "Copy Vendor Email",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-VendorContact",
        title: "Copy Vendor Contact",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-VendorLocation",
        title: "Copy Vendor Location",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-JobLink",
        title: "Paste Job Link",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-JobTitle",
        title: "Paste Job Title",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-VendorCompany",
        title: "Paste Vendor Company",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-VendorName",
        title: "Paste Vendor Name",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-VendorEmail",
        title: "Paste Vendor Email",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-VendorContact",
        title: "Paste Vendor Contact",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-VendorLocation",
        title: "Paste Vendor Location",
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
  
    const copyItems = [
      "copy-JobLink",
      "copy-JobTitle",
      "copy-VendorCompany",
      "copy-VendorName",
      "copy-VendorEmail",
      "copy-VendorContact",
      "copy-VendorLocation"
    ];
  
    const pasteItems = [
      "paste-JobLink",
      "paste-JobTitle",
      "paste-VendorCompany",
      "paste-VendorName",
      "paste-VendorEmail",
      "paste-VendorContact",
      "paste-VendorLocation"
    ];
  
    if (copyItems.includes(info.menuItemId)) {
      const type = info.menuItemId.split("-")[1];
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyData,
        args: [type, info]
      });
    } else if (pasteItems.includes(info.menuItemId)) {
      const type = info.menuItemId.split("-")[1];
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: pasteData,
        args: [copiedData[type]]
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