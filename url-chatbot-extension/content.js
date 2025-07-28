// Content script that runs on every page
// This script can access the DOM and page content

(function() {
    'use strict';
    
    // Store page information
    let pageInfo = {
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname,
        timestamp: Date.now()
    };

    // Function to extract page content for analysis
    function extractPageContent() {
        // Get main text content
        const textContent = document.body.innerText || '';
        
        // Get meta description
        const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
        
        // Get heading tags
        const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
            .map(h => h.textContent.trim())
            .filter(text => text.length > 0)
            .slice(0, 5); // Limit to first 5 headings
        
        // Get page structure info
        const hasImages = document.images.length > 0;
        const hasVideos = document.querySelectorAll('video').length > 0;
        const hasLinks = document.links.length;
        
        return {
            ...pageInfo,
            textPreview: textContent.substring(0, 1000), // First 1000 chars
            metaDescription,
            headings,
            hasImages,
            hasVideos,
            linkCount: hasLinks,
            wordCount: textContent.split(' ').length
        };
    }

    // Function to get selected text
    function getSelectedText() {
        return window.getSelection().toString().trim();
    }

    // Listen for messages from popup or background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.action) {
            case 'getPageInfo':
                sendResponse(pageInfo);
                break;
                
            case 'getPageContent':
                sendResponse(extractPageContent());
                break;
                
            case 'getSelectedText':
                sendResponse({ selectedText: getSelectedText() });
                break;
                
            case 'highlightText':
                highlightText(request.text);
                sendResponse({ success: true });
                break;
                
            default:
                sendResponse({ error: 'Unknown action' });
        }
    });

    // Function to highlight text on the page
    function highlightText(searchText) {
        if (!searchText) return;
        
        // Remove existing highlights
        removeHighlights();
        
        // Create a TreeWalker to find text nodes
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.textContent.toLowerCase().includes(searchText.toLowerCase())) {
                textNodes.push(node);
            }
        }
        
        // Highlight matching text
        textNodes.forEach(textNode => {
            const parent = textNode.parentNode;
            if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') return;
            
            const text = textNode.textContent;
            const regex = new RegExp(`(${escapeRegExp(searchText)})`, 'gi');
            
            if (regex.test(text)) {
                const highlightedHTML = text.replace(regex, 
                    '<mark style="background-color: #ffeb3b; padding: 2px; border-radius: 2px;">$1</mark>'
                );
                
                const wrapper = document.createElement('span');
                wrapper.innerHTML = highlightedHTML;
                parent.replaceChild(wrapper, textNode);
            }
        });
    }

    // Function to remove highlights
    function removeHighlights() {
        const highlights = document.querySelectorAll('mark[style*="background-color: #ffeb3b"]');
        highlights.forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }

    // Utility function to escape regex special characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Monitor URL changes (for SPAs)
    let currentUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            pageInfo = {
                url: currentUrl,
                title: document.title,
                domain: window.location.hostname,
                timestamp: Date.now()
            };
            
            // Notify background script of URL change
            chrome.runtime.sendMessage({
                action: 'urlChanged',
                url: currentUrl,
                title: document.title
            });
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Add custom styles for the extension
    const style = document.createElement('style');
    style.textContent = `
        .ai-assistant-highlight {
            animation: ai-highlight-pulse 2s ease-in-out;
        }
        
        @keyframes ai-highlight-pulse {
            0% { background-color: transparent; }
            50% { background-color: #ffeb3b; }
            100% { background-color: transparent; }
        }
    `;
    document.head.appendChild(style);

    console.log('AI Web Assistant content script loaded on:', window.location.href);
})();