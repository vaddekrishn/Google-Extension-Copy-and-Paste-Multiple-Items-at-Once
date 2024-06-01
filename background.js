let copiedData = {
    JobLink: null,
    JobTitle: null,
    VendorCompany: null,
    VendorName: null,
    VendorEmail: null,
    VendorContact: null,
    VendorLocation: null
  };
  
  let indicators = {};
  
  function createContextMenus() {
    chrome.contextMenus.removeAll(() => {
      console.log("All context menus removed.");
  
      // Create parent "Copy" menu
      chrome.contextMenus.create({
        id: "copy",
        title: "Copy",
        contexts: ["all"]
      }, onCreated);
  
      // Create sub-menu items under "Copy"
      chrome.contextMenus.create({
        id: "copy-JobLink",
        title: "Job Link" + getIndicator("JobLink"),
        parentId: "copy",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-JobTitle",
        title: "Job Title" + getIndicator("JobTitle"),
        parentId: "copy",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-VendorCompany",
        title: "Vendor Company" + getIndicator("VendorCompany"),
        parentId: "copy",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-VendorName",
        title: "Vendor Name" + getIndicator("VendorName"),
        parentId: "copy",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-VendorEmail",
        title: "Vendor Email" + getIndicator("VendorEmail"),
        parentId: "copy",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-VendorContact",
        title: "Vendor Contact" + getIndicator("VendorContact"),
        parentId: "copy",
        contexts: ["all"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "copy-VendorLocation",
        title: "Vendor Location" + getIndicator("VendorLocation"),
        parentId: "copy",
        contexts: ["all"]
      }, onCreated);
  
      // Create parent "Paste" menu
      chrome.contextMenus.create({
        id: "paste",
        title: "Paste",
        contexts: ["editable"]
      }, onCreated);
  
      // Create sub-menu items under "Paste"
      chrome.contextMenus.create({
        id: "paste-JobLink",
        title: "Job Link" + getIndicator("JobLink"),
        parentId: "paste",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-JobTitle",
        title: "Job Title" + getIndicator("JobTitle"),
        parentId: "paste",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-VendorCompany",
        title: "Vendor Company" + getIndicator("VendorCompany"),
        parentId: "paste",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-VendorName",
        title: "Vendor Name" + getIndicator("VendorName"),
        parentId: "paste",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-VendorEmail",
        title: "Vendor Email" + getIndicator("VendorEmail"),
        parentId: "paste",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-VendorContact",
        title: "Vendor Contact" + getIndicator("VendorContact"),
        parentId: "paste",
        contexts: ["editable"]
      }, onCreated);
  
      chrome.contextMenus.create({
        id: "paste-VendorLocation",
        title: "Vendor Location" + getIndicator("VendorLocation"),
        parentId: "paste",
        contexts: ["editable"]
      }, onCreated);
  
      // Create "Reset All Data" menu item
      chrome.contextMenus.create({
        id: "reset",
        title: "Reset All Data",
        contexts: ["all"]
      }, onCreated);
    });
  }
  
  function getIndicator(type) {
    if (copiedData[type]) {
      indicators[type] = " \u25C9"; // Green dot indicator
      return indicators[type];
    } else {
      indicators[type] = "";
      return "";
    }
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
    } else if (info.menuItemId === "reset") {
      resetData();
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
    updateContextMenus();
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
  
  function resetData() {
    copiedData = {
      JobLink: null,
      JobTitle: null,
      VendorCompany: null,
      VendorName: null,
      VendorEmail: null,
      VendorContact: null,
      VendorLocation: null
    };
    updateContextMenus();
    console.log("All data has been reset.");
  }
  
  function updateContextMenus() {
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
  
    copyItems.forEach(itemId => {
      const type = itemId.split("-")[1];
      const title = `${type}${getIndicator(type)}`;
      chrome.contextMenus.update(itemId, { title });
    });
  
    pasteItems.forEach(itemId => {
      const type = itemId.split("-")[1];
      const title = `${type}${getIndicator(type)}`;
      chrome.contextMenus.update(itemId, { title });
    });
  }
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "storeCopiedData") {
      copiedData[request.type] = request.data;
      updateContextMenus();
    }
  });
  
  chrome.runtime.onInstalled.addListener(createContextMenus);
  chrome.runtime.onStartup.addListener(createContextMenus);