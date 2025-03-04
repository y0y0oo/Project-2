const lis = document.querySelectorAll('li');
const appBs = document.querySelectorAll('.appB');
const appWs = document.querySelectorAll('.appW');

const clickMapping = { 0: 1, 1: 3, 2: 0, 3: 2 };

    //处理列表项点击事件
function handleLiClick(index) {
    const targetIndex = clickMapping[index];
    const targetLi = lis[targetIndex];
    const targetAppB = targetLi.querySelector('.appB');
    
    if (targetAppB.hasAttribute('data-overlapped')) return;

    const targetAppW = targetLi.querySelector('.appW');
    const [dx, dy] = calculateTranslation(targetLi, targetAppB, targetAppW);
    const randomRatio = 0.8 + Math.random() * 0.2;

    targetAppB.style.transform = `translate(${dx * randomRatio}px, ${dy * randomRatio}px)`;
    targetAppB.addEventListener('transitionend', () => {
        handleTransitionEnd(targetAppB, targetAppW);
    }, { once: true });
}

function calculateTranslation(li, appB, appW) {
    const liRect = li.getBoundingClientRect();
    const appBRect = appB.getBoundingClientRect();
    const appWRect = appW.getBoundingClientRect();

    let dx = appWRect.left - appBRect.left;
    let dy = appWRect.top - appBRect.top;

    const matrix = new DOMMatrixReadOnly(window.getComputedStyle(li).transform);
    const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);

    if (Math.abs(angle) === 90) [dx, dy] = [dy, -dx];
    return [dx, dy];
}

function handleTransitionEnd(appB, appW) {
    if (isOverlap(appB, appW)) {
        appB.setAttribute('data-overlapped', 'true');
        appW.setAttribute('data-occupied', 'true');
        
        if (Array.from(appBs).every(b => b.hasAttribute('data-overlapped'))) {
            alert('Verify that you are not a robot');
        }
    }
}

function isOverlap(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

lis.forEach((li, index) => {
    li.addEventListener('click', () => handleLiClick(index));
});