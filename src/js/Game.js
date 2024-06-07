"use strict";

let modes = {
    "friendly": {
        "line": 4,
        "columns": 7,
        "rows": 6,
        "pieces": 21
    },
    "brave": {
        "line": 5,
        "columns": 8,
        "rows": 7,
        "pieces": 32
    },
    "clever": {
        "line": 6,
        "columns": 9,
        "rows": 8,
        "pieces": 45
    },
    "ambitious": {
        "line": 7,
        "columns": 10,
        "rows": 9,
        "pieces": 60
    }
}

const SETTINGS_BOX = document.querySelector("#game-settings");
const GAME_BOX = document.querySelector("#game-box");



/*------------------------- GAME SETTINGS ----------------------------*/
let current_mode = "friendly";  //Default
let player1;
let player2;

/**
 * Function showErrorMsg
 *      Shows an error message by creating a new h5 element in the DOM and deleting it after 2 seconds.
 * @param msg
 */
function showErrorMsg(msg) {
    let section = document.querySelector(".piece-settings");
    let el = document.createElement("h5");
    el.innerHTML = msg;
    section.appendChild(el);

    setTimeout(() => {
        el.innerText = "";
        section.removeChild(el);
    }, 2000);
}

/**
 * Function selectModeBTn:
 *      Displays a different styles for the selected element
 *      (by removing the class to apply from all elements, and adding it to the selected one)
 * @param selectedBtn
 * @param btnsContainer
 */
function selectModeBtn(selectedBtn, btnsContainer) {
    for (const btn of btnsContainer.children) {
        btn.classList.remove("piece-settings-btn-active");
    }
    selectedBtn.classList.add("piece-settings-btn-active");
}

/**
 * Function selectPiece:
 *      Displays different styles for the selected elements
 *      Checks that pieces are not the same. if so, shows an error message
 * @param selectedBtn
 * @param btnsContainer
 * @param player
 */
function selectPiece(selectedBtn, btnsContainer, player) {
    selectModeBtn(selectedBtn, btnsContainer);
    //Saves the selected values...
    ( player === 1 ) ? player1 = selectedBtn.value : player2 = selectedBtn.value;
    //Checks if the select pieces are equal. If so, shows an error message...
    if ( player1 === player2 ) {
        showErrorMsg(`Pick a different House!`);
        //For each button, removes the selection...
        for (const btn of btnsContainer.children) {
            btn.classList.remove("piece-settings-btn-active");
        }
        //Deletes the selected values...
        ( player === 1 ) ? player1 = null : player2 = null;
    }
}

/**
 * Function setFormBtnsEvents:
 *        Sets event listeners for every button in the form, allowing to select mode, piece and play
 */
function setFormBtnsEvents() {
    let modeBtnsContainer = document.querySelector("#mode-setting-btns");
    for (const btn of modeBtnsContainer.children) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            current_mode = btn.value;
            selectModeBtn(btn, modeBtnsContainer);
        });
    }

    let btnsContainer = document.querySelector("#player-1-piece-btns");
    for (const btn of btnsContainer.children) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            selectPiece(btn, btnsContainer, 1)});
    }

    let ScndBtnsContainer = document.querySelector("#player-2-piece-btns");
    for (const btn of ScndBtnsContainer.children) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            selectPiece(btn, ScndBtnsContainer, 2)});
    }

    let startGameBtn = document.querySelector("#play-settings-btn");
    startGameBtn.addEventListener("click", () => {play(false)});
}



/*------------------- GAME FUNCTIONALITY --------------------*/
const CANVAS = document.querySelector("#game-box-canvas");
const MSG_BOX = document.querySelector("#game-msg-div");

