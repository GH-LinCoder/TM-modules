// ./utils/getSafeLinkHTML.js
console.log('getSafeLinkHTML.js  loaded');


export function getSafeLinkHTML(externalUrl) {
    console.log('getSafeLinkHTML()');

    if (!externalUrl) return '';

    externalUrl = externalUrl.trim();

    // 1. If the admin pasted a full HTML <iframe> tag, extract the 'src' URL from it
    if (externalUrl.startsWith('<iframe')) {
        const srcMatch = externalUrl.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
            externalUrl = srcMatch[1]; 
        } else {
            return ''; 
        }
    }

    // 2. Safely parse the URL using the native URL constructor
    let parsedUrl;
    try {
        parsedUrl = new URL(externalUrl);
    } catch {
        console.log('Not a valid url', externalUrl);
        // If it's not a valid URL structure, fail safely
        return '';
    }

    // 3. Security check: strictly require http or https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        console.log('Not http or https');
        return '';
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname;

    // Define dedicated host sets
    const YOUTUBE_HOSTS = new Set([
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'music.youtube.com',
        'youtu.be'
    ]);

    const VIMEO_HOSTS = new Set([
        'vimeo.com',
        'www.vimeo.com',
        'player.vimeo.com'
    ]);

    const isYouTube = YOUTUBE_HOSTS.has(hostname);
    const isVimeo = VIMEO_HOSTS.has(hostname);

    let videoId = '';

    // 4. Handle YouTube
    if (isYouTube) {
        console.log('is YouTube', isYouTube);
        if (hostname === 'youtu.be') {
            // Handles https://youtu.be/d1OOWlCzPkU
            videoId = pathname.slice(1); 
            // Check we have 11 characters of video id
            if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) { 
                return ''; 
            }
        } else if (pathname.startsWith('/embed/') || pathname.startsWith('/v/')) {
            // Handles embed links
            videoId = pathname.split('/')[2];
        } else {
            // Handles standard watch links: ?v=d1OOWlCzPkU
            videoId = parsedUrl.searchParams.get('v');
        }

        if (videoId) {
            return `
                <div class="mt-2 w-full max-w-md aspect-video">
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}" 
                        class="w-full h-full rounded-lg border-0 shadow-sm" 
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        allowfullscreen>
                    </iframe>
                </div>`;
        }
    }

    // 5. Handle Vimeo
    if (isVimeo) {         console.log('is Vimeo', isVimeo);
        // Extracts the numerical ID from paths like /123456 or /video/123456
        const segments = pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];

        if (lastSegment && /^\d+$/.test(lastSegment)) {
            return `
                <div class="mt-2 w-full max-w-md aspect-video">
                    <iframe 
                        src="https://player.vimeo.com/video/${lastSegment}" 
                        class="w-full h-full rounded-lg border-0 shadow-sm" 
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        allowfullscreen>
                    </iframe>
                </div>`;
        }
    }
console.log('Not a video. Treat as normal link');
    // 6. Fallback: Standard external website link (Google Docs, external site, etc.)
    return `
        <a href="${externalUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 text-xl hover:underline text-sm inline-flex items-center gap-1 mt-2">
            🔗 There is an External Link to ${parsedUrl.hostname}. Click to open in a new tab
        </a>`;
}
