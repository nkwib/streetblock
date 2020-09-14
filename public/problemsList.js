let completed = [];

function markAsCompleted(i) {
    document.getElementById("block-" + i).classList.add('done')
}

function unMark(i) {
    document.getElementById("block-" + i).classList.remove('done')
}

function writeUserData(uid, i) {
    if (completed.includes(i)) {
        completed = completed.filter(e => e !== i);
    } else {
        completed.push(i);
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", `/markCompleted/${uid}`, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(completed));
    xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            completed.includes(i)? markAsCompleted(i) : unMark(i);
        }
    }
    // console.log(JSON.stringify(completed))
}

function toggleBlock(uid, i) {
    let msg = completed.includes(i) ? 'Vuoi rimuovere il blocco?' : 'Confermi di aver chiuso il blocco?';
    let result = confirm(msg);
    if (result)
        writeUserData(uid, i)
}

function fetchData(uid) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/getCompleted/${uid}`, true); // false for synchronous request
    xhr.onload = function () {
        if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200) {
                completed = JSON.parse(xhr.response || '[]');
                // console.log(uid, completed);
                completed.forEach(b => {
                    markAsCompleted(b);
                })
            } else {
                console.log(xhr.response);
            }
        }
    };
    xhr.send(null);
}

function forgetCookie() {
    let msg = 'Vuoi davvero uscire dalla sessione corrente?';
    let res = confirm(msg);
    if (res) {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", '/deleteCookies', false); // false for synchronous request
        xmlHttp.send(null);
        window.location.href = "/";
    }
}

function goToMap() {
    window.location.href = "/mappa";
}

function goToRanking(uid) {
    window.location.href = `/classifica/${uid}`;
}