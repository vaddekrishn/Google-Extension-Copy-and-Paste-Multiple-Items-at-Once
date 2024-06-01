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
  
      // Create parent "Copy" menu
      chrome.contextMenus.create({
        id: "copy",
        title: "Copy",
        contexts: ["all"]
      }, onCreated);
  
      // Create sub-menu items under "Copy"
      createMenuItem("copy-JobLink", "➥ Job Link", "copy", getCopiedData("JobLink"));
      createMenuItem("copy-JobTitle", "💼 Job Title", "copy", getCopiedData("JobTitle"));
      createMenuItem("copy-VendorCompany", "🏢 Company", "copy", getCopiedData("VendorCompany"));
      createMenuItem("copy-VendorName", "👤 Name", "copy", getCopiedData("VendorName"));
      createMenuItem("copy-VendorEmail", "📧 Email", "copy", getCopiedData("VendorEmail"));
      createMenuItem("copy-VendorContact", "☎️ Contact", "copy", getCopiedData("VendorContact"));
      createMenuItem("copy-VendorLocation", "🗺️ Location", "copy", getCopiedData("VendorLocation"));
  
      // Create parent "Paste" menu
      chrome.contextMenus.create({
        id: "paste",
        title: "Paste",
        contexts: ["editable"]
      }, onCreated);
  
      // Create sub-menu items under "Paste"
      createMenuItem("paste-JobLink", "➥ Job Link", "paste", getCopiedData("JobLink"));
      createMenuItem("paste-JobTitle", "💼 Job Title", "paste", getCopiedData("JobTitle"));
      createMenuItem("paste-VendorCompany", "🏢 Company", "paste", getCopiedData("VendorCompany"));
      createMenuItem("paste-VendorName", "👤 Name", "paste", getCopiedData("VendorName"));
      createMenuItem("paste-VendorEmail", "📧 Email", "paste", getCopiedData("VendorEmail"));
      createMenuItem("paste-VendorContact", "☎️ Contact", "paste", getCopiedData("VendorContact"));
      createMenuItem("paste-VendorLocation", "🗺️ Location", "paste", getCopiedData("VendorLocation"));
  
      // Create "Reset All Data" menu item
      chrome.contextMenus.create({
        id: "reset",
        title: "Reset All Data",
        contexts: ["all"]
      }, onCreated);
    });
  }
  
  function createMenuItem(id, title, parentId, copiedData) {
    chrome.contextMenus.create({
      id: id,
      title: title + copiedData,
      parentId: parentId,
      contexts: parentId === "copy" ? ["all"] : ["editable"]
    }, onCreated);
  }
  
  function getCopiedData(type) {
    if (copiedData[type]) {
      return ` (${copiedData[type]})`;
    } else {
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
  
    // Remove existing context menu items
    copyItems.forEach(itemId => chrome.contextMenus.remove(itemId));
    pasteItems.forEach(itemId => chrome.contextMenus.remove(itemId));
  
    // Create new context menu items
    copyItems.forEach(itemId => {
      const type = itemId.split("-")[1];
      createMenuItem(itemId, getItemTitle(itemId), "copy", getCopiedData(type));
    });
  
    pasteItems.forEach(itemId => {
      const type = itemId.split("-")[1];
      createMenuItem(itemId, getItemTitle(itemId), "paste", getCopiedData(type));
    });
  }
  
  function getItemTitle(itemId) {
    const type = itemId.split("-")[1];
    switch (type) {
      case "JobLink":
        return "➥ Job Link";
      case "JobTitle":
        return "💼 Job Title";
      case "VendorCompany":
        return "🏢 Company";
      case "VendorName":
        return "👤 Name";
      case "VendorEmail":
        return "📧 Email";
      case "VendorContact":
        return "☎️ Contact";
      case "VendorLocation":
        return "🗺️ Location";
      default:
        return "";
    }
  }
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "storeCopiedData") {
      copiedData[request.type] = request.data;
      updateContextMenus();
    }
  });
  
  chrome.runtime.onInstalled.addListener(createContextMenus);
  chrome.runtime.onStartup.addListener(createContextMenus);