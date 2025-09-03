import './Popup.css';

export default function Popup() {
    const openNewTab = () => {
        browser.tabs.create({
            url: browser.runtime.getURL('/MainPage.html'),
        });
    };

    return (
        <>
            <button onClick={openNewTab}>Open Extension Page</button>
        </>
    );
}
