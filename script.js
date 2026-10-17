for (let i = 0; i < 17; i++) {
    const game_body = document.querySelector(".bricks");
    const colums = 10;

    let row = document.createElement("tr");
    game_body.appendChild(row);

    for (let j = 0; j < colums; j++) {
        const is_blank = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
        let col = document.createElement("td");

        if (is_blank > 6) {
            col.className = "bg-transparent";
        }
        else {
            // TODO : add random color to bricks
            col.className = "brick";
        }
        row.appendChild(col);
        // row.innerHTML += "<td class='brick'></td>";       
    }

}


// Adding a paddle
const paddle = document.querySelector("#paddle");
let left = 0;
const steps = 5;
paddle.style.left = left + "%";

document.addEventListener("keydown", (event) => {

    if (event.key == "ArrowRight" && left < 80) {
        left += steps;
    }
    else if (event.key == "ArrowLeft" && left > 0) {
        left -= steps;
    }
    paddle.style.left = left + "%";
    
})
