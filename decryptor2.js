const manifestUri = 'https://pub-eeced94fdab94110a30e8752066fa833.r2.dev/manifest.m3u8';
const keyUrl = 'https://pub-eeced94fdab94110a30e8752066fa833.r2.dev/enc.key';
const ivUrl = 'https://pub-eeced94fdab94110a30e8752066fa833.r2.dev/enc.iv';

async function init() {
    const video = document.querySelector('video[data-shaka-player]');
    const ui = video['ui'];
    const controls = ui.getControls();
    const config = {
        'enableTooltips': true,
        'controlPanelElements': [
            'play_pause',
            'mute',
            'volume',
            'time_and_duration',
            'spacer',
            'fullscreen',
            'playback_rate',],
        'seekBarColors': {
            base: 'rgba(255, 128, 0, 0.4)',
            buffered: 'rgba(255, 255, 255, 0.54)',
            played: 'rgb(0, 255, 255)',
        }
    }
    ui.configure(config);
    const player = controls.getPlayer();
    const errorContainer = document.getElementById('errorContainer');
    window.player = player; // For debugging
    window.ui = ui;        // For debugging

    player.configure({
        manifest: {
            lowLatencyMode: true, // Enable low-latency mode
            defaultPresentationDelay: 0, // Reduce initial delay
        },
        streaming: {
            rebufferingGoal: 0.1, // Aim for very low buffering
            bufferingGoal: 0.5, // Start playback with a small buffer
            safeSeekOffset: 0,  // Allow seeking to the exact position
            // retryParameters: { // Adjust as needed
            //     maxAttempts: 5,
            //     baseDelay: 100, 
            //     backoffFactor: 2,
            //     fuzzFactor: 0.5 
            // }
        },
        abr: {
            enabled: true, // Adapt to network conditions (if applicable)
        }
    });
    // Decryption filter
    player.getNetworkingEngine().registerResponseFilter(async (type, response) => {
        if (type === shaka.net.NetworkingEngine.RequestType.SEGMENT) {
            try {
                const [key, iv] = await Promise.all([fetchKey(keyUrl), fetchIV(ivUrl)]);
                const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CTR' }, false, ['decrypt']);
                response.data = await crypto.subtle.decrypt({ name: 'AES-CTR', counter: iv, length: 64 }, cryptoKey, response.data);
            } catch (error) {
                showError(`Decryption Error: ${error.message}`, errorContainer);
                throw error; 
            }
        }
    });

    player.load(manifestUri)
    .then(() => console.log('Video loaded successfully!'))
    .catch(error => showError(`Error loading video: ${getShakaErrorMessage(error)}`));

// Fetch key function (adjust for your authentication/storage method if needed)
async function fetchKey(url) {
    const response = await fetch(url); // Or use your own fetching method
    if (!response.ok) {
        throw new Error(`Failed to fetch key from ${url}: ${response.status} ${response.statusText}`);
    }
    return await response.arrayBuffer();
}

// Fetch IV function (adjust if you use a different IV delivery mechanism)
async function fetchIV(url) {
    const response = await fetch(url); // Or use your own fetching method
    if (!response.ok) {
        throw new Error(`Failed to fetch IV from ${url}: ${response.status} ${response.statusText}`);
    }
    const ivHex = await response.text();
    return new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

    // ---End Fetch Functions---

    // --- Error and Helper Functions ---
    function showError(message, errorContainer) {
        console.error(message);
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
    }
    function createCustomButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('custom-button');
        button.addEventListener('click', onClick);
        return button;
    }

    function getShakaErrorMessage(error) {
        if (error.code) {
            return `${error.code} - ${error.message}`;
        } else {
            return error.message || 'Unknown error';
        }
    }
}

// Event Listeners
document.addEventListener('shaka-ui-loaded', init);
document.addEventListener('shaka-ui-load-failed', initFailed);

function initFailed(errorEvent) {
    console.error('Unable to load the UI library!', errorEvent.detail);
}


// --- End Video Controls and Functionality ---