const helpBtn = document.querySelector("#help-btn");
helpBtn.addEventListener("click", () => {
    if(GAME_MODAL.classList.contains("active")) {
        removeModalMsg();
    } else {
        GAME_MODAL.classList.add("active");
        let msg = `<div style="text-align: center; font-weight: normal;">
                                <h3>How to play? </h3> 
                                <br>
                                <p>Drag a disc and drop it into the grid, over the column where you want to stack it.</p>
                                <p>Wins the player that first connects ${modes[current_mode].line} pieces upwards, horizontally, or diagonally.</p>                   
                                <ul style="text-align: justify; padding: 2em; font-size:small; font-weight: lighter;">
                                    <li style="list-style-type: disc; ">While dragging, the arrows at the top of the grid will turn <span style="color: yellow">yellow</span>, indicating which column is being selected.</li>
                                    <li style="list-style-type: disc; ">When dropped, the piece will fall from top to bottom of the column, staying in the first free place closest to the bottom.</li>
                                    <li style="list-style-type: disc; ">Drag: Hold clicked a piece with the left button of the mouse, then move the mouse in the direction of the arrow 
                                            pointing the column you want to pick.</li>
                                </ul>
                            </div>`;
        showMsgInModalBox(msg, 10000);
    }
});

const restartBtn = document.querySelector("#restart-btn");
restartBtn.addEventListener("click", () => {
    play(true);
});

const closeBtn = document.querySelector("#close-btn");
closeBtn.addEventListener("click", () => {
    location.href = "../src/index.html";
    setFormBtnsEvents();
});

setFormBtnsEvents();

/*-----------------*/
let board = null;
let current_player;
let next_player;
let isDragging = false;
let selectedPiece;
let selectedPiece_initialPosition;
let selectedColumn;

const GAME_MODAL = document.querySelector("#game-modal");

/*--------------------------- Messages display -------------------------------------*/
function removeModalMsg() {
    GAME_MODAL.classList.remove("active");
}

function showMsgInModalBox(msg, time) {
    GAME_MODAL.classList.add("active");
    GAME_MODAL.innerHTML = msg;
    setTimeout(() => {
        removeModalMsg();
    }, time);
}

function showTurn() {
    if ( MSG_BOX.classList.contains("danger") ) { MSG_BOX.classList.remove("danger"); }
    MSG_BOX.innerHTML = `<p>It's <span class="game-box">${current_player}</span> House's turn</p>`;
}

function showMsgInGameBox(msg, time) {
    MSG_BOX.classList.add("danger");
    MSG_BOX.innerHTML = msg;
    setTimeout(() => { showTurn(); }, time);
}

/*---------------------------------------------------------------------------*/
/**
 * Function setTurn: manages players turns logic
 */
function setTurn() {
    if ( current_player == null ) {
        current_player = player1;
        next_player = player2;
    } else {
        let last_player = current_player;
        current_player = next_player;
        next_player = last_player;
    }
    showTurn(); 
}

/**
 * Function timeOver: If there´s no winner when time is set and time is up, shows a message and restarts the game.
 */
function timeOver() {
    if ( board.getWinner() == null ) {
        let msg = `<p>Time's up, wizards!</p>`;
        showMsgInModalBox(msg, 3000);
        play(true);
    }
}

/*------------------------- Ongoing game/mouse events functionality ----------------------------*/
/**
 * Function onMouseUp:
 *      Checks if a piece is being dragged when the mouse is released, and if there is a piece and column selected.
 *      Then, checks if the column is full and if the play leads to win. If so, shows message.
 *      If it is not the case, redraws the board with the new piece and changes turns.
 */
function onMouseUp(e) {
    if ( !isDragging ) { return; }
    e.preventDefault();
    e.stopPropagation();
    isDragging = false;
    if ( selectedPiece != null && selectedColumn != null ) {
        if ( board.isFull(selectedColumn) ) {
            selectedPiece.setPosition(selectedPiece_initialPosition.x, selectedPiece_initialPosition.y);
            showMsgInModalBox("It's no use doing magic here...The column is full!", 3000);
        } else {
            board.savePlay(selectedPiece, selectedColumn);
            setTimeout(() => {
                let winner = board.checkWinner(selectedPiece, selectedColumn);
                if ( winner == null ) {
                    setTurn(); 
                } else {
                    let msg = `<div>
                                        <img style="opacity: 0.8; border-radius: 100%;" src='../src/images/${winner}.png' />
                                        <p style="text-align: center"><span class="game-box">${winner}</span> wins!</p>
                                       </div>`;
                    showMsgInModalBox(msg, 5000);
                    setTimeout(() => {play(true)}, 5000);
                }}, 1000);        
        }
        board.draw();
    }
}

/**
 * Function onMouseOut: If a piece is being dragged out of the canvas, returns it to its initial place
 */
