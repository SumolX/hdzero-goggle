var gSelectedDvrFile = '';

function hideElement(element) {
    element.classList.toggle("display-block");
}

function checkEnter(event) {
    if (event.keyCode === 13 || event.key === 'Enter') {
        getAuthorization();
    }
}

function get_ip() {
    (async () => {
        const res = await fetch('/cgi-bin/status?ip', {});
        const text = await res.text();
        document.getElementById("rtsp").innerHTML = "rtsp://" + text + ":8554/hdzero";
    })();
}

function displayError(errMessage) {
    const dialog = document.getElementById("dialog");
    const dbuttons = document.getElementById("d-buttons");
    document.getElementById("d-title").innerHTML = "Error";
    document.getElementById("d-message").innerHTML = errMessage;

    const btn1 = document.createElement("button");
    btn1.innerHTML = "OK"
    btn1.onclick = function () {
        hideElement(dialog);
    }

    dbuttons.appendChild(btn1);
    dialog.style.display = "block";
}

function init_page() {
    const au = document.cookie.split("=")[1];
    const login = document.getElementById("login");
    const logout = document.getElementById("logout");
    get_ip();

    if (au) {
        const console = document.getElementById("console");
        const list = document.getElementById("list");
        console.style.display = "block";
        list.style.display = "block";
        login.style.display = "none";
        logout.style.display = "flex";
        get_list();
    }
    else {
        const player = document.getElementById("player");
        login.style.display = "flex";
        logout.style.display = "none";
        player.style.gridColumn = "span 3";
    }
}

// Login Functionality
function login() {
    window.location = '/login.html';
}

function returnFromLogin() {
    window.location = '/index.html';
}

function togglehover(element) {
    const src = element.childNodes[1].src.substring(element.childNodes[1].src.lastIndexOf('/') + 1);
    if (src === 'HDZLogin.gif') {
        element.childNodes[1].setAttribute('src', 'images/HDZLoginW.gif');
    }
    else if (src === 'HDZLoginW.gif') {
        element.childNodes[1].setAttribute('src', 'images/HDZLogin.gif');
    }
    else if (src === 'HDZLogout.gif') {
        element.childNodes[1].setAttribute('src', 'images/HDZLogoutW.gif');
    }
    else if (src === 'HDZLogoutW.gif') {
        element.childNodes[1].setAttribute('src', 'images/HDZLogout.gif');
    }
}

function getAuthorization() {
    let pswd = "";
    if (document.getElementById("pswd")) {
        pswd = document.getElementById("pswd").value;
    }

    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    };

    fetch('/cgi-bin/status?authenticate=' + pswd, settings).then(res => {
        if (!res.ok) {
            let err = new Error("http status code: " + res.status);
            err.response = res;
            err.status = res.status;
            throw err
        }
        returnFromLogin();
    })
        .catch((err) => {
            displayError(err.message);
        });
}

// Player Functionality
function changeVideoMode(source) {

    player.reset();
    //toggleSelection("");

    (async () => {
        const res = await fetch("/cgi-bin/dvr?stop");
        if (source === "stream") {
            player.src({ type: "application/x-mpegURL", src: "live/hdz.m3u8" });
            player.play();
        } else if (source === "dvr" && gSelectedDvrFile !== "") {
            (async () => {
                const res = await fetch("/cgi-bin/dvr?play=" + gSelectedDvrFile);
                player.src({ type: "application/x-mpegURL", src: "dvr/hdz.m3u8" });
                player.play();
            })();
        }
    })();
}

function selectVideo() {
    gSelectedDvrFile = this.getElementsByTagName("td")[0].innerHTML;
    const ipFileName = document.getElementById("videoname");
    const fName = gSelectedDvrFile.split('.')[0];
    const fType = gSelectedDvrFile.split('.')[1];
    ipFileName.value = fName;
    toggleSelection(fName);

    player.reset;
    player.poster("movies/" + fName + '.jpg');
    player.hasStarted(false);
    player.currentTime(0);
    player.bigPlayButton.hide();
}

// File Listing Functionality
function get_list() {
    const tbody = document.getElementById('list-content');
    while (tbody.firstChild) { tbody.removeChild(tbody.firstChild); }

    (async () => {
        const res = await fetch('/cgi-bin/dvr?', {
            headers: { Accept: 'application/json' },
        });
        const json = await res.json();

        Object.keys(json.dvr).forEach(function (prop) {
            const tr = document.createElement('tr');
            tr.onclick = selectVideo;
            console.log(json.dvr[prop]);
            const msize = Math.round(json.dvr[prop].size / Math.pow(1024, 2), 1);

            tr.innerHTML = '<td>' + json.dvr[prop].file + '</td>' + '<td>' + msize + '<span class=\'fsizeunit\'>MB</span>'
                + '</td>' + '<td>' + json.dvr[prop].date + '</td>';
            tbody.appendChild(tr);
        });
        toggleSelection(null);
    })();
}

function toggleSelection(fName) {
    const tbody = document.getElementById('list-content');

    for (var i = 0, row; row = tbody.rows[i]; i++) {
        if (row.cells[0].innerHTML.split('.')[0] === fName) {
            row.classList.toggle("selected", true);
            row.classList.toggle("highlight", false);
        }
        else if (i % 2 === 0) {
            row.classList.toggle("selected", false);
            row.classList.toggle("highlight", true);
        }
        else {
            row.classList.toggle("selected", false);
            row.classList.toggle("highlight", false);
        }
    }
}

function getSelectedRow() {
    const tbody = document.getElementById('list-content');
    var result = "";

    for (var i = 0, row; row = tbody.rows[i]; i++) {
        if (row.classList.contains("selected")) {
            result = row.cells[0].innerHTML;
            break;
        }
    }
    return result;
}

function modifyFile() {
    const result = confirm("Sure you want to rename?");
    if (result) {
        const toFile = document.getElementById("videoname").value;
        const frFile = getSelectedRow().split('.')[0];
        const ext = getSelectedRow().split('.')[1];

        (async () => {
            const res = await fetch('/cgi-bin/dvr?rename=&fr=' + frFile + "." + ext
                + '&to=' + toFile + "." + ext, {
                headers: { Accept: 'application/text' },
            });
            get_list();
        })();
    } else {
        document.getElementById("videoname").value = getSelectedRow().split('.')[0];
    }
}

function removeFile() {
    const result = confirm("Sure you want to delete?");
    const frFile = getSelectedRow().split('.')[0];
    const ext = getSelectedRow().split('.')[1];
    if (result) {
        (async () => {
            const res = await fetch('/cgi-bin/dvr?delete=&fr=' + frFile + "." + ext, {
                headers: { Accept: 'application/text' },
            });
            get_list();
        })();
    }
}

function downloadFile() {
    const frFile = getSelectedRow();

    (async () => {
        const res = await fetch('/cgi-bin/dvr?download=&fr=' + frFile, {
            headers: { Accept: 'application/x-download' },
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = frFile;
        a.click();
        URL.revokeObjectURL(URL);
    })();
    toggleSelection(null);
    alert("Download will begin shortly!")
}
