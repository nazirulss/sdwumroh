const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Loop 4x
html = html.replace(
  'const loopList = [...list, ...list];',
  '// Quadruple set (4x) for truly seamless continuous marquee on all screen widths\n            const loopList = [...list, ...list, ...list, ...list];'
);

// 2. Card width & aspect ratio
html = html.replace('w-48 sm:w-52 shrink-0 bg-white rounded-3xl', 'w-52 sm:w-56 shrink-0 bg-white rounded-3xl');

// 3. Continuous scroll logic
html = html.replace(
  /track\.scrollLeft\s*\+=\s*1;[\s\S]*?track\.scrollLeft\s*-=\s*halfScroll;\s*}/,
  `track.scrollLeft += 1;
                    const singleSetWidth = track.scrollWidth / 4;
                    if (track.scrollLeft >= singleSetWidth) {
                        track.scrollLeft -= singleSetWidth;
                    } else if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) {
                        track.scrollLeft = 0;
                    }`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('✅ Slider patched in index.html');
