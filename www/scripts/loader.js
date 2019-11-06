const __scripts = [
    'ul/TagInput'
];

function loadScripts(){
    return new Promise(resolve => {
        const l = __scripts.length;
        let loadedCount = 0;
        for(let i = 0; i < l; i++){
            const stag = document.createElement('script');
            stag.setAttribute('src', 'scripts/' + __scripts[i] + '.js');
            document.head.appendChild(stag);
            stag.addEventListener('load', () => {
                loadedCount++;
                if(loadedCount >= l) resolve();
            });
        }
    });
}