function onMouseOut(e) {
    if ( !isDragging ) { return; }
    e.preventDefault();
    e.stopPropagation();
    isDragging = false;
    if ( selectedPiece != null ) {
        selectedPiece.setPosition(selectedPiece_initialPosition.x, selectedPiece_initialPosition.y);
        board.draw();
        setTimeout(() => { selectedPiece.setHighlight(false); board.draw(); }, 500);
    }
}

/**
 * Function onMouseMove:
 *      If a piece is being dragged while moving the mouse, its position is refreshed.
 *      If the movement is over a column, the arrow pointing to it is highlighted
 */
function onMouseMove(e) {
    if ( !isDragging ) { return; }
    e.preventDefault();
    e.stopPropagation();
    if ( isDragging && selectedPiece != null ) {
        selectedPiece.setPosition(e.offsetX, e.offsetY);
        selectedColumn = board.findSelectedColumn(e.offsetX, e.offsetY);
        if ( selectedColumn != null ) {
            if ( board.isFull(selectedColumn) ) {
                showMsgInGameBox("No more place here..!", 500);
            } else {
                board.highlightColumn(selectedColumn, true);
            }
        } 
        board.draw();
    }
}

/**
 * Function onMouseDown: If it is the turn of a player, and the player is selecting a piece, saves it and shows it highlighted
 */
function onMouseDown(e) {
    e.preventDefault();
    isDragging = true;
    if ( selectedPiece != null ) {
        selectedPiece.setHighlight(false);
        selectedPiece = null;
    }
    let clickedPiece = board.findSelectedElement(e.offsetX, e.offsetY);
    if ( clickedPiece != null && clickedPiece.getPlayer() === current_player ) {
        selectedPiece_initialPosition = clickedPiece.getPosition();
        if ( !clickedPiece.getIsPlayed() ) {
            selectedPiece = clickedPiece;
            if ( !selectedPiece.isHighlighted() ) {
                selectedPiece.setHighlight(true);
            } else {
                selectedPiece.setPosition(selectedPiece_initialPosition.x, selectedPiece_initialPosition.y);
                selectedPiece.setHighlight(false);
                board.draw();
            }
        } else {
            let msg = `<p>Not even ten thousand spells would move that, <span class="game-box">${current_player}</span>!</p>`;
            showMsgInModalBox(msg, 2000);
        }
    }
    //Highlights the active player, if the inactive one did the move
    if ( clickedPiece != null && clickedPiece.getPlayer() !== current_player ) {
        let span = document.querySelector(".game-box");
        span.classList.add("danger");
        setTimeout( () => { span.classList.remove("danger"); }, 1000);
    }
}

function setGameEvents() {
    CANVAS.addEventListener("mousedown",  (e) => {onMouseDown(e);});
    CANVAS.addEventListener("mouseup",  (e) => {onMouseUp(e);});
    CANVAS.addEventListener("mousemove",  (e) => {onMouseMove(e);});
    CANVAS.addEventListener("mouseout",  (e) => {onMouseOut(e);});
}
/*------------------------------------------------------------------------------------------------*/

/**
 * Function checkSettings: Checks that both players has a piece selected
 */
function checkSettings() {
    if ( player1 == null && player2 == null ) {
        showErrorMsg("Pick your House");
        return false;
    } 
    if ( player1 == null || player2 == null ) {
        showErrorMsg("Pick a rival House");
        return false;
    } 
    return true;   
}

/**
 * Function play:
 *      Checks that the initial form settings has been done,
 *      changes the form view for the game view and
 *      starts the game functionality.
 * @param {*} restart  false: Called by the 'play' button, inits the game
 *                     true: Called by the restart game button, restarts the game
 */
function play(restart) {
    if ( restart || checkSettings() ) {
        //Changes view...
        SETTINGS_BOX.style.display = "none";
        if ( GAME_BOX.classList.contains("display-none") ) { GAME_BOX.classList.remove("display-none"); }
        //Shows timer and board...
        const timer = new Timer( document.querySelector(".timer") );
        board = new Board(modes[current_mode], player1, player2);
        //Sets mouse events and starts...
        setGameEvents();
        //Inits turns...
        setTurn();
    }
}