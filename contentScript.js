const actionableColor = "red";
const notActionableColor = "#444";
const satisfiedColor = "rgb(37, 139, 57)";
const NoStatusText = "Needs Review";;

const getColorForStatus = (statusText, style, isMyPR, isMerged) => {
    style.color = "white";
    if (isMerged) {
        style.backgroundColor = satisfiedColor;
    } else if (statusText === NoStatusText) {
        style.backgroundColor = isMyPR ? notActionableColor : "var(--color-attention-fg)";
        style.color = isMyPR ? "white" : "black";
    } else if (statusText === "Changes requested") {
        style.backgroundColor = isMyPR ? actionableColor : notActionableColor;
    } else if (statusText === "Review required") {
        style.backgroundColor = isMyPR ? satisfiedColor : "orange";
        style.color = isMyPR ? "white" : "black"
    } else if (["Draft", "Abandoned"].indexOf(statusText) !== -1) {
        style.backgroundColor = notActionableColor;
    } else if (statusText === "Approved") {
        style.backgroundColor = satisfiedColor;
    } else {
        style.backgroundColor = "lightcoral";
    }
}

const getStatusText = (statusElement, isMyPR, isMerged, isClosed) => {
    if (isMerged) {
        return "Merged In";
    } else if (isClosed) {
        return "Abandoned";
    } else if (statusElement) {
        return statusElement.innerHTML.trim();
    } else {
        return NoStatusText;
    }
}

const run = () => {
    if (document.querySelector(".opened-by").parentElement.querySelector(".Skeleton")) {
        // Skeleton found, waiting for 50ms and then try again
        setTimeout(() => run(), 50);
        return;
    }

    const canEdit = document.querySelector(".js-issue-row .js-issues-list-check") != null;


    const username = document.querySelector('meta[name="user-login"]').content;
    document.querySelectorAll(".js-issue-row").forEach((row) => {
        const statusElement = row.querySelector(".opened-by").parentElement.children[1].querySelector("a");
        // Element is different for open vs closed PRs so we check both elements
        const authorElement = row.querySelector('a[title^="Open pull requests created"]') || row.querySelector('a[title^="pull requests opened by"]');
        const author = authorElement.innerHTML
        const isMyPR = author === username;
        const isMerged = row.querySelector('span[aria-label="Merged Pull Request"]') != null;
        const isClosed = row.querySelector('span[aria-label="Closed Pull Request"]') != null;
        const statusText = getStatusText(statusElement, isMyPR, isMerged, isClosed);

        // Create the inner dom element
        const el = document.createElement("div");
        el.innerHTML = statusText;
        el.style.textAlign = "center";
        el.style.fontSize = "12px";
        el.style.padding = "2px 6px";
        el.style.borderRadius = "3px";
        el.style.margin = "3px";
        el.style.width = "100px";
        getColorForStatus(statusText, el.style, isMyPR, isMerged);

        // Create the outer dom element
        const wrapper = document.createElement("div");
        wrapper.style.width = "100px";
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "flex-start";
        wrapper.style.justifyContent = "center";
        wrapper.style.marginTop = "7px";
        wrapper.style.marginLeft = "4px";
        wrapper.style.marginRight = "-4px";
        wrapper.append(el)

        // row.children[0].prepend(wrapper)
        // row.querySelector(".opened-by").parentElement.append(el);
        const iconColumn = canEdit ? 1 : 0;
        row.children[0].children[iconColumn].remove();
        row.children[0].insertBefore(wrapper, row.children[0].children[iconColumn]);
    });
}


chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.message === 'urlChanged') {
            setTimeout(() => run(), 50);
        }
    }
);
// Wait 1s after page load
// TODO: Find a better way to detect when the page is fully loaded
// setTimeout(() => run(), 1000);
run();
