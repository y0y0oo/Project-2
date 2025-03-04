const bars = document.querySelectorAll(".bar");

    //移动方块
function move(index, direction) {
    let dark = bars[index].querySelector(".dark");
    let white = bars[index].querySelector(".white");
    let barWidth = bars[index].offsetWidth;
    
        //80-279步长
    let step = Math.floor(Math.random() * 200) + 80;
    let newPos = parseInt(dark.style.left) + direction * step;
    
    if (newPos < 0) newPos = barWidth - 70;
    if (newPos > barWidth - 70) newPos = 0;
    dark.style.left = newPos + "px";
    
    checkCompletion();
}

function checkCompletion() {
    let completed = true;
    bars.forEach(bar => {
        let dark = bar.querySelector(".dark");
        let white = bar.querySelector(".white");
        if (Math.abs(parseInt(dark.style.left) - parseInt(white.style.left)) > 10) {
            completed = false;
        }
    });
    document.getElementById("congrats").classList.toggle("hidden", !completed);
